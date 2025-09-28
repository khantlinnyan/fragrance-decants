// src/pages/HomePage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
// Import ProductCard and the new Modal
import { ProductCard } from "../components/ProductCard";
import { QuickAddModal } from "@/components/quickadd/quickadd-modal";
import { ProductFilters } from "../components/ProductFilters";
import backend from "~backend/client";
import type { ListProductsResponse, Fragrance } from "~backend/products/list";

// Ensure the Fragrance type has the prices property for the QuickAddModal
// We assume it's available, based on how ProductCard uses it.
type FragranceWithPrices = Fragrance & {
  prices: { size_id: number; label: string; size_ml: number; price: number }[];
};

// A unique key for our query, it's good practice to make this an array
// with the name and dependencies (filters) so TanStack Query can
// automatically re-fetch when the filters change.
const getFragrancesQueryKey = (filters: any) => ["fragrances", filters];

// The actual async function that fetches the data.
const fetchFragrances = async (filters: any) => {
  const response = await backend.products.list(filters);
  return response;
};

export function HomePage() {
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    scent_family: "",
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
  });

  // State for the Quick Add Modal
  const [quickAddFragrance, setQuickAddFragrance] =
    useState<FragranceWithPrices | null>(null);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: getFragrancesQueryKey(filters),
    queryFn: () => fetchFragrances(filters),
  });

  // Handlers for the Quick Add Modal
  const handleQuickAdd = (fragrance: FragranceWithPrices) => {
    // Only open if the product has pricing data
    if (fragrance.prices && fragrance.prices.length > 0) {
      setQuickAddFragrance(fragrance);
    }
  };

  const handleCloseQuickAdd = () => {
    setQuickAddFragrance(null);
  };

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">Failed to load fragrances.</p>
        <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">
          Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-black dark:text-white mb-6">
            Curated Luxury
            <br />
            <span className="text-neutral-600 dark:text-neutral-400">
              Fragrance Decants
            </span>
          </h1>
          <p className="text-xl font-light text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Discover exceptional fragrances in sample sizes. Experience luxury
            without commitment.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <ProductFilters onFiltersChange={setFilters} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-neutral-600 dark:text-neutral-400">
                Loading fragrances...
              </div>
            </div>
          ) : products && products.fragrances.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.fragrances.map((fragrance) => (
                  <ProductCard
                    key={fragrance.id}
                    fragrance={fragrance as FragranceWithPrices}
                    onQuickAdd={handleQuickAdd} // Pass the handler
                  />
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing {products.fragrances.length} of {products.total}{" "}
                  fragrances
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                No fragrances found
              </p>
              <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Add Modal is rendered here, only when a product is selected */}
      {quickAddFragrance && (
        <QuickAddModal
          fragrance={quickAddFragrance}
          isOpen={!!quickAddFragrance} // Open if quickAddFragrance is not null
          onClose={handleCloseQuickAdd} // Handler to close the modal
        />
      )}
    </div>
  );
}
