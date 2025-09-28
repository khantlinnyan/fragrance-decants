import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../prisma/database";

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
    size_ml: number;
    label: string;
    price: number;
  }>;
}

export interface ListProductsResponse {
  fragrances: Fragrance[];
  total: number;
}

// Retrieves all fragrances with optional filtering and search.
export const list = api<ListProductsRequest, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    let whereConditions = [];
    let params: any[] = [];
    let paramCount = 0;

    if (req.search) {
      paramCount++;
      whereConditions.push(
        `(f.name ILIKE $${paramCount} OR b.name ILIKE $${paramCount} OR f.description ILIKE $${paramCount})`
      );
      params.push(`%${req.search}%`);
    }

    if (req.brand) {
      paramCount++;
      whereConditions.push(`b.name ILIKE $${paramCount}`);
      params.push(`%${req.brand}%`);
    }

    if (req.scent_family) {
      paramCount++;
      whereConditions.push(`f.scent_family ILIKE $${paramCount}`);
      params.push(`%${req.scent_family}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM fragrances f
      JOIN brands b ON f.brand_id = b.id
      ${whereClause}
    `;

    const totalResult = await db.rawQueryRow<{ total: string }>(
      countQuery,
      ...params
    );
    const total = parseInt(totalResult?.total || "0");

    // Get fragrances with prices
    const query = `
      SELECT 
        f.id,
        b.name as brand,
        f.name,
        f.description,
        f.scent_family,
        f.top_notes,
        f.middle_notes,
        f.base_notes,
        f.image_url,
        ds.size_ml,
        ds.label,
        fdp.price
      FROM fragrances f
      JOIN brands b ON f.brand_id = b.id
      JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id
      JOIN decant_sizes ds ON fdp.decant_size_id = ds.id
      ${whereClause}
      ORDER BY b.name, f.name, ds.size_ml
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const rows = await db.rawQueryAll<{
      id: number;
      brand: string;
      name: string;
      description: string;
      scent_family: string;
      top_notes: string;
      middle_notes: string;
      base_notes: string;
      image_url: string;
      size_ml: number;
      label: string;
      price: number;
    }>(query, ...params, limit, offset);

    // Group by fragrance
    const fragranceMap = new Map<number, Fragrance>();

    for (const row of rows) {
      if (!fragranceMap.has(row.id)) {
        fragranceMap.set(row.id, {
          id: row.id,
          brand: row.brand,
          name: row.name,
          description: row.description,
          scent_family: row.scent_family,
          top_notes: row.top_notes,
          middle_notes: row.middle_notes,
          base_notes: row.base_notes,
          image_url: row.image_url,
          prices: [],
        });
      }

      const fragrance = fragranceMap.get(row.id)!;
      fragrance.prices.push({
        size_ml: row.size_ml,
        label: row.label,
        price: row.price,
      });
    }

    return {
      fragrances: Array.from(fragranceMap.values()),
      total,
    };
  }
);
