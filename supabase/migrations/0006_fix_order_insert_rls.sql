drop policy if exists "orders_insert_own_pending" on public.orders;
create policy "orders_insert_own" on public.orders for insert
  with check (auth.uid() = user_id and status in ('pending','confirmed'));

drop policy if exists "order_items_insert_own_pending_order" on public.order_items;
create policy "order_items_insert_own_order" on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid() and o.status in ('pending','confirmed')
    )
  );
