import { Link } from "./Link";
import type { Product } from "../services/productService";
import { formatPrice } from "../utils/format";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} />}

      <div>
        <h2>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h2>
        <p>{product.brand ?? product.categoryName ?? "Produkt"}</p>
        <p>{formatPrice(product.price)}</p>
        <p>{product.stock > 0 ? `${product.stock} i lager` : "Slut i lager"}</p>
      </div>
    </article>
  );
}
