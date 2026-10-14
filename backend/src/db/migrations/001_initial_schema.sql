create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  external_id integer unique,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  discount_percentage numeric not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  rating numeric check (rating is null or (rating >= 0 and rating <= 5)),
  stock integer not null default 0 check (stock >= 0),
  brand text,
  sku text not null unique,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id),
  product_id uuid not null references products(id),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text,
  shipping_postal_code text,
  shipping_city text,
  shipping_country text,
  total_price numeric not null check (total_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  product_id uuid references products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null check (price_at_purchase >= 0),
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_active_name_idx on products(is_active, name);
create index if not exists cart_items_cart_id_idx on cart_items(cart_id);
create index if not exists cart_items_product_id_idx on cart_items(product_id);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists orders_created_at_idx on orders(created_at desc);
