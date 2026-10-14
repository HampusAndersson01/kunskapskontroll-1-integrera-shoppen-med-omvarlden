import { useEffect, useState } from "react";
import { Link } from "../../components/Link";
import {
  createAdminProduct,
  getCategories,
  type Category,
  type ProductFormInput,
} from "../../services/productService";
import { AdminProductForm } from "./AdminProductForm";

type LoadState = "loading" | "ready" | "error";

const emptyProduct: ProductFormInput = {
  categoryId: null,
  name: "",
  description: "",
  price: 0,
  discountPercentage: 0,
  stock: 0,
  brand: "",
  sku: "",
  imageUrl: "",
  isActive: true,
};

export function AdminProductNewPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const categoryRows = await getCategories();

        if (!active) {
          return;
        }

        setCategories(categoryRows);
        setLoadState("ready");
      } catch {
        if (active) {
          setLoadState("error");
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(input: ProductFormInput) {
    setIsSubmitting(true);
    setMessage("");

    try {
      const product = await createAdminProduct(input);
      window.history.pushState({}, "", `/admin/products/${product.id}/edit`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch {
      setMessage("Produkten kunde inte sparas. Kontrollera att SKU är unik.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadState === "loading") {
    return (
      <section className="placeholder">
        <h1>Lägg till produkt</h1>
        <p>Laddar formulär.</p>
      </section>
    );
  }

  if (loadState === "error") {
    return (
      <section className="placeholder">
        <h1>Lägg till produkt</h1>
        <p>Kategorierna kunde inte hämtas. Försök igen senare.</p>
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
          <h1>Lägg till ny produkt</h1>
          <p>Fyll i informationen nedan för att publicera en ny artikel.</p>
        </div>
      </div>
      <AdminProductForm
        categories={categories}
        initialValues={emptyProduct}
        submitLabel="Spara produkt"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
      {message && <p className="form-message">{message}</p>}
    </section>
  );
}
