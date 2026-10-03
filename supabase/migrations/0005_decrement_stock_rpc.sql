alter table public.orders add column if not exists stock_decremented boolean not null default false;

create or replace function public.decrement_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_caller_role text := auth.role();
  item record;
  current_qty integer;
begin
  select id, user_id, status, stock_decremented
    into v_order
    from public.orders
    where id = p_order_id
    for update;

  if v_order.id is null then
    raise exception 'Order not found';
  end if;

  if v_caller_role <> 'service_role' then
    if auth.uid() is null or auth.uid() <> v_order.user_id then
      raise exception 'Not authorized to modify stock for this order';
    end if;
    if v_order.status <> 'confirmed' then
      raise exception 'Order is not in a state that permits stock decrement';
    end if;
  end if;

  if v_order.stock_decremented then
    return;
  end if;

  for item in select product_id, size, quantity from public.order_items where order_id = p_order_id loop
    select stock_quantity into current_qty
      from public.product_sizes
      where product_id = item.product_id and size = item.size
      for update;

    if current_qty is not null then
      update public.product_sizes
        set stock_quantity = greatest(0, current_qty - item.quantity)
        where product_id = item.product_id and size = item.size;
    end if;
  end loop;

  update public.orders set stock_decremented = true where id = p_order_id;
end;
$$;

revoke execute on function public.decrement_stock_for_order(uuid) from public;
revoke execute on function public.decrement_stock_for_order(uuid) from anon;
grant execute on function public.decrement_stock_for_order(uuid) to authenticated;
grant execute on function public.decrement_stock_for_order(uuid) to service_role;
