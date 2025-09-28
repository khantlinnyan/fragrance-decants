import { api, APIError } from "encore.dev/api";
import db from "../prisma/database";

export interface GetProductRequest {
  id: number;
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

// Retrieves a specific fragrance by ID.
export const get = api<GetProductRequest, Fragrance>(
  { expose: true, method: "GET", path: "/products/:id" },
  async (req) => {
    const rows = await db.queryAll<{
      id: number;
      brand: string;
      name: string;
      description: string;
      scent_family: string;
      top_notes: string;
      middle_notes: string;
      base_notes: string;
      image_url: string;
      size_id: number;
      size_ml: number;
      label: string;
      price: number;
    }>`
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
        ds.id as size_id,
        ds.size_ml,
        ds.label,
        fdp.price
      FROM fragrances f
      JOIN brands b ON f.brand_id = b.id
      JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id
      JOIN decant_sizes ds ON fdp.decant_size_id = ds.id
      WHERE f.id = ${req.id}
      ORDER BY ds.size_ml
    `;

    if (rows.length === 0) {
      throw APIError.notFound("Fragrance not found");
    }

    const first = rows[0];
    return {
      id: first.id,
      brand: first.brand,
      name: first.name,
      description: first.description,
      scent_family: first.scent_family,
      top_notes: first.top_notes,
      middle_notes: first.middle_notes,
      base_notes: first.base_notes,
      image_url: first.image_url,
      prices: rows.map((row) => ({
        size_id: row.size_id,
        size_ml: row.size_ml,
        label: row.label,
        price: row.price,
      })),
    };
  }
);
