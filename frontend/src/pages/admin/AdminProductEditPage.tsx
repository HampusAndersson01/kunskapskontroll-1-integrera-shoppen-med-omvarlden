import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import type { PageProps } from "../../routes/routes";
import {
  getAdminProductById,
  getCategories,
  updateAdminProduct,
  type Category,
  type Product,
  type ProductFormInput,
} from "../../services/productService";
import { AdminProductForm } from "./AdminProductForm";

type LoadState = "loading" | "ready" | "error" | "not-found";

export function AdminProductEditPage({ path }: PageProps) {
  const productId = path.split("/").at(-2) ?? "";
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        const [productRow, categoryRows] = await Promise.all([getAdminProductById(productId), getCategories()]);

        if (!active) {
          return;
        }

        if (!productRow) {
          setLoadState("not-found");
          return;
        }

        setProduct(productRow);
        setCategories(categoryRows);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  async function handleSubmit(input: ProductFormInput) {
    setIsSubmitting(true);
    setMessage("");

    try {
      const updatedProduct = await updateAdminProduct(productId, input);
      setProduct(updatedProduct);
      setMessage("Produkten sparades.");
    } catch {
      setMessage("Produkten kunde inte sparas. Kontrollera att SKU ar unik.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Redigera produkt</h1>
        <p>Laddar produkt.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Redigera produkt</h1>
        <p>Produkten kunde inte hamtas fran Supabase.</p>
        <p>
          <Link href="/admin/products">Till produktlistan</Link>
        </p>
      </section>
    );
  }

  if (loadState === "not-found" || !product) {
    return (
      <section className="placeholder">
        <h1>Produkten finns inte</h1>
        <p>
          <Link href="/admin/products">Till produktlistan</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <p>
        <Link href="/admin/products">Till produktlistan</Link>
      </p>
      <div className="page-heading">
        <div>
          <h1>Redigera produkt</h1>
          <p>Uppdatera information, lager och publiceringsstatus.</p>
        </div>
      </div>
      <AdminProductForm
        key={product.id}
        categories={categories}
        initialValues={mapProductToFormInput(product)}
        submitLabel="Spara andringar"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

function mapProductToFormInput(product: Product): ProductFormInput {
  return {
    categoryId: product.categoryId,
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    brand: product.brand ?? "",
    sku: product.sku,
    imageUrl: product.imageUrl ?? "",
    isActive: product.isActive,
  };
}
