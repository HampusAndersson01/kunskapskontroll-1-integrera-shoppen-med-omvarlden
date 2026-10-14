import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { getCartItems, replaceCartItems } from "../services/cartService";
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
  isSyncing: boolean;
  addProduct: (product: Product) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());
  const [isSyncing, setIsSyncing] = useState(false);
  const hasLoadedDatabaseCart = useRef(false);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    if (user) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, status, user]);

  useEffect(() => {
    let active = true;

    async function loadDatabaseCart() {
      if (status !== "ready") {
        return;
      }

      if (!user) {
        hasLoadedDatabaseCart.current = false;
        setItems(readStoredCart());
        return;
      }

      setIsSyncing(true);

      try {
        const databaseItems = await getCartItems();
        const localItems = readStoredCart();
        const mergedItems = mergeCartItems(databaseItems, localItems);

        if (!active) {
          return;
        }

        setItems(mergedItems);
        hasLoadedDatabaseCart.current = true;

        if (localItems.length > 0) {
          await replaceCartItems(user.id, mergedItems);
          window.localStorage.removeItem(CART_STORAGE_KEY);
        }
      } finally {
        if (active) {
          setIsSyncing(false);
        }
      }
    }

    void loadDatabaseCart();

    return () => {
      active = false;
    };
  }, [status, user]);

  useEffect(() => {
    if (!user || !hasLoadedDatabaseCart.current) {
      return;
    }

    let active = true;
    const activeUserId = user.id;

    async function saveDatabaseCart() {
      setIsSyncing(true);

      try {
        await replaceCartItems(activeUserId, items);
      } finally {
        if (active) {
          setIsSyncing(false);
        }
      }
    }

    void saveDatabaseCart();

    return () => {
      active = false;
    };
  }, [items, user]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      totalPrice,
      isSyncing,
      addProduct(product) {
        if (product.stock <= 0) {
          return;
        }

        setItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.productId === product.id);

          if (existingItem) {
            return currentItems.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    stock: product.stock,
                    quantity: Math.min(item.quantity + 1, product.stock),
                  }
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
  }, [isSyncing, items]);

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
    (item.imageUrl === null || typeof item.imageUrl === "string") &&
    typeof item.stock === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

function mergeCartItems(databaseItems: CartItem[], localItems: CartItem[]) {
  const itemsByProductId = new Map<string, CartItem>();

  for (const item of [...databaseItems, ...localItems]) {
    const existingItem = itemsByProductId.get(item.productId);

    if (!existingItem) {
      itemsByProductId.set(item.productId, {
        ...item,
        quantity: Math.min(item.quantity, item.stock),
      });
      continue;
    }

    itemsByProductId.set(item.productId, {
      ...existingItem,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      stock: item.stock,
      quantity: Math.min(existingItem.quantity + item.quantity, item.stock),
    });
  }

  return [...itemsByProductId.values()].filter((item) => item.quantity > 0);
}
