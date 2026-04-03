import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const socialLinks = [
    { Icon: Facebook, label: "Facebook" },
    { Icon: Twitter, label: "Twitter" },
    { Icon: Instagram, label: "Instagram" },
    { Icon: Github, label: "Github" },
  ];

  return (
    <footer className="w-full border-t bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="pt-16 pb-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 w-fit">
                <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  SecondHand-Store
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your premium destination for buying and selling pre-loved fashion. 
                Sustainable, secure, and stylish.
              </p>
              <div className="flex gap-4 pt-2">
                {socialLinks.map(({ Icon, label }, idx) => (
                  <motion.a
                    key={label}
                    href="#"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Marketplace
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { to: "/search", label: "Browse Items" },
                  { to: "/sell", label: "Start Selling" },
                  { to: "/search?category=men", label: "Men's Fashion" },
                  { to: "/search?category=women", label: "Women's Fashion" },
                ].map(({ to, label }, idx) => (
                  <motion.li
                    key={label}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link to={to} className="hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Company
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { to: "/about", label: "About Us" },
                  { to: "#", label: "Help Center" },
                  { to: "#", label: "Safety Guidelines" },
                  { to: "#", label: "Terms of Service" },
                  { to: "#", label: "Privacy Policy" },
                ].map(({ to, label }, idx) => (
                  <motion.li
                    key={label}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link to={to} className="hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 border-t border-border/40 pt-8 text-center"
        >
          <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            © {new Date().getFullYear()} SecondHand-Store
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-primary"
            >
              ❤️
            </motion.span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
