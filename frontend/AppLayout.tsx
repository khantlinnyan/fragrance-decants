// src/components/AppLayout.tsx (or similar global wrapper)

import React, { useState } from "react";
// Import the new components
import { CartDrawer } from "@/components/cart/cart-drawer";
import { GlobalChatBubble } from "@/components/cart/global-chat";
import { useCart } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  // Function to be passed to the Header's cart icon
  const handleOpenCart = () => setIsCartOpen(true);

  // You would update the <Header> component to use handleOpenCart
  // and visually update the cart icon based on cart.items.length

  return (
    <div className="relative min-h-screen">
      {/* 1. Header component, where the cart icon lives */}
      <Header
        onCartClick={handleOpenCart}
        cartItemCount={cart?.items.length || 0}
      />

      {/* 2. Main content of the page */}
      <main>{children}</main>

      {/* 3. Global Chat Bubble (Fixed on all pages) */}
      <GlobalChatBubble />

      {/* 4. Mini-Cart/Drawer (Opens on all pages) */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* 5. Toast Provider (for notifications) */}
      {/* <Toaster /> */}
    </div>
  );
}
