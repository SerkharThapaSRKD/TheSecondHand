import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  ShieldCheck,
  LogOut,
  User,
  ShoppingCart,
  Trash2,
  Heart,
  Sun,
  Moon,
  History,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, removeFromCart } = useCart();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const cartCount = (cart?.items || []).reduce(
    (s, it) => s + (it.quantity || 0),
    0
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/10 glass"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent hover:scale-110 transition-transform duration-200">
                SecondHand-Store
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex flex-1 ml-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About Us</Link>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/search")}>
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {isAuthenticated && (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="icon" aria-label="Cart" id="shopcart">
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5"  />
                      {cartCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse"
                        >
                          {cartCount > 9 ? "9+" : cartCount}
                        </motion.span>
                      )}
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2">
                <div className="max-h-64 overflow-auto">
                  {(!cart || !cart.items || cart.items.length === 0) && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Your cart is empty
                    </div>
                  )}
                  {cart.items.map((it) => (
                    <motion.div
                      key={it.product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                      <img
                        src={it.product.images?.[0] || ""}
                        alt={it.product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm line-clamp-1">
                          {it.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          NRs {it.price.toFixed(2)} x {it.quantity}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(it.product._id);
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <div>Subtotal</div>
                    <div>
                      NRs {(
                        cart?.items?.reduce(
                          (s, it) => s + (it.price || 0) * (it.quantity || 1),
                          0
                        ) || 0
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/cart")}
                      className="btn w-full">
                      View Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/cart")}
                      className="btn w-full" id="checkout">
                      Checkout
                    </motion.button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            )}

            {isAuthenticated ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/sell")} id="sell">
                    <Plus className="mr-1 h-4 w-4" />
                    Sell
                  </Button>
                </motion.div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                          <AvatarImage 
                            src={user?.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user?.avatar}`} 
                            alt={user?.name} 
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/transactions")}>
                      <History className="mr-2 h-4 w-4" />
                      Transactions
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut  className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button id="login" variant="ghost" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button id="signup" onClick={() => navigate("/signup")}>Sign Up</Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
