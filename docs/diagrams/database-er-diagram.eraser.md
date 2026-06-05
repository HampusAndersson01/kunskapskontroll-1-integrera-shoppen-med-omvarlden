title E-Commerce Platform Data Model

notation crows-foot

users [icon: user, color: blue] {
  id string pk
  email string unique
  password_hash string
  role string
  created_at timestamp
  updated_at timestamp
}

categories [icon: folder, color: purple] {
  id string pk
  name string
  slug string unique 
  created_at timestamp
  updated_at timestamp
}

products [icon: package, color: purple] {
  id string pk
  external_id string unique 
  category_id string fk
  name string
  description string
  price decimal
  discount_percentage decimal
  rating decimal
  stock integer
  brand string
  sku string unique 
  image_url string
  created_at timestamp
  updated_at timestamp
}

carts [icon: shopping-cart, color: yellow] {
  id string pk
  user_id string fk
  created_at timestamp
  updated_at timestamp
}

cart_items [icon: list, color: yellow] {
  id string pk
  cart_id string fk
  product_id string fk
  quantity integer
  created_at timestamp
  updated_at timestamp
}

orders [icon: file-text, color: green] {
  id string pk
  user_id string fk
  customer_name string
  customer_email string
  total_price decimal
  status string
  created_at timestamp
  updated_at timestamp
}

order_items [icon: list, color: green] {
  id string pk
  order_id string fk
  product_id string fk
  product_name string
  quantity integer
  price_at_purchase decimal
  created_at timestamp
  updated_at timestamp
}

categories.id < products.category_id
users.id - carts.user_id
carts.id < cart_items.cart_id
products.id < cart_items.product_id
users.id < orders.user_id
orders.id < order_items.order_id
products.id < order_items.product_id