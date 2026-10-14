import type { CartItem } from "../cart/CartContext";
import { apiRequest } from "../lib/api";

export async function getCartItems(_userId?: string): Promise<CartItem[]> {
  return apiRequest<CartItem[]>("/cart");
}

export async function replaceCartItems(_userId: string | null, items: CartItem[]) {
  await apiRequest<void>("/cart", { method: "PUT", body: JSON.stringify({ items }) });
}
