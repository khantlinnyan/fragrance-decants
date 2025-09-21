import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import backend from "~backend/client";
import type { GetCartResponse } from "~backend/cart/get";

interface CartContextType {
  cart: GetCartResponse | null;
  addToCart: (fragranceId: number, decantSizeId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<GetCartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const cartData = await backend.cart.get({ user_id: user.id });
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart({ items: [], total_amount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (fragranceId: number, decantSizeId: number, quantity: number) => {
    if (!user) throw new Error("Must be logged in to add to cart");

    try {
      await backend.cart.add({
        user_id: user.id,
        fragrance_id: fragranceId,
        decant_size_id: decantSizeId,
        quantity,
      });
      await refreshCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!user) throw new Error("Must be logged in to remove from cart");

    try {
      await backend.cart.remove({
        user_id: user.id,
        cart_item_id: cartItemId,
      });
      await refreshCart();
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, refreshCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
