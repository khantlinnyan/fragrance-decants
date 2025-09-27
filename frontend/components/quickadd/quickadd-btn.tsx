// src/components/QuickAddButton.tsx
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiquidGlass } from "@liquidglass/react";

interface QuickAddButtonProps {
  onOpen: () => void;
}

/**
 * A sleek, monochromatic button to trigger the Quick Add modal.
 */
export function QuickAddButton({ onOpen }: QuickAddButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        // Stop event propagation to prevent the parent <Link> from navigating
        e.preventDefault();
        e.stopPropagation();
        onOpen();
      }}
      className="absolute top-3 right-3 z-10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                 bg-white/80 dark:bg-black/80 backdrop-blur-sm 
                 border border-neutral-200 dark:border-neutral-800 
                 hover:bg-white dark:hover:bg-black"
      aria-label="Quick Add to Cart"
    >
      <ShoppingCart className="h-4 w-4 text-black dark:text-white" />
    </Button>
  );
}
