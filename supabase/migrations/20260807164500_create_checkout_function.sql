alter table public.orders
add column if not exists customer_phone text,
add column if not exists shipping_address text,
add column if not exists shipping_postal_code text,
add column if not exists shipping_city text,
add column if not exists shipping_country text;

create or replace function public.create_order_with_items(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_shipping_postal_code text,
  p_shipping_city text,
  p_shipping_country text,
  p_items jsonb
)
returns table (
  id uuid,
  total_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  calculated_total numeric := 0;
  requested_count integer := 0;
  priced_count integer := 0;
begin
  if length(trim(p_customer_name)) = 0 then
    raise exception 'Customer name is required';
  end if;

  if length(trim(p_customer_email)) = 0 then
    raise exception 'Customer email is required';
  end if;

  if length(trim(p_customer_phone)) = 0 then
    raise exception 'Customer phone is required';
  end if;

  if length(trim(p_shipping_address)) = 0 then
    raise exception 'Shipping address is required';
  end if;

  if length(trim(p_shipping_postal_code)) = 0 then
    raise exception 'Shipping postal code is required';
  end if;

  if length(trim(p_shipping_city)) = 0 then
    raise exception 'Shipping city is required';
  end if;

  if length(trim(p_shipping_country)) = 0 then
    raise exception 'Shipping country is required';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required';
  end if;

  with requested_items as (
    select
      (item->>'product_id')::uuid as product_id,
      (item->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  ),
  priced_items as (
    select
      products.id,
      products.name,
      products.price,
      requested_items.quantity,
      products.price * requested_items.quantity as line_total
    from requested_items
    join public.products on products.id = requested_items.product_id
    where products.is_active = true
      and requested_items.quantity > 0
      and requested_items.quantity <= products.stock
  )
  select coalesce(sum(line_total), 0)
  into calculated_total
  from priced_items;

  select count(*)
  into requested_count
  from jsonb_array_elements(p_items);

  with requested_items as (
    select
      (item->>'product_id')::uuid as product_id,
      (item->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as item
  )
  select count(*)
  into priced_count
  from requested_items
  join public.products on products.id = requested_items.product_id
  where products.is_active = true
    and requested_items.quantity > 0
    and requested_items.quantity <= products.stock;

  if calculated_total <= 0 or priced_count <> requested_count then
    raise exception 'No valid order items';
  end if;

  insert into public.orders (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    shipping_postal_code,
    shipping_city,
    shipping_country,
    total_price,
    status
  )
  values (
    auth.uid(),
    trim(p_customer_name),
    trim(p_customer_email),
    trim(p_customer_phone),
    trim(p_shipping_address),
    trim(p_shipping_postal_code),
    trim(p_shipping_city),
    trim(p_shipping_country),
    calculated_total,
    'pending'
  )
  returning orders.id into new_order_id;

  insert into public.order_items (order_id, product_id, product_name, quantity, price_at_purchase)
  select
    new_order_id,
    priced_items.id,
    priced_items.name,
    priced_items.quantity,
    priced_items.price
  from (
    select
      products.id,
      products.name,
      products.price,
      requested_items.quantity
    from (
      select
        (item->>'product_id')::uuid as product_id,
        (item->>'quantity')::integer as quantity
      from jsonb_array_elements(p_items) as item
    ) as requested_items
    join public.products on products.id = requested_items.product_id
    where products.is_active = true
      and requested_items.quantity > 0
      and requested_items.quantity <= products.stock
  ) as priced_items;

  return query
  select new_order_id, calculated_total;
end;
$$;

grant execute on function public.create_order_with_items(text, text, text, text, text, text, text, jsonb) to anon, authenticated;
