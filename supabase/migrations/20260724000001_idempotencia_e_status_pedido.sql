-- Idempotência forte na criação e transições controladas de pedidos.
--
-- Esta migration substitui a RPC pública de criação por uma assinatura que
-- exige uma chave UUID por tentativa lógica de checkout. A mesma chave é
-- segura para retries: apenas uma confirmação e suas linhas de pedido são
-- criadas, inclusive quando duas requisições chegam concorrentemente.
-- Reuso da chave com payload divergente falha com P0001 e detail
-- IDEMPOTENCY_PAYLOAD_CONFLICT; clientes devem iniciar um novo checkout.

begin;

-- Linhas históricas recebem uma chave gerada; chamadas novas devem informar a
-- própria chave na RPC. O índice único é a garantia durável de idempotência.
alter table public.confirmacoes_pedido
  add column if not exists chave_idempotencia uuid default gen_random_uuid();

-- md5 é função nativa do PostgreSQL, portanto esta migration não depende de
-- pgcrypto estar instalado no schema extensions. A intenção canônica também é
-- armazenada e comparada integralmente, portanto uma colisão de hash não
-- aceita payload divergente.
alter table public.confirmacoes_pedido
  add column if not exists intencao_pedido text;

alter table public.confirmacoes_pedido
  add column if not exists intencao_hash text;

update public.confirmacoes_pedido
set
  chave_idempotencia = coalesce(chave_idempotencia, gen_random_uuid()),
  intencao_pedido = coalesce(
    intencao_pedido,
    jsonb_build_object('confirmacao_legada_id', id)::text
  )
where chave_idempotencia is null
   or intencao_pedido is null;

update public.confirmacoes_pedido
set intencao_hash = md5(intencao_pedido)
where intencao_hash is null;

alter table public.confirmacoes_pedido
  alter column chave_idempotencia set not null,
  alter column intencao_pedido set not null,
  alter column intencao_hash set not null;

create unique index if not exists confirmacoes_pedido_chave_idempotencia_uidx
  on public.confirmacoes_pedido (chave_idempotencia);

comment on column public.confirmacoes_pedido.chave_idempotencia is
  'UUID informado pelo cliente para tornar retries do checkout idempotentes.';

comment on column public.confirmacoes_pedido.intencao_pedido is
  'Representação canônica do payload vinculada à chave de idempotência.';

comment on column public.confirmacoes_pedido.intencao_hash is
  'Hash MD5 da intenção; a comparação também usa a intenção integral.';

-- A assinatura sem chave não pode continuar sendo uma porta pública de criação.
-- Removê-la evita que clientes desatualizados contornem a garantia de
-- idempotência; a nova RPC abaixo é a única assinatura concedida.
revoke all on function public.criar_pedido_confirmado(text, text, jsonb)
  from public, anon, authenticated;
drop function public.criar_pedido_confirmado(text, text, jsonb);

