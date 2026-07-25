-- Confirmação de pedido autoritativa para a Cafeteria Sô Zé.
-- Aplicar primeiro em um projeto Supabase de teste.

create table if not exists public.confirmacoes_pedido (
  id uuid primary key default gen_random_uuid(),
  nome_cliente text not null,
  telefone_normalizado text not null check (telefone_normalizado ~ '^[0-9]{10,11}$'),
  codigo_retirada text not null check (codigo_retirada ~ '^[0-9]{6}$'),
  total numeric(12,2) not null check (total >= 0),
  criado_em timestamptz not null default now(),
  expira_em timestamptz not null,
  cancelado_em timestamptz,
  constraint confirmacoes_pedido_expiracao_check check (expira_em > criado_em)
);

alter table public.pedidos
  add column if not exists confirmacao_id uuid references public.confirmacoes_pedido(id);

create index if not exists pedidos_confirmacao_id_idx
  on public.pedidos (confirmacao_id);

create index if not exists confirmacoes_pedido_codigo_ativo_idx
  on public.confirmacoes_pedido (codigo_retirada, expira_em)
  where cancelado_em is null;

alter table public.confirmacoes_pedido enable row level security;

revoke all on table public.confirmacoes_pedido from anon, authenticated;
revoke insert on table public.pedidos from anon, authenticated;

create or replace function public.gerar_codigo_retirada()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
  v_tentativa integer := 0;
begin
  loop
    v_tentativa := v_tentativa + 1;
    if v_tentativa > 20 then
      raise exception 'Não foi possível gerar um código de retirada' using errcode = 'P0003';
    end if;

    v_codigo := lpad((floor(random() * 1000000))::integer::text, 6, '0');
    perform pg_advisory_xact_lock(hashtext(v_codigo));

    if not exists (
      select 1
      from public.confirmacoes_pedido
      where codigo_retirada = v_codigo
        and cancelado_em is null
        and expira_em > now()
    ) then
      return v_codigo;
    end if;
  end loop;
end;
$$;

create or replace function public.criar_pedido_confirmado(
  p_nome_cliente text,
  p_telefone text,
  p_itens jsonb
)
returns table (
  confirmacao_id uuid,
  codigo_retirada text,
  expira_em timestamptz,
  total numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_telefone text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  v_item record;
  v_produto record;
  v_confirmacao_id uuid;
  v_codigo text;
  v_total numeric(12,2) := 0;
begin
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

  insert into public.confirmacoes_pedido (
    nome_cliente, telefone_normalizado, codigo_retirada, total, expira_em
  ) values (
    btrim(p_nome_cliente), v_telefone, v_codigo, v_total, now() + interval '2 hours'
  ) returning id into v_confirmacao_id;

  for v_item in
    select * from jsonb_to_recordset(p_itens) as item(produto_id uuid, quantidade integer)
  loop
    select valor into v_produto from public.produtos where id = v_item.produto_id;

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

create or replace function public.recuperar_confirmacao_pedido(
  p_confirmacao_id uuid,
  p_codigo_retirada text
)
returns table (
  confirmacao_id uuid,
  nome_cliente text,
  codigo_retirada text,
  expira_em timestamptz,
  total numeric,
  itens jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.nome_cliente,
    c.codigo_retirada,
    c.expira_em,
    c.total,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'produto_id', p.produto_id,
          'nome', produto.nome,
          'imagem', produto.imagem,
          'quantidade', p.quantidade,
          'valor_unitario', p.valor_unitario
        ) order by produto.nome
      ) filter (where p.produto_id is not null),
      '[]'::jsonb
    )
  from public.confirmacoes_pedido c
  left join (
    select confirmacao_id, produto_id, count(*)::integer as quantidade, max(total) as valor_unitario
    from public.pedidos
    group by confirmacao_id, produto_id
  ) p on p.confirmacao_id = c.id
  left join public.produtos produto on produto.id = p.produto_id
  where c.id = p_confirmacao_id
    and c.codigo_retirada = p_codigo_retirada
    and c.cancelado_em is null
    and c.expira_em > now()
  group by c.id, c.nome_cliente, c.codigo_retirada, c.expira_em, c.total;
$$;

revoke all on function public.gerar_codigo_retirada() from public;
grant execute on function public.criar_pedido_confirmado(text, text, jsonb) to anon, authenticated;
grant execute on function public.recuperar_confirmacao_pedido(uuid, text) to anon, authenticated;
