import { Link } from "./Link";
import type { Product } from "../services/productService";
import { formatPrice } from "../utils/format";
import { useCart } from "../cart/CartContext";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useCart();

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
        <button type="button" disabled={product.stock <= 0} onClick={() => addProduct(product)}>
          Lägg i varukorg
        </button>
      </div>
    </article>
  );
}
