import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    brand: string;
    scent_family: string;
    min_price: number | undefined;
    max_price: number | undefined;
  }) => void;
}

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [scentFamily, setScentFamily] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleApplyFilters = () => {
    onFiltersChange({
      search,
      brand,
      scent_family: scentFamily,
      min_price: minPrice ? parseFloat(minPrice) : undefined,
      max_price: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setBrand("");
    setScentFamily("");
    setMinPrice("");
    setMaxPrice("");
    onFiltersChange({
      search: "",
      brand: "",
      scent_family: "",
      min_price: undefined,
      max_price: undefined,
    });
  };

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search fragrances..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Trigger search immediately
              setTimeout(() => {
                onFiltersChange({
                  search: e.target.value,
                  brand,
                  scent_family: scentFamily,
                  min_price: minPrice ? parseFloat(minPrice) : undefined,
                  max_price: maxPrice ? parseFloat(maxPrice) : undefined,
                });
              }, 300);
            }}
            className="pl-10 bg-neutral-900 border-neutral-700 focus:border-white text-white placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="ml-4 border-neutral-700 text-white hover:bg-neutral-800">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-black border-neutral-800 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">Filters</SheetTitle>
            <SheetDescription className="text-neutral-400">
              Refine your fragrance search
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="filter-brand" className="text-sm font-light">
                Brand
              </Label>
              <Input
                id="filter-brand"
                placeholder="e.g. Tom Ford"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-scent" className="text-sm font-light">
                Scent Family
              </Label>
              <Input
                id="filter-scent"
                placeholder="e.g. Oriental Woody"
                value={scentFamily}
                onChange={(e) => setScentFamily(e.target.value)}
                className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-light">Price Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-6">
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-white text-black hover:bg-neutral-200"
              >
                Apply Filters
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-neutral-700 text-white hover:bg-neutral-800"
              >
                Clear
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
