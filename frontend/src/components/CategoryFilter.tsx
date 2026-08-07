import type { Category } from "../services/productService";

type CategoryFilterProps = {
  categories: Category[];
  selectedSlug: string;
  onChange: (slug: string) => void;
};

export function CategoryFilter({ categories, selectedSlug, onChange }: CategoryFilterProps) {
  return (
    <label className="filter-field">
      Kategori
      <select value={selectedSlug} onChange={(event) => onChange(event.target.value)}>
        <option value="">Alla kategorier</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