create function public.criar_pedido_confirmado(
  p_nome_cliente text,
  p_telefone text,
  p_itens jsonb,
  p_chave_idempotencia uuid
)
returns table (
  confirmacao_id uuid,
  codigo_retirada text,
  expira_em timestamptz,
  total numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_telefone text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  v_item record;
  v_produto record;
  v_confirmacao_id uuid;
  v_confirmacao public.confirmacoes_pedido%rowtype;
  v_codigo text;
  v_total numeric(12,2) := 0;
  v_nome_cliente_normalizado text;
  v_intencao_pedido text;
  v_intencao_hash text;
begin
  if p_chave_idempotencia is null then
    raise exception 'Chave de idempotência é obrigatória' using errcode = 'P0001';
  end if;

  -- jsonb::text é canônico para o mesmo valor JSONB. Junto com nome e telefone
  -- normalizados, forma a intenção estável que a chave pode representar.
  v_nome_cliente_normalizado := lower(regexp_replace(
    btrim(coalesce(p_nome_cliente, '')), '\s+', ' ', 'g'
  ));
  v_intencao_pedido := jsonb_build_object(
    'nome_cliente', v_nome_cliente_normalizado,
    'telefone', v_telefone,
    'itens', p_itens
  )::text;
  v_intencao_hash := md5(v_intencao_pedido);

  select c.* into v_confirmacao
  from public.confirmacoes_pedido c
  where c.chave_idempotencia = p_chave_idempotencia;
  if found then
    if v_confirmacao.intencao_hash <> v_intencao_hash
      or v_confirmacao.intencao_pedido <> v_intencao_pedido then
      raise exception 'Chave de idempotência já foi usada com outro pedido'
        using errcode = 'P0001', detail = 'IDEMPOTENCY_PAYLOAD_CONFLICT';
    end if;

    return query
      select v_confirmacao.id, v_confirmacao.codigo_retirada,
        v_confirmacao.expira_em, v_confirmacao.total;
    return;
  end if;

  if nullif(btrim(p_nome_cliente), '') is null then
    raise exception 'Nome do cliente é obrigatório' using errcode = 'P0001';
  end if;

  if v_telefone !~ '^[0-9]{10,11}$' then
    raise exception 'Telefone inválido' using errcode = 'P0001';
  end if;

  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'Informe ao menos um item' using errcode = 'P0001';
  end if;

  for v_item in
    select * from jsonb_to_recordset(p_itens) as item(produto_id uuid, quantidade integer)
  loop
    if v_item.produto_id is null or v_item.quantidade is null
      or v_item.quantidade < 1 or v_item.quantidade > 20 then
      raise exception 'Item de pedido inválido' using errcode = 'P0001';
    end if;

    select id, valor into v_produto
    from public.produtos
    where id = v_item.produto_id;

    if not found then
      raise exception 'Produto não encontrado' using errcode = 'P0002';
    end if;

    v_total := v_total + (v_produto.valor * v_item.quantidade);
  end loop;

  v_codigo := public.gerar_codigo_retirada();

  -- ON CONFLICT serializa a corrida entre requisições com a mesma chave. A
  -- vencedora cria a confirmação; a perdedora busca e devolve a mesma linha.
  insert into public.confirmacoes_pedido (
    nome_cliente,
    telefone_normalizado,
    codigo_retirada,
    total,
    expira_em,
    chave_idempotencia,
    intencao_pedido,
    intencao_hash
  ) values (
    btrim(p_nome_cliente),
    v_telefone,
    v_codigo,
    v_total,
    now() + interval '2 hours',
    p_chave_idempotencia,
    v_intencao_pedido,
    v_intencao_hash
  )
  on conflict (chave_idempotencia) do nothing
  returning id into v_confirmacao_id;

  if v_confirmacao_id is null then
    select c.* into v_confirmacao
    from public.confirmacoes_pedido c
    where c.chave_idempotencia = p_chave_idempotencia;

    if not found then
      raise exception 'Não foi possível recuperar o retry do pedido' using errcode = 'P0003';
    end if;

    if v_confirmacao.intencao_hash <> v_intencao_hash
      or v_confirmacao.intencao_pedido <> v_intencao_pedido then
      raise exception 'Chave de idempotência já foi usada com outro pedido'
        using errcode = 'P0001', detail = 'IDEMPOTENCY_PAYLOAD_CONFLICT';
    end if;

    return query
      select v_confirmacao.id, v_confirmacao.codigo_retirada,
        v_confirmacao.expira_em, v_confirmacao.total;
    return;
  end if;

  for v_item in
    select * from jsonb_to_recordset(p_itens) as item(produto_id uuid, quantidade integer)
  loop
    select valor into v_produto
    from public.produtos
    where id = v_item.produto_id;

    insert into public.pedidos (
      nome_cliente, produto_id, senha_retirar_ped, telefone, total, confirmacao_id
    )
    select btrim(p_nome_cliente), v_item.produto_id, v_codigo, v_telefone,
      v_produto.valor, v_confirmacao_id
    from generate_series(1, v_item.quantidade);
  end loop;

  return query
    select c.id, c.codigo_retirada, c.expira_em, c.total
    from public.confirmacoes_pedido c
    where c.id = v_confirmacao_id;
end;
$$;

revoke all on function public.criar_pedido_confirmado(text, text, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.criar_pedido_confirmado(text, text, jsonb, uuid)
  to anon, authenticated;

-- A operação administrativa modifica exclusivamente a coluna status. O
-- estado esperado faz a atualização ser compare-and-set, evitando que uma
-- tela admin sobrescreva uma alteração concorrente.
create or replace function public.atualizar_status_pedido_admin(
  p_pedido_id uuid,
  p_status_esperado text,
  p_novo_status text
)
returns public.pedidos
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pedido public.pedidos%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Acesso administrativo necessário' using errcode = '42501';
  end if;

  if p_pedido_id is null
    or p_status_esperado not in ('criado', 'em_preparo', 'pronto', 'finalizado', 'cancelado')
    or p_novo_status not in ('criado', 'em_preparo', 'pronto', 'finalizado', 'cancelado') then
    raise exception 'Status de pedido inválido' using errcode = 'P0001';
  end if;

  if not (
    (p_status_esperado = 'criado' and p_novo_status in ('em_preparo', 'cancelado'))
    or (p_status_esperado = 'em_preparo' and p_novo_status in ('pronto', 'cancelado'))
    or (p_status_esperado = 'pronto' and p_novo_status = 'finalizado')
  ) then
    raise exception 'Transição de status não permitida' using errcode = 'P0001';
  end if;

  update public.pedidos p
  set status = p_novo_status
  where p.id = p_pedido_id
    and p.status = p_status_esperado
  returning p.* into v_pedido;

  if not found then
    raise exception 'Pedido inexistente ou status desatualizado' using errcode = 'P0002';
  end if;

  return v_pedido;
end;
$$;

-- Mesmo administradores autenticados precisam usar a RPC acima: o RLS pode
-- permanecer para leitura, mas não há privilégio de UPDATE direto na tabela.
revoke update on table public.pedidos from authenticated;
revoke all on function public.atualizar_status_pedido_admin(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.atualizar_status_pedido_admin(uuid, text, text)
  to authenticated;

comment on function public.atualizar_status_pedido_admin(uuid, text, text) is
  'Atualiza somente status para administradores, com status esperado e transições permitidas.';

commit;
