import { FormEvent, useState } from "react";
import type { Category, ProductFormInput } from "../../services/productService";

type AdminProductFormProps = {
  categories: Category[];
  initialValues: ProductFormInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (input: ProductFormInput) => void;
};

export function AdminProductForm({
  categories,
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: AdminProductFormProps) {
  const [values, setValues] = useState<ProductFormInput>(initialValues);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="form-block product-form" onSubmit={handleSubmit}>
      <label>
        Namn
        <input
          type="text"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          required
        />
      </label>

      <label>
        Beskrivning
        <textarea
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          rows={5}
        />
      </label>

      <label>
        Kategori
        <select
          value={values.categoryId ?? ""}
          onChange={(event) => setValues({ ...values, categoryId: event.target.value || null })}
        >
          <option value="">Ingen kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className="form-row">
        <label>
          Pris
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={(event) => setValues({ ...values, price: Number(event.target.value) })}
            required
          />
        </label>

        <label>
          Rabatt %
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={values.discountPercentage}
            onChange={(event) => setValues({ ...values, discountPercentage: Number(event.target.value) })}
            required
          />
        </label>

        <label>
          Lager
          <input
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={(event) => setValues({ ...values, stock: Number(event.target.value) })}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Varumärke
          <input
            type="text"
            value={values.brand}
            onChange={(event) => setValues({ ...values, brand: event.target.value })}
          />
        </label>

        <label>
          SKU
          <input
            type="text"
            value={values.sku}
            onChange={(event) => setValues({ ...values, sku: event.target.value })}
            required
          />
        </label>
      </div>

      <label>
        Bild-URL
        <input
          type="url"
          value={values.imageUrl}
          onChange={(event) => setValues({ ...values, imageUrl: event.target.value })}
        />
      </label>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => setValues({ ...values, isActive: event.target.checked })}
        />
        Aktiv produkt
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sparar..." : submitLabel}
      </button>
    </form>
  );
}
