create table public.profiles (
  id uuid not null,
  email text unique,
  role text not null default 'customer'::text check (role = any (array['customer'::text, 'admin'::text])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users(id)
);

create table public.categories (
  id uuid not null default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_pkey primary key (id)
);

create table public.products (
  id uuid not null default gen_random_uuid(),
  external_id integer unique,
  category_id uuid,
  name text not null,
  description text,
  price numeric not null check (price >= 0::numeric),
  discount_percentage numeric not null default 0 check (
    discount_percentage >= 0::numeric
    and discount_percentage <= 100::numeric
  ),
  rating numeric check (
    rating is null
    or rating >= 0::numeric
    and rating <= 5::numeric
  ),
  stock integer not null default 0 check (stock >= 0),
  brand text,
  sku text not null unique,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign key (category_id) references public.categories(id)
);

create table public.carts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_pkey primary key (id),
  constraint carts_user_id_fkey foreign key (user_id) references auth.users(id)
);

create table public.cart_items (
  id uuid not null default gen_random_uuid(),
  cart_id uuid not null,
  product_id uuid not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_pkey primary key (id),
  constraint cart_items_cart_id_fkey foreign key (cart_id) references public.carts(id),
  constraint cart_items_product_id_fkey foreign key (product_id) references public.products(id)
);

create table public.orders (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  customer_name text not null,
  customer_email text not null,
  total_price numeric not null check (total_price >= 0::numeric),
  status text not null default 'pending'::text check (
    status = any (
      array[
        'pending'::text,
        'confirmed'::text,
        'processing'::text,
        'shipped'::text,
        'delivered'::text,
        'cancelled'::text,
        'refunded'::text
      ]
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_user_id_fkey foreign key (user_id) references auth.users(id)
);

create table public.order_items (
  id uuid not null default gen_random_uuid(),
  order_id uuid not null,
  product_id uuid,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null check (price_at_purchase >= 0::numeric),
  created_at timestamptz not null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign key (order_id) references public.orders(id),
  constraint order_items_product_id_fkey foreign key (product_id) references public.products(id)
);
