import type { CartItem } from "../cart/CartContext";
import { supabase } from "../lib/supabase";

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingCountry: string;
  items: CartItem[];
};

export type CreatedOrder = {
  id: string;
  totalPrice: number;
};

type OrderRow = {
  id: string;
  total_price: number | string;
};

export async function createOrder(input: CheckoutInput): Promise<CreatedOrder> {
  if (input.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const { data: order, error: orderError } = await supabase
    .rpc("create_order_with_items", {
      p_customer_name: input.customerName,
      p_customer_email: input.customerEmail,
      p_customer_phone: input.customerPhone,
      p_shipping_address: input.shippingAddress,
      p_shipping_postal_code: input.shippingPostalCode,
      p_shipping_city: input.shippingCity,
      p_shipping_country: input.shippingCountry,
      p_items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    })
    .single<OrderRow>();

  if (orderError || !order) {
    throw orderError ?? new Error("Order could not be created.");
  }

  return {
    id: order.id,
    totalPrice: Number(order.total_price),
  };
}

export async function getOrderSummary(orderId: string): Promise<CreatedOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, total_price")
    .eq("id", orderId)
    .maybeSingle<OrderRow>();

  if (error) {
    throw error;
  }

  return data
    ? {
        id: data.id,
        totalPrice: Number(data.total_price),
      }
    : null;
}
