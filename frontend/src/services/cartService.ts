import type { CartItem } from "../cart/CartContext";
import { supabase } from "../lib/supabase";

type CartRow = {
  id: string;
};

type CartItemRow = {
  quantity: number;
  products:
    | {
        id: string;
        name: string;
        price: number | string;
        image_url: string | null;
        stock: number;
      }
    | Array<{
        id: string;
        name: string;
        price: number | string;
        image_url: string | null;
        stock: number;
      }>
    | null;
};

export async function getOrCreateCart(userId: string) {
  const { data: existingCart, error: selectError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle<CartRow>();

  if (selectError) {
    throw selectError;
  }

  if (existingCart) {
    return existingCart.id;
  }

  const { data: newCart, error: insertError } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single<CartRow>();

  if (insertError || !newCart) {
    throw insertError ?? new Error("Cart could not be created.");
  }

  return newCart.id;
}

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
        quantity,
        products (
          id,
          name,
          price,
          image_url,
          stock
        )
      `,
    )
    .eq("cart_id", cartId)
    .order("created_at");

  if (error) {
    throw error;
  }

  return ((data ?? []) as CartItemRow[]).flatMap((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;

    if (!product) {
      return [];
    }

    return [
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.image_url,
        stock: product.stock,
        quantity: Math.min(row.quantity, product.stock),
      },
    ];
  });
}

export async function replaceCartItems(cartId: string, items: CartItem[]) {
  const { error: deleteError } = await supabase.from("cart_items").delete().eq("cart_id", cartId);

  if (deleteError) {
    throw deleteError;
  }

  if (items.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("cart_items").insert(
    items.map((item) => ({
      cart_id: cartId,
      product_id: item.productId,
      quantity: item.quantity,
    })),
  );

  if (insertError) {
    throw insertError;
  }
}
