import type { CartItem } from "../cart/CartContext";
import { apiRequest } from "../lib/api";

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

export type CreatedOrder = { id: string; totalPrice: number };
export type OrderStatus = "pending" | "processing" | "delivered" | "refunded";
export type AdminOrderListItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
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

const LOCAL_ORDER_SUMMARIES_KEY = "min-egna-ehandel-order-summaries";
const LOCAL_ORDER_SUMMARY_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
type StoredOrderSummary = CreatedOrder & { createdAt: string };

export const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Beställd" },
  { value: "processing", label: "Behandlas" },
  { value: "delivered", label: "Levererad" },
  { value: "refunded", label: "Återbetald" },
];

export function createOrder(input: CheckoutInput) {
  return apiRequest<CreatedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ ...input, items: input.items.map(({ productId, quantity }) => ({ productId, quantity })) }),
  });
}

export function getOrderSummary(orderId: string) {
  return apiRequest<CreatedOrder>(`/orders/${encodeURIComponent(orderId)}/summary`);
}

export function rememberOrderSummary(order: CreatedOrder) {
  const summaries = readStoredOrderSummaries();
  const nextSummaries = [{ ...order, createdAt: new Date().toISOString() }, ...summaries.filter((summary) => summary.id !== order.id)].slice(0, 10);
  window.localStorage.setItem(LOCAL_ORDER_SUMMARIES_KEY, JSON.stringify(nextSummaries));
}

export function getRememberedOrderSummary(orderId: string): CreatedOrder | null {
  const summary = readStoredOrderSummaries().find((storedSummary) => storedSummary.id === orderId);
  return summary ? { id: summary.id, totalPrice: summary.totalPrice } : null;
}

export function getAdminOrders() {
  return apiRequest<AdminOrderListItem[]>("/admin/orders");
}

export function getAdminOrderById(orderId: string) {
  return apiRequest<AdminOrderDetails>(`/admin/orders/${encodeURIComponent(orderId)}`).catch((error: Error) => {
    if (error.message === "Order not found.") return null;
    throw error;
  });
}

export function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  return apiRequest<void>(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getOrderStatusLabel(status: string) {
  return orderStatusOptions.find((option) => option.value === status)?.label ?? status;
}

function readStoredOrderSummaries(): StoredOrderSummary[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(LOCAL_ORDER_SUMMARIES_KEY) ?? "null");
    if (!Array.isArray(value)) return [];
    const now = Date.now();
    return value.filter((item): item is StoredOrderSummary => {
      if (!item || typeof item !== "object") return false;
      const summary = item as StoredOrderSummary;
      const createdAt = new Date(summary.createdAt).getTime();
      return typeof summary.id === "string" && typeof summary.totalPrice === "number" &&
        typeof summary.createdAt === "string" && Number.isFinite(createdAt) && now - createdAt <= LOCAL_ORDER_SUMMARY_MAX_AGE_MS;
    });
  } catch {
    return [];
  }
}
