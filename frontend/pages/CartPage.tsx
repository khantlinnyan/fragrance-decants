import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";

export function CartPage() {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuth();
  const { cart, removeFromCart, refreshCart } = useCart();
  const { toast } = useToast();

  const handleRemoveItem = async (cartItemId: number) => {
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
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCheckingOut(true);
      await backend.orders.create({ user_id: user.id });
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You will receive a confirmation email shortly.",
      });
      await refreshCart();
      navigate("/");
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-8 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fragrances
          </Button>
          
          <div className="text-center py-20">
            <h1 className="text-2xl font-light text-black dark:text-white mb-4">Sign in to view your cart</h1>
            <p className="text-neutral-600 dark:text-neutral-400">You need to be signed in to see your shopping cart.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-8 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fragrances
        </Button>

        <h1 className="text-3xl font-light text-black dark:text-white mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4">Your cart is empty</p>
            <p className="text-neutral-500 dark:text-neutral-500 mb-8">
              Discover our curated selection of luxury fragrances
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              Shop Fragrances
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-light text-neutral-600 dark:text-neutral-400">
                        {item.brand_name.charAt(0)}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                        {item.brand_name}
                      </p>
                      <h3 className="text-lg font-light text-black dark:text-white">
                        {item.fragrance_name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.size_label} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-light text-black dark:text-white">
                        ${item.total_price.toFixed(2)}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        ${item.price_per_item.toFixed(2)} each
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8">
              <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-light text-black dark:text-white">Subtotal</span>
                  <span className="font-light text-black dark:text-white">
                    ${cart.total_amount.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-neutral-600 dark:text-neutral-400">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <hr className="border-neutral-300 dark:border-neutral-700" />
                
                <div className="flex justify-between items-center text-xl">
                  <span className="font-light text-black dark:text-white">Total</span>
                  <span className="font-light text-black dark:text-white">
                    ${cart.total_amount.toFixed(2)}
                  </span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-light text-lg py-6 mt-6"
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
