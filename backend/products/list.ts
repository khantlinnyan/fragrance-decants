import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
// NOTE: Assuming your prisma/database file exports 'prisma' as the client instance
import { prisma } from "../prisma/database";
import { Prisma } from "../prisma/generated/client"; // Import Prisma types for BigInt conversion

// --- Type Interfaces (No Change) ---
export interface ListProductsRequest {
  search?: Query<string>;
  brand?: Query<string>;
  scent_family?: Query<string>;
  min_price?: Query<number>;
  max_price?: Query<number>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface Fragrance {
  id: number;
  brand: string;
  name: string;
  description: string;
  scent_family: string;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  image_url: string;
  prices: Array<{
    size_id: number;
    size_ml: number;
    label: string;
    price: number;
  }>;
}

export interface ListProductsResponse {
  fragrances: Fragrance[];
  total: number;
}

// --- Prisma Implementation ---
export const list = api<ListProductsRequest, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    // 1. Construct the WHERE clause using Prisma's filter syntax
    const where: Prisma.fragrancesWhereInput = {};
    const searchConditions: Prisma.fragrancesWhereInput[] = [];

    // Search filter (ILIKE equivalent using contains and mode: 'insensitive')
    if (req.search) {
      const search = req.search.toLowerCase();
      searchConditions.push({
        name: { contains: search, mode: "insensitive" },
      });
      searchConditions.push({
        description: { contains: search, mode: "insensitive" },
      });
      searchConditions.push({
        brand: { name: { contains: search, mode: "insensitive" } },
      });
    }

    // Combining search with OR
    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }

    // Brand filter (ILIKE equivalent)
    if (req.brand) {
      where.brand = { name: { contains: req.brand, mode: "insensitive" } };
    }

    // Scent family filter (ILIKE equivalent)
    if (req.scent_family) {
      where.scent_family = { contains: req.scent_family, mode: "insensitive" };
    }

    // NOTE on Price Filtering: Price filtering in SQL was simplified by joining
    // all prices and checking the min/max in the WHERE clause. Doing this efficiently
    // in Prisma requires checking for fragrances that have *at least one* price
    // within the range, which typically uses the `some` relational filter.

    const priceConditions: Prisma.fragrance_decant_pricesWhereInput[] = [];

    if (req.min_price) {
      priceConditions.push({ price: { gte: req.min_price } });
    }
    if (req.max_price) {
      priceConditions.push({ price: { lte: req.max_price } });
    }

    if (priceConditions.length > 0) {
      where.fragrance_decant_prices = {
        some: {
          AND: priceConditions,
        },
      };
    }

    // 2. Get the total count
    const total = await prisma.fragrances.count({
      where: where,
    });

    // 3. Fetch fragrances with related data (brands and prices)
    const prismaFragrances = await prisma.fragrances.findMany({
      where: where,
      select: {
        id: true,
        name: true,
        description: true,
        scent_family: true,
        top_notes: true,
        middle_notes: true,
        base_notes: true,
        image_url: true,
        brand: {
          select: { name: true },
        },
        fragrance_decant_prices: {
          select: {
            price: true,
            decant_size: {
              select: { size_ml: true, label: true },
            },
          },
          // Match your SQL ORDER BY: ds.size_ml
          orderBy: {
            decant_size: { size_ml: "asc" },
          },
        },
      },
      // Match your SQL ORDER BY: b.name, f.name
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
      skip: offset,
      take: limit,
    });

    // 4. Reshape the data to match the Fragrance interface
    const fragrances: Fragrance[] = prismaFragrances.map((pf) => {
      // Convert BigInt ID to number, handling potential large numbers if necessary.
      // Since your interface uses number, we cast it.
      const id = Number(pf.id);

      return {
        id: id,
        brand: pf.brand.name,
        name: pf.name,
        description: pf.description || "",
        scent_family: pf.scent_family || "",
        top_notes: pf.top_notes || "",
        middle_notes: pf.middle_notes || "",
        base_notes: pf.base_notes || "",
        image_url: pf.image_url || "",
        prices: pf.fragrance_decant_prices.map((pdp) => ({
          size_ml: pdp.decant_size.size_ml,
          label: pdp.decant_size.label,
          price: pdp.price,
        })),
      };
    });

    return {
      fragrances,
      total,
    };
  }
);
