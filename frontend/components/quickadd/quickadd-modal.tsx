// src/components/QuickAddModal.tsx
import { useState, useEffect } from "react";
import { X, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { currencyToMMK } from "@/lib/utils";
import type { Fragrance } from "~backend/products/list";

// The prices array on the list product type should be the same as the prices on the get product type
type Price = Fragrance["prices"][number];
type FragranceWithPrices = Fragrance & { prices: Price[] };

interface QuickAddModalProps {
  fragrance: FragranceWithPrices;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for quickly selecting size and quantity to add to cart.
 */
export function QuickAddModal({
  fragrance,
  isOpen,
  onClose,
}: QuickAddModalProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Set initial state based on the first price option
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
    fragrance.prices[0]?.size_ml ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Reset state when the modal opens/closes to ensure a clean slate for the next product
  useEffect(() => {
    if (isOpen) {
      setSelectedSizeId(fragrance.prices[0]?.size_id ?? null);
      setQuantity(1);
    }
  }, [isOpen, fragrance.id]);

  const selectedPrice = fragrance.prices.find(
    (p) => p.size_ml === selectedSizeId
  );
  const subtotal = selectedPrice ? selectedPrice.price * quantity : 0;

  const handleAddToCart = async () => {
    if (!user) {
      onClose(); // Close modal immediately
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSizeId) return;

    try {
      setIsAdding(true);
      await addToCart(fragrance.id, selectedSizeId, quantity);

      // 1. Modal instantly closes
      onClose();

      // 2. Non-intrusive, temporary notification appears
      const sizeLabel =
        selectedPrice?.label || `${selectedPrice?.size_ml || "Unknown"}ml`;
      toast({
        title: "Item Added to Cart",
        description: `${sizeLabel} of ${fragrance.name} added to cart.`,
      });

      // 3. The Cart icon visually updates (Handled by useCart context update)
    } catch (error) {
      console.error("Failed to quick add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <DialogTitle className="text-xl font-light text-black dark:text-white">
            Quick Add: {fragrance.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Size Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-black dark:text-white">
              Select Decant Size
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
              {fragrance.prices.map((price) => (
                <button
                  key={price.size_id}
                  onClick={() => setSelectedSizeId(price.size_id)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedSizeId === price.size_id
                      ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-500 dark:hover:border-neutral-500"
                  }`}
                >
                  <div className="flex justify-between items-center text-sm">
                    <p className="font-medium">{price.size_ml}ml</p>
                    <p className="font-light">
                      MMK {currencyToMMK(price.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-black dark:text-white">
              Quantity
            </h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-light min-w-[2rem] text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button and Total */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-light text-neutral-600 dark:text-neutral-400">
                Total:
              </span>
              <span className="text-xl font-medium text-black dark:text-white">
                MMK {currencyToMMK(subtotal)}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !selectedSizeId}
              className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-light py-5"
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
