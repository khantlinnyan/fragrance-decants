// src/components/CartDrawer.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { currencyToMMK } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; // Assuming Sheet is available

// --- Utility Functions (Mocked for Quantity Update) ---
// We need a quantity handler now that users can change it in the drawer
const updateItemQuantity = async (cartItemId: number, quantity: number) => {
  // Mocking the backend call to update quantity
  console.log(`Updating cart item ${cartItemId} quantity to ${quantity}`);
  // In a real application, this would be an API call:
  // await backend.cart.updateItem({ id: cartItemId, quantity });
  return;
};

// --- Component Props ---
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuth();
  // We rename 'cart' to 'cartData' to be clearer in the component
  const { cart: cartData, removeFromCart, refreshCart } = useCart();
  const { toast } = useToast();

  // State to track item being updated for better UX loading states
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const handleUpdateQuantity = async (
    cartItemId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setUpdatingItemId(cartItemId);
    try {
      // Optimistic update might be better, but for simplicity, we update and refresh
      await updateItemQuantity(cartItemId, newQuantity);
      await refreshCart(); // Refresh the cart data to reflect the change
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    setUpdatingItemId(cartItemId);
    try {
      await removeFromCart(cartItemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = async () => {
    onClose(); // Close the drawer immediately
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      // Optionally navigate to sign-in
      // navigate('/signin');
      return;
    }

    if (!cartData || cartData.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }

    // Instead of directly creating the order here, we navigate to the checkout page
    // The previous implementation was a single-step checkout. Now, we'll navigate.
    navigate("/checkout");
  };

  if (!user) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-xl font-light">
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex-grow text-center flex flex-col items-center justify-center py-20">
            <h1 className="text-lg font-light text-black dark:text-white mb-2">
              Sign in to view your cart
            </h1>
            <Button
              onClick={() => {
                onClose();
                navigate("/signin");
              }}
              className="mt-4"
            >
              Sign In
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const items = cartData?.items || [];
  const totalAmount = cartData?.total_amount || 0;
  const isCartEmpty = items.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-2xl font-light text-black dark:text-white">
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Cart Items */}
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
          {isCartEmpty ? (
            <div className="text-center py-20 text-neutral-600 dark:text-neutral-400">
              <p className="text-lg">Your cart is empty.</p>
              <Button
                onClick={onClose}
                variant="link"
                className="mt-2 p-0 text-sm"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col border-b border-neutral-200 dark:border-neutral-800 pb-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Item Image Placeholder */}
                    <div className="w-12 h-12 flex-shrink-0 bg-neutral-200 dark:bg-neutral-800 rounded-md flex items-center justify-center">
                      <span className="text-md font-light text-neutral-600 dark:text-neutral-400">
                        {item.brand_name.charAt(0)}
                      </span>
                    </div>

                    {/* Item Details */}
                    <div>
                      <h3 className="text-base font-light text-black dark:text-white">
                        {item.fragrance_name}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {item.size_label}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updatingItemId === item.id}
                    className="flex-shrink-0 w-8 h-8 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Quantity and Price Row */}
                <div className="flex items-center justify-between mt-2 pl-16">
                  {/* Quantity Adjustment */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={
                        item.quantity <= 1 || updatingItemId === item.id
                      }
                      className="h-6 w-6 border-neutral-300 dark:border-neutral-700"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-light min-w-[1.5rem] text-center">
                      {updatingItemId === item.id ? "..." : item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={updatingItemId === item.id}
                      className="h-6 w-6 border-neutral-300 dark:border-neutral-700"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Price */}
                  <p className="text-base font-light text-black dark:text-white">
                    MMK {currencyToMMK(item.total_price)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Fixed Footer (Cart Summary, CTA, and Trust Signals) */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          {/* Cart Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-light text-black dark:text-white">
                Subtotal
              </span>
              <span className="font-medium text-black dark:text-white">
                MMK {currencyToMMK(totalAmount)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 text-right">
              Shipping calculated at checkout
            </p>
          </div>

          {/* Primary CTA: "Proceed to Checkout" */}
          <Button
            onClick={handleCheckout}
            disabled={isCartEmpty || isCheckingOut}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-light text-lg py-5"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {/* Trust Signals */}
          <div className="mt-4 text-center space-y-3">
            <div className="flex justify-center space-x-4 text-sm">
              {/* NOTE: In a real app, these should be <Link> or <a> tags */}
              <button className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs">
                Shipping Policy
              </button>
              <span className="text-neutral-400 dark:text-neutral-600">|</span>
              <button className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs">
                Return Policy
              </button>
            </div>
            <div className="flex justify-center items-center space-x-3">
              {/* Accepted Payment Icons (e.g., Visa, Mastercard) */}
              <span className="text-xl text-neutral-400 dark:text-neutral-600">
                💳
              </span>
              <span className="text-xl text-neutral-400 dark:text-neutral-600">
                🅿️
              </span>
              <span className="text-xl text-neutral-400 dark:text-neutral-600">
                
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Rename the old CartPage function to remove the export,
// as it's no longer a full page. A new page will be created
// if a full cart summary is needed at a dedicated route.
// The file is now dedicated to the CartDrawer component.
