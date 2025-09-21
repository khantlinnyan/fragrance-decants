import { Link } from "react-router-dom";
import type { Fragrance } from "~backend/products/list";

interface ProductCardProps {
  fragrance: Fragrance;
}

export function ProductCard({ fragrance }: ProductCardProps) {
  const minPrice = Math.min(...fragrance.prices.map(p => p.price));

  return (
    <Link to={`/product/${fragrance.id}`} className="group block">
      <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden transition-all duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800">
        {/* Image placeholder */}
        <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
          <div className="w-16 h-16 bg-neutral-300 dark:bg-neutral-700 rounded-full flex items-center justify-center">
            <span className="text-2xl font-light text-neutral-600 dark:text-neutral-400">
              {fragrance.brand.charAt(0)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-2">
            <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              {fragrance.brand}
            </p>
            <h3 className="text-lg font-light text-black dark:text-white group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
              {fragrance.name}
            </h3>
          </div>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-2">
            {fragrance.description}
          </p>
          
          <div className="mb-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Scent Family</p>
            <p className="text-sm text-neutral-800 dark:text-neutral-300">{fragrance.scent_family}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">From</p>
              <p className="text-lg font-light text-black dark:text-white">${minPrice.toFixed(2)}</p>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              {fragrance.prices.length} sizes
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
