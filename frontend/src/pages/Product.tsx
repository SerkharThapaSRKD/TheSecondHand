import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product as P } from "@/types";
import ReviewsList from "@/components/review/ReviewsList";
import ReviewForm from "@/components/review/ReviewForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, User, ShoppingCart, Heart, ArrowLeft, Share2, Eye, Check, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import PaymentButtons from "@/components/payment/PaymentButtons";
import { ProductEditDialog } from "@/components/products/ProductEditDialog";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated, wishlist, addToWishlist, removeFromWishlist, user: currentUser } = useAuth();
  const [product, setProduct] = useState<P | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isLiked = product && wishlist.includes(product._id);
  const isProductInCart = product ? isInCart(product._id) : false;
  const isOwnItem = product && currentUser && (
    currentUser.id === (typeof product.seller === "object" ? product.seller._id : product.seller) ||
    currentUser._id === (typeof product.seller === "object" ? product.seller._id : product.seller)
  );

  const toggleLike = () => {
    if (!isAuthenticated) return navigate("/login");
    if (!product) return;
    if (isLiked) {
        removeFromWishlist(product._id);
    } else {
        addToWishlist(product._id);
    }
  };

  const handleProductUpdate = (updatedProduct: P) => {
    setProduct(updatedProduct);
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API}/api/products/${id}`);
      const d = await res.json();
      if (res.ok) setProduct(d.product);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Reset payment state when product changes or if it's the user's own item
  useEffect(() => {
    if (product && product.seller && currentUser) {
      const sellerId = typeof product.seller === "object" ? product.seller._id : product.seller;
      const userId = currentUser.id || currentUser._id;
      if (sellerId && userId && sellerId.toString() === userId.toString()) {
        setShowPayment(false);
      }
    }
  }, [product, currentUser]);

  if (!product)
    return (
      <div className="p-20 text-center text-muted-foreground animate-pulse">
        Loading product...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          {/* HERO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* IMAGE SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4">
              <div className="relative group overflow-hidden rounded-3xl shadow-xl bg-gray-100 dark:bg-gray-800">
                <img
                  src={
                    product.images?.[selectedImageIndex]?.startsWith("http")
                      ? product.images[selectedImageIndex]
                      : `${API}${product.images?.[selectedImageIndex]}`
                  }
                  alt={product.name}
                  className="w-full h-[520px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-4 right-4 rounded-full shadow-md hover:bg-white"
                  onClick={toggleLike}>
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </Button>
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-gray-300"
                      }`}>
                      <img
                        src={img.startsWith("http") ? img : `${API}${img}`}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* INFO */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white" variant="default">
                    {product.clothType?.replace('-', ' ').toUpperCase()}
                  </Badge>
                  {product.status === "sold" && (
                    <Badge variant="destructive">Sold Out</Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* PRICE & RATINGS */}
              <div className="bg-gradient-to-br from-primary/10 to-indigo-600/10 dark:from-primary/20 dark:to-indigo-600/20 rounded-2xl p-6 space-y-4 border border-primary/20">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-primary">NRs {product.price}</span>
                  <div className="text-sm text-muted-foreground">All-in price • No hidden charges</div>
                </div>
                <div className="flex items-center gap-8 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{product.averageRating?.toFixed(1) || 0}</span>
                    <span className="text-sm text-muted-foreground">({product.reviewCount || 0} {product.reviewCount === 1 ? "review" : "reviews"})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{product.views || 0} views</span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description}
              </p>

              {/* OWN ITEM MESSAGE */}
              {isOwnItem && (
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3 flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">This is Your Item</h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        You listed this item for sale. Edit your listing or view your profile for more options.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          onClick={() => setEditDialogOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4" /> Edit Listing
                        </Button>
                        <Button 
                          onClick={() => navigate("/profile")}
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          size="sm"
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* ACTION BUTTONS - Only for other people's items */}
              {!isOwnItem && (
              <div className="flex gap-3 flex-wrap pt-4">
                {product.status === "sold" ? (
                  <Button size="lg" disabled className="flex-1 bg-muted text-muted-foreground">
                    <span className="text-lg font-semibold">Item Sold</span>
                  </Button>
                ) : isProductInCart ? (
                  <Button size="lg" disabled className="flex-1 gap-2 bg-green-600 text-white hover:bg-green-600">
                    <Check className="w-5 h-5" /> Already in Cart
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="flex-1 gap-2 font-semibold"
                      onClick={() => addToCart(product, 1)}
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </Button>
                    {!showPayment ? (
                      <Button size="lg" variant="outline" onClick={() => !isOwnItem && setShowPayment(true)} className="flex-1 font-semibold border-2">
                        Buy Now
                      </Button>
                    ) : (
                      <div className="w-full">
                        {!isOwnItem && (
                          <PaymentButtons
                            amount={Math.round((product.price || 0) * 100)}
                            name={product.name}
                            currency="usd"
                            productId={product._id}
                            sellerID={product.seller?._id || product.seller}
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              )}

{/* WISHLIST & SHARE */}
              <div className="flex items-center justify-between gap-4 pt-6 border-t">
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={toggleLike}
                  className="gap-2 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Heart className={`w-5 h-5 ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`} />
                  {isLiked ? "Saved" : "Save to Favorites"}
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm font-medium text-muted-foreground">Share:</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-green-50 hover:text-green-600"
                    onClick={() => {
                      const text = encodeURIComponent(`Check out this ${product.name} on SecondHand-Store: ${window.location.href}`);
                      window.open(`https://wa.me/?text=${text}`, "_blank");
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.44l-.421 3.667h-3.018v7.98h-4.844Z"/></svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied",
                        description: "Product link copied to clipboard",
                      });
                    }}
                  >
                     <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* PRODUCT SPECS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">Size</p>
                  <p className="text-lg font-bold">{product.size}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">Gender</p>
                  <p className="text-lg font-bold capitalize">{product.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">Condition</p>
                  <Badge className="w-fit text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {product.condition?.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground">Type</p>
                  <p className="text-lg font-bold capitalize">{product.clothType?.replace('-', ' ')}</p>
                </div>
              </div>

              {/* SELLER CARD - Premium Style */}
              <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-2 border-blue-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">About the Seller</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0 border-2 border-primary">
                      {product.seller?.avatar ? (
                        <img
                          src={product.seller.avatar.startsWith('http') ? product.seller.avatar : `${API}${product.seller.avatar}`}
                          alt={product.seller.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 text-white text-xl font-bold">
                          {product.seller?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-foreground">{product.seller?.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {product.location}
                      </div>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="font-bold text-primary text-lg">{product.seller?.totalSales || 0}</p>
                          <p className="text-xs text-muted-foreground">Items Sold</p>
                        </div>
                        <div>
                          <p className="font-bold text-primary text-lg">{product.seller?.totalPurchases || 0}</p>
                          <p className="text-xs text-muted-foreground">Items Bought</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {product.seller?.about && (
                    <p className="text-sm text-muted-foreground italic mt-4 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border-l-4 border-primary">
                      "{product.seller.about}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* REVIEWS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2">
              <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
              <ReviewsList productId={id!} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}>
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewForm productId={id!} onSubmitted={fetchProduct} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
        
        {/* EDIT DIALOG */}
        {product && (
          <ProductEditDialog
            product={product}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSave={handleProductUpdate}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}