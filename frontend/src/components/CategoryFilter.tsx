import type { Category } from "../services/productService";

type CategoryFilterProps = {
  categories: Category[];
  selectedSlug: string;
  onChange: (slug: string) => void;
};

export function CategoryFilter({ categories, selectedSlug, onChange }: CategoryFilterProps) {
  return (
    <aside className="category-panel" aria-label="Produktkategorier">
      <h2>Kategorier</h2>
      <div className="category-filter-list">
        <button
          type="button"
          className={selectedSlug ? "category-filter-button" : "category-filter-button active"}
          onClick={() => onChange("")}
        >
          Alla produkter <span aria-hidden="true">&gt;</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={selectedSlug === category.slug ? "category-filter-button active" : "category-filter-button"}
            onClick={() => onChange(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </aside>
  );
}
