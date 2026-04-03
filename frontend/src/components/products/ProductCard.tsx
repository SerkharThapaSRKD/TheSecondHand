import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Trash2, Check, Star, Heart } from "lucide-react";
import PaymentButtons from "@/components/payment/PaymentButtons";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  showBuy?: boolean;
  onDelete?: () => void;
}

export const ProductCard = ({
  product,
  onClick,
  showBuy = false,
  onDelete,
}: ProductCardProps) => {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const isInCartAlready = isInCart(product._id);
  const isOwnItem = user?.id === product.seller?._id || user?._id === product.seller?._id;

  const conditionColors: Record<string, string> = {
    "new-with-tags": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    "like-new": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    "good": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    "fair": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    "worn": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col border border-gray-200 dark:border-gray-800"
      onClick={onClick}>
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
        <img
          src={product.images[0]?.startsWith("http") ? product.images[0] : `${API}${product.images[0]}`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md z-10 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
         )}
        {product.status === "sold" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-md transform -rotate-12">
              Sold
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <h3 className="line-clamp-2 font-semibold text-sm leading-tight text-gray-900 dark:text-gray-100">{product.name}</h3>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold text-primary">NRs {product.price}</span>
            {product.averageRating && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Avatar className="h-8 w-8">
            <AvatarImage src={product.seller?.avatar?.startsWith("http") ? product.seller.avatar : `${API}${product.seller?.avatar}`} />
            <AvatarFallback className="text-xs">{product.seller?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium line-clamp-1 text-gray-900 dark:text-gray-100">{product.seller?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {product.location}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {product.size}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {product.gender}
          </Badge>
          <Badge
            className={`text-xs ${
              conditionColors[product.condition] ?? "bg-muted"
            }`}>
            {product.condition?.replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {product.clothType?.replace('-', ' ')}
          </Badge>
        </div>

        {showBuy && product.status !== "sold" && !isOwnItem && (
          <div className="mt-3 border-t pt-3">
            <PaymentButtons
              amount={Math.round((product.price || 0) * 100)}
              name={product.name}
              currency="usd"
              productId={product._id}
              sellerID={product.seller?._id || product.seller}
            />
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {isOwnItem ? (
            <Button disabled className="flex-1 text-sm font-semibold bg-gray-400 text-white" size="sm">
              Your Item
            </Button>
          ) : (
            <Button
              disabled={product.status === "sold" || isInCartAlready}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className={`flex-1 text-sm font-semibold shadow transition-all ${
                isInCartAlready
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
              size="sm">
              {isInCartAlready ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" /> In Cart
                </>
              ) : (
                "Add to Cart"
              )}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="w-12 hover:bg-red-50 dark:hover:bg-red-950">
            <Heart className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
