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

export type OrderStatus = "pending" | "processing" | "delivered" | "refunded";

export type AdminOrderListItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
};

export type AdminOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
};

export type AdminOrderDetails = AdminOrderListItem & {
  customerPhone: string | null;
  shippingAddress: string | null;
  shippingPostalCode: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  updatedAt: string;
  items: AdminOrderItem[];
};

type OrderRow = {
  id: string;
  total_price: number | string;
};

type AdminOrderRow = OrderRow & {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  order_items?: AdminOrderItemRow[] | null;
};

type AdminOrderItemRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_at_purchase: number | string;
};

const LOCAL_ORDER_SUMMARIES_KEY = "min-egna-ehandel-order-summaries";
const LOCAL_ORDER_SUMMARY_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

type StoredOrderSummary = CreatedOrder & {
  createdAt: string;
};

export const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Beställd" },
  { value: "processing", label: "Behandlas" },
  { value: "delivered", label: "Levererad" },
  { value: "refunded", label: "Återbetald" },
];

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

export function rememberOrderSummary(order: CreatedOrder) {
  const summaries = readStoredOrderSummaries();
  const nextSummaries = [
    { ...order, createdAt: new Date().toISOString() },
    ...summaries.filter((summary) => summary.id !== order.id),
  ].slice(0, 10);

  window.localStorage.setItem(LOCAL_ORDER_SUMMARIES_KEY, JSON.stringify(nextSummaries));
}

export function getRememberedOrderSummary(orderId: string): CreatedOrder | null {
  const summaries = readStoredOrderSummaries();
  const summary = summaries.find((storedSummary) => storedSummary.id === orderId);

  return summary
    ? {
        id: summary.id,
        totalPrice: summary.totalPrice,
      }
    : null;
}

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, total_price, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as AdminOrderRow[]).map(mapAdminOrderListItem);
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetails | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_postal_code,
        shipping_city,
        shipping_country,
        total_price,
        status,
        created_at,
        updated_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price_at_purchase
        )
      `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapAdminOrderDetails(data as AdminOrderRow) : null;
}

export async function updateAdminOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    throw error;
  }
}

export function getOrderStatusLabel(status: string) {
  return orderStatusOptions.find((option) => option.value === status)?.label ?? status;
}

function mapAdminOrderListItem(row: AdminOrderRow): AdminOrderListItem {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    totalPrice: Number(row.total_price),
    status: normalizeOrderStatus(row.status),
    createdAt: row.created_at,
  };
}

function mapAdminOrderDetails(row: AdminOrderRow): AdminOrderDetails {
  return {
    ...mapAdminOrderListItem(row),
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    shippingPostalCode: row.shipping_postal_code,
    shippingCity: row.shipping_city,
    shippingCountry: row.shipping_country,
    updatedAt: row.updated_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      priceAtPurchase: Number(item.price_at_purchase),
    })),
  };
}

function normalizeOrderStatus(status: string): OrderStatus {
  return orderStatusOptions.some((option) => option.value === status) ? (status as OrderStatus) : "pending";
}

function readStoredOrderSummaries(): StoredOrderSummary[] {
  try {
    const storedValue = window.localStorage.getItem(LOCAL_ORDER_SUMMARIES_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const now = Date.now();

    return parsedValue.filter((value): value is StoredOrderSummary => {
      if (!value || typeof value !== "object") {
        return false;
      }

      const summary = value as StoredOrderSummary;
      const createdAtTime = new Date(summary.createdAt).getTime();

      return (
        typeof summary.id === "string" &&
        typeof summary.totalPrice === "number" &&
        typeof summary.createdAt === "string" &&
        Number.isFinite(createdAtTime) &&
        now - createdAtTime <= LOCAL_ORDER_SUMMARY_MAX_AGE_MS
      );
    });
  } catch {
    return [];
  }
}
