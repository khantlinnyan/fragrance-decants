// src/components/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onCartClick: () => void; // Function to open the cart drawer
  cartItemCount: number;
}

export function Header({ onCartClick, cartItemCount }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search:", searchQuery);
  };

  const handleCartClick = () => {
    onCartClick();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 supports-[backdrop-filter]:dark:bg-black/75">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-light tracking-wider text-black dark:text-white"
            >
              DECANT
            </Link>

            {/* Desktop Navigation, Search, and Actions (Unchanged) */}
            {/* ... */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className="text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Fragrances
              </Link>
              <Link
                to="/brands"
                className="text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                Brands
              </Link>
              <Link
                to="/about"
                className="text-sm font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                About
              </Link>
            </nav>

            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-sm mx-8"
            >
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

            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Hello, {user.name}
                  </span>
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

              {/* Desktop Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartClick}
                className="relative text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                aria-label={`Shopping Bag with ${cartItemCount} items`}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
            {/* End Desktop */}

            {/* Mobile Actions: Cart, Menu Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              {/* 1. Mobile Cart Button (ALWAYS VISIBLE) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCartClick} // Calls the new prop
                className="relative text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                aria-label={`Shopping Bag with ${cartItemCount} items`}
              >
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Button>

              {/* 2. Mobile Menu Button (ALWAYS VISIBLE) */}
              <Button
                variant="ghost"
                size="sm"
                className=""
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          {/* End Main Header Row */}

          {/* Mobile Menu Content (Only opens when isMobileMenuOpen is true) */}
          {/* Mobile Menu Content (Only opens when isMobileMenuOpen is true) */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-4">
              {/* Mobile Search - Top Element (Unchanged) */}
              <form onSubmit={handleSearch} className="mb-6 px-4">
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

              {/* Navigation Links - Reduced size to text-lg */}
              <nav className="space-y-2 mb-8">
                <Link
                  to="/"
                  // CHANGE: Reduced to text-lg
                  className="py-3 px-4 text-lg font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Fragrances
                </Link>
                <Link
                  to="/brands"
                  // CHANGE: Reduced to text-lg
                  className="py-3 px-4 text-lg font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Brands
                </Link>
                <Link
                  to="/about"
                  // CHANGE: Reduced to text-lg
                  className="py-3 px-4 text-lg font-light text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
              </nav>

              {/* Separator */}
              <hr className="border-neutral-200 dark:border-neutral-800 mx-4 mb-4" />

              {/* Login/Logout and Theme Toggle (Unchanged, remains text-lg) */}
              <div className="flex flex-col space-y-2 px-4">
                {/* Theme Toggle (Icon and Label) */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2 text-lg font-light text-neutral-700 dark:text-neutral-300">
                    <span className="text-xl">
                      <ThemeToggle />
                    </span>
                    <span className="text-lg">Theme</span>
                  </div>
                </div>

                {/* Sign In / User Action (Name and Logout) */}
                {user ? (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-lg font-light text-neutral-700 dark:text-neutral-300">
                      {user.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-lg font-light text-red-500 hover:text-red-700 dark:hover:text-red-300"
                    >
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
                    className="w-full justify-start text-lg font-light text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Sign In / Register
                  </Button>
                )}
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
