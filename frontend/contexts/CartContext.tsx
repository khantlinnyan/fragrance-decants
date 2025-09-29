import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback, // Added useCallback for refreshCart
} from "react";
import { useAuth } from "./AuthContext";
import backend from "~backend/client";
import type { GetCartResponse } from "~backend/cart/get";
import { getOrCreateGuestSessionId } from "@/lib/utils";

// NOTE: Assuming your GuestCartResponse is compatible with GetCartResponse for setCart

interface CartContextType {
  cart: GetCartResponse | null;
  addToCart: (
    fragranceId: number,
    decantSizeId: number,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<GetCartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Cache the session ID retrieval
  const guestSessionId = getOrCreateGuestSessionId();

  const refreshCart = useCallback(async () => {
    setIsLoading(true);

    if (user?.id) {
      // LOGGED-IN USER CART
      try {
        const cartData = await backend.cart.get({ user_id: user.id });
        setCart(cartData);
      } catch (error) {
        console.error("Failed to fetch user cart:", error);
        setCart({ items: [], total_amount: 0 });
      } finally {
        setIsLoading(false);
      }
    } else {
      // GUEST USER CART
      try {
        // Use the cached/created session ID
        const cartData = await backend.guest_cart.get({
          session_id: guestSessionId,
        });
        setCart(cartData);
      } catch (error) {
        console.error("Failed to fetch guest cart:", error);
        setCart({ items: [], total_amount: 0 });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, guestSessionId]); // Depend on user and guestSessionId

  const addToCart = async (
    fragranceId: number,
    decantSizeId: number,
    quantity: number
  ) => {
    setIsLoading(true);

    if (user?.id) {
      // LOGGED-IN ADD
      try {
        await backend.cart.add({
          user_id: user.id,
          fragrance_id: fragranceId,
          decant_size_id: decantSizeId,
          quantity,
        });
      } catch (error) {
        console.error("Failed to add to cart (User):", error);
        throw error;
      }
    } else {
      // GUEST ADD
      try {
        await backend.guest_cart.add({
          session_id: guestSessionId, // <--- Using the session ID
          fragrance_id: fragranceId,
          decant_size_id: decantSizeId,
          quantity: quantity,
        });
      } catch (error) {
        console.error("Failed to add to cart (Guest):", error);
        throw error;
      }
    }

    // Refresh the cart regardless of user status
    await refreshCart();
  };

  const removeFromCart = async (cartItemId: number) => {
    setIsLoading(true);

    if (user?.id) {
      // LOGGED-IN REMOVE
      try {
        await backend.cart.remove({
          user_id: user.id,
          cart_item_id: cartItemId,
        });
      } catch (error) {
        console.error("Failed to remove from cart (User):", error);
        throw error;
      }
    } else {
      // GUEST REMOVE - NOTE: This assumes you have a guest_cart.remove API
      try {
        await backend.guest_cart.remove({
          session_id: guestSessionId, // <--- Using the session ID
          cart_item_id: cartItemId,
        });
      } catch (error) {
        console.error("Failed to remove from cart (Guest):", error);
        throw error;
      }
    }

    // Refresh the cart regardless of user status
    await refreshCart();
  };

  useEffect(() => {
    // Only fetch if guestSessionId is initialized
    if (guestSessionId) {
      refreshCart();
    }
    // Dependency includes user to re-fetch when they log in/out
  }, [user, guestSessionId, refreshCart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, refreshCart, isLoading }}
    >
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
