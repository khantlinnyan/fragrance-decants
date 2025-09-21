import { useState, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters } from "../components/ProductFilters";
import backend from "~backend/client";
import type { ListProductsResponse } from "~backend/products/list";

export function HomePage() {
  const [products, setProducts] = useState<ListProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    scent_family: "",
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await backend.products.list(filters);
      setProducts(response);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-white mb-6">
            Curated Luxury
            <br />
            <span className="text-neutral-400">Fragrance Decants</span>
          </h1>
          <p className="text-xl font-light text-neutral-400 max-w-2xl mx-auto">
            Discover exceptional fragrances in sample sizes. 
            Experience luxury without commitment.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <ProductFilters onFiltersChange={setFilters} />
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-neutral-400">Loading fragrances...</div>
            </div>
          ) : products && products.fragrances.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.fragrances.map((fragrance) => (
                  <ProductCard key={fragrance.id} fragrance={fragrance} />
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-neutral-400">
                  Showing {products.fragrances.length} of {products.total} fragrances
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-400 text-lg">No fragrances found</p>
              <p className="text-neutral-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
