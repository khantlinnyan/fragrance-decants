import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { Fragrance } from "~backend/products/get";
import { currencyToMMK } from "@/lib/utils";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fragrance, setFragrance] = useState<Fragrance | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchFragrance = async () => {
      try {
        setIsLoading(true);
        const response = await backend.products.get({ id: parseInt(id) });
        setFragrance(response);
        // Select first size by default
        if (response.prices.length > 0) {
          setSelectedSizeId(response.prices[0].size_id);
        }
      } catch (error) {
        console.error("Failed to fetch fragrance:", error);
        toast({
          title: "Error",
          description: "Failed to load fragrance details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFragrance();
  }, [id, toast]);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    if (!fragrance || !selectedSizeId) return;

    try {
      setIsAddingToCart(true);
      await addToCart(fragrance.id, selectedSizeId, quantity);
      toast({
        title: "Added to cart",
        description: `${fragrance.name} has been added to your cart`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const selectedPrice = fragrance?.prices.find(
    (p) => p.size_id === selectedSizeId
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-neutral-600 dark:text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!fragrance) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
            Fragrance not found
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-8 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Fragrances
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center">
            <div className="w-32 h-32 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-4xl font-light text-neutral-600 dark:text-neutral-400">
                {fragrance.brand.charAt(0)}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-light text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                {fragrance.brand}
              </p>
              <h1 className="text-3xl md:text-4xl font-light text-black dark:text-white mb-4">
                {fragrance.name}
              </h1>
              <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {fragrance.description}
              </p>
            </div>

            {/* Scent Profile */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-black dark:text-white">
                Scent Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                    Top Notes
                  </p>
                  <p className="text-neutral-800 dark:text-neutral-200">
                    {fragrance.top_notes}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                    Middle Notes
                  </p>
                  <p className="text-neutral-800 dark:text-neutral-200">
                    {fragrance.middle_notes}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                    Base Notes
                  </p>
                  <p className="text-neutral-800 dark:text-neutral-200">
                    {fragrance.base_notes}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-1">
                  Scent Family
                </p>
                <p className="text-neutral-800 dark:text-neutral-200">
                  {fragrance.scent_family}
                </p>
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-black dark:text-white">
                Select Size
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {fragrance.prices.map((price) => (
                  <button
                    key={price.size_id}
                    onClick={() => setSelectedSizeId(price.size_id)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      selectedSizeId === price.size_id
                        ? "border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white"
                        : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-500 dark:hover:border-neutral-500"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{price.label}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {price.size_ml}ml
                        </p>
                      </div>
                      <p className="text-lg font-light">
                        MMK {currencyToMMK(price.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-lg font-light text-black dark:text-white">
                Quantity
              </h3>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-light min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light text-black dark:text-white">
                  MMK <span></span>
                  {selectedPrice
                    ? currencyToMMK(selectedPrice.price * quantity)
                    : "0.00"}
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  MMK {currencyToMMK(selectedPrice?.price ?? 0)} each
                </span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedSizeId}
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-light text-lg py-6"
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
