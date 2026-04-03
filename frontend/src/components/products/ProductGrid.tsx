import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { useNavigate } from "react-router-dom";

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export const ProductGrid = ({ products, title }: ProductGridProps) => {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in w-full">
      {title && (
        <div className="mb-8 pb-4 border-b-2">
          <h2 className="font-display text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Discover premium second-hand items</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-5 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => navigate(`/product/${product._id}`)}
            showBuy={true}
          />
        ))}
      </div>
    </section>
  );
};
