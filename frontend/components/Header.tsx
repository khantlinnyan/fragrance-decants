import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search:", searchQuery);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 supports-[backdrop-filter]:dark:bg-black/75">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-xl font-light tracking-wider text-black dark:text-white">
              DECANT
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Fragrances
              </Link>
              <Link to="/brands" className="text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                Brands
              </Link>
              <Link to="/about" className="text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                About
              </Link>
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  type="search"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:border-neutral-600 dark:focus:border-white text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Hello, {user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm" className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white">
                  <ShoppingBag className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="search"
                    placeholder="Search fragrances..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:border-neutral-600 dark:focus:border-white text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                  />
                </div>
              </form>
              
              <nav className="space-y-2 mb-4">
                <Link 
                  to="/" 
                  className="block py-2 text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fragrances
                </Link>
                <Link 
                  to="/brands" 
                  className="block py-2 text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Brands
                </Link>
                <Link 
                  to="/about" 
                  className="block py-2 text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
              </nav>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{user.name}</span>
                      <Button variant="ghost" size="sm" onClick={logout}>
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
                
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingBag className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
