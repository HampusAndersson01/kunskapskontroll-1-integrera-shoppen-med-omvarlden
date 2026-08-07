import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "../services/productService";

const CART_STORAGE_KEY = "min-egna-ehandel-cart";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addProduct: (product: Product) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      totalPrice,
      addProduct(product) {
        if (product.stock <= 0) {
          return;
        }

        setItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.productId === product.id);

          if (existingItem) {
            return currentItems.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                : item,
            );
          }

          return [
            ...currentItems,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
              quantity: 1,
            },
          ];
        });
      },
      increaseQuantity(productId) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item,
          ),
        );
      },
      decreaseQuantity(productId) {
        setItems((currentItems) =>
          currentItems.flatMap((item) => {
            if (item.productId !== productId) {
              return [item];
            }

            if (item.quantity <= 1) {
              return [];
            }

            return [{ ...item, quantity: item.quantity - 1 }];
          }),
        );
      },
      removeItem(productId) {
        setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}

function readStoredCart(): CartItem[] {
  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isCartItem);
  } catch {
    return [];
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as CartItem;

  return (
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.stock === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}
