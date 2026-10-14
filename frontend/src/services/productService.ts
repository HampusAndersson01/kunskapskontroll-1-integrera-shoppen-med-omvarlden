import { apiRequest } from "../lib/api";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  externalId: number | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  name: string;
  description: string | null;
  price: number;
  discountPercentage: number;
  rating: number | null;
  stock: number;
  brand: string | null;
  sku: string;
  imageUrl: string | null;
  isActive: boolean;
};

export type ProductFormInput = {
  categoryId: string | null;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  brand: string;
  sku: string;
  imageUrl: string;
  isActive: boolean;
};

export function getCategories() {
  return apiRequest<Category[]>("/categories");
}

export function getActiveProducts() {
  return apiRequest<Product[]>("/products");
}

export function getAdminProducts() {
  return apiRequest<Product[]>("/admin/products");
}

export function getActiveProductById(id: string) {
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}`).catch((error: Error) => {
    if (error.message === "Product not found.") return null;
    throw error;
  });
}

export function getAdminProductById(id: string) {
  return apiRequest<Product>(`/admin/products/${encodeURIComponent(id)}`).catch((error: Error) => {
    if (error.message === "Product not found.") return null;
    throw error;
  });
}

export function createAdminProduct(input: ProductFormInput) {
  return apiRequest<Product>("/admin/products", { method: "POST", body: JSON.stringify(input) });
}

export function updateAdminProduct(id: string, input: ProductFormInput) {
  return apiRequest<Product>(`/admin/products/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
}
