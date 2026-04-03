import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export const ProductGrid = ({ products, title }: ProductGridProps) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="w-full"
    >
      {title && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 pb-4 border-b-2 border-primary/10"
        >
          <h2 className="font-display text-3xl font-bold text-foreground bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Discover premium second-hand items</p>
        </motion.div>
      )}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:grid-cols-5 lg:gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => navigate(`/product/${product._id}`)}
            showBuy={true}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};
