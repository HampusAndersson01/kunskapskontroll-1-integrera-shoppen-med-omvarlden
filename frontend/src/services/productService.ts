import { supabase } from "../lib/supabase";

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

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  id: string;
  external_id: number | null;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | string;
  discount_percentage: number | string | null;
  rating: number | string | null;
  stock: number;
  brand: string | null;
  sku: string;
  image_url: string | null;
  is_active: boolean;
  categories: CategoryRow | CategoryRow[] | null;
};

const productSelect = `
  id,
  external_id,
  category_id,
  name,
  description,
  price,
  discount_percentage,
  rating,
  stock,
  brand,
  sku,
  image_url,
  is_active,
  categories (
    id,
    name,
    slug
  )
`;

export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function getActiveProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ProductRow[]).map(mapProduct);
}

export async function getAdminProducts() {
  const { data, error } = await supabase.from("products").select(productSelect).order("name");

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ProductRow[]).map(mapProduct);
}

export async function getActiveProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function getAdminProductById(id: string) {
  const { data, error } = await supabase.from("products").select(productSelect).eq("id", id).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function createAdminProduct(input: ProductFormInput) {
  const { data, error } = await supabase
    .from("products")
    .insert(mapProductFormInput(input))
    .select(productSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapProduct(data as unknown as ProductRow);
}

export async function updateAdminProduct(id: string, input: ProductFormInput) {
  const { data, error } = await supabase
    .from("products")
    .update({
      ...mapProductFormInput(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(productSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapProduct(data as unknown as ProductRow);
}

function mapProduct(row: ProductRow): Product {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;

  return {
    id: row.id,
    externalId: row.external_id,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    discountPercentage: Number(row.discount_percentage ?? 0),
    rating: row.rating === null ? null : Number(row.rating),
    stock: row.stock,
    brand: row.brand,
    sku: row.sku,
    imageUrl: row.image_url,
    isActive: row.is_active,
  };
}

function mapProductFormInput(input: ProductFormInput) {
  return {
    category_id: input.categoryId,
    name: input.name.trim(),
    description: input.description.trim() || null,
    price: input.price,
    discount_percentage: input.discountPercentage,
    stock: input.stock,
    brand: input.brand.trim() || null,
    sku: input.sku.trim(),
    image_url: input.imageUrl.trim() || null,
    is_active: input.isActive,
  };
}
