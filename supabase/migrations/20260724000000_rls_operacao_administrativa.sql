-- RLS da operação administrativa.
-- Reproduz no repositório as permissões aplicadas no Supabase em 2026-07-24.
-- Pré-requisito: public.is_admin() verifica public.perfis.papel = 'admin'.

begin;

alter function public.is_admin() set search_path = '';
alter function public.gerar_codigo_retirada() set search_path = '';
alter function public.criar_pedido_confirmado(text, text, jsonb) set search_path = '';
alter function public.recuperar_confirmacao_pedido(uuid, text) set search_path = '';

revoke all on table public.pedidos from anon;
revoke insert, delete on table public.pedidos from authenticated;
grant select, update on table public.pedidos to authenticated;

drop policy if exists "admin le pedidos" on public.pedidos;
create policy "admin le pedidos"
on public.pedidos
for select
to authenticated
using (public.is_admin());

drop policy if exists "admin atualiza pedidos" on public.pedidos;
create policy "admin atualiza pedidos"
on public.pedidos
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on table public.produtos to anon, authenticated;
grant insert, update, delete on table public.produtos to authenticated;

drop policy if exists "admin cria produtos" on public.produtos;
create policy "admin cria produtos"
on public.produtos
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admin atualiza produtos" on public.produtos;
create policy "admin atualiza produtos"
on public.produtos
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on table public.confirmacoes_pedido from anon, authenticated;

revoke all on function public.gerar_codigo_retirada() from public, anon, authenticated;
revoke all on function public.criar_pedido_confirmado(text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.recuperar_confirmacao_pedido(uuid, text)
  from public, anon, authenticated;

grant execute on function public.criar_pedido_confirmado(text, text, jsonb)
  to anon, authenticated;
grant execute on function public.recuperar_confirmacao_pedido(uuid, text)
  to anon, authenticated;

commit;
