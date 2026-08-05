title E-Commerce Platform Data Model

notation crows-foot

auth_users [icon: user, color: blue] {
  id uuid pk
}

profiles [icon: user, color: blue] {
  id uuid pk
  email string unique
  role string
  created_at timestamptz
  updated_at timestamptz
}

categories [icon: folder, color: purple] {
  id uuid pk
  name string unique
  slug string unique
  created_at timestamptz
  updated_at timestamptz
}

products [icon: package, color: purple] {
  id uuid pk
  external_id integer unique
  category_id uuid fk
  name string
  description string
  price decimal(10,2)
  discount_percentage decimal(5,2)
  rating decimal(2,1)
  stock integer
  brand string
  sku string unique
  image_url string
  is_active boolean
  created_at timestamptz
  updated_at timestamptz
}

carts [icon: shopping-cart, color: yellow] {
  id uuid pk
  user_id uuid fk unique
  created_at timestamptz
  updated_at timestamptz
}

cart_items [icon: list, color: yellow] {
  id uuid pk
  cart_id uuid fk
  product_id uuid fk
  quantity integer
  created_at timestamptz
  updated_at timestamptz
}

orders [icon: file-text, color: green] {
  id uuid pk
  user_id uuid fk
  customer_name string
  customer_email string
  total_price decimal(10,2)
  status string
  created_at timestamptz
  updated_at timestamptz
}

order_items [icon: list, color: green] {
  id uuid pk
  order_id uuid fk
  product_id uuid fk
  product_name string
  quantity integer
  price_at_purchase decimal(10,2)
  created_at timestamptz
}

auth_users.id - profiles.id
auth_users.id - carts.user_id
auth_users.id < orders.user_id
categories.id < products.category_id
carts.id < cart_items.cart_id
products.id < cart_items.product_id
orders.id < order_items.order_id
products.id < order_items.product_id
