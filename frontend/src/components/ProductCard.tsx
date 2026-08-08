import { useCart } from "../cart/CartContext";
import type { Product } from "../services/productService";
import { formatPrice } from "../utils/format";
import { Link } from "./Link";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useCart();
  const stockLabel = product.stock <= 0 ? "Slut i lager" : product.stock <= 3 ? `${product.stock} kvar` : "I lager";
  const stockClass = product.stock <= 0 ? "out" : product.stock <= 3 ? "low" : "";

  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`} className="product-card-image" aria-label={`Visa ${product.name}`}>
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>Ingen bild</span>}
      </Link>

      <div className="product-card-body">
        <span className="product-card-category">{product.categoryName ?? product.brand ?? "Produkt"}</span>
        <h2>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h2>
        {product.rating !== null && <span aria-label={`Betyg ${product.rating}`}>Betyg {product.rating}</span>}
        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>
          <span className={`stock-label ${stockClass}`}>{stockLabel}</span>
        </div>
        <button type="button" disabled={product.stock <= 0} onClick={() => addProduct(product)}>
          Lagg i varukorg
        </button>
      </div>
    </article>
  );
}
