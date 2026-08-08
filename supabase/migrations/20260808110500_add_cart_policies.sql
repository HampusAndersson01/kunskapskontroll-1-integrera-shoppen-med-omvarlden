alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

drop policy if exists "Users can read own cart" on public.carts;
create policy "Users can read own cart"
on public.carts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create own cart" on public.carts;
create policy "Users can create own cart"
on public.carts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own cart" on public.carts;
create policy "Users can update own cart"
on public.carts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own cart" on public.carts;
create policy "Users can delete own cart"
on public.carts
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own cart items" on public.cart_items;
create policy "Users can read own cart items"
on public.cart_items
for select
to authenticated
using (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Users can create own cart items" on public.cart_items;
create policy "Users can create own cart items"
on public.cart_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own cart items" on public.cart_items;
create policy "Users can update own cart items"
on public.cart_items
for update
to authenticated
using (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own cart items" on public.cart_items;
create policy "Users can delete own cart items"
on public.cart_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = auth.uid()
  )
);
