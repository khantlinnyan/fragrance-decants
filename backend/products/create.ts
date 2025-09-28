import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface CreateFragranceRequest {
  brand_id: number;
  name: string;
  description?: string;
  scent_family?: string;
  top_notes?: string;
  middle_notes?: string;
  base_notes?: string;
  image_url?: string;
  prices: Array<{
    decant_size_id: number;
    price: number;
  }>;
}

export interface FragranceResponse {
  id: number;
  brand_id: number;
  name: string;
  description: string;
  scent_family: string;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  image_url: string;
  created_at: Date;
}

export const create = api<CreateFragranceRequest, FragranceResponse>(
  { expose: true, method: "POST", path: "/fragrances" },
  async (req) => {
    if (!req.name?.trim()) {
      throw APIError.invalidArgument("Name is required");
    }

    if (!req.brand_id) {
      throw APIError.invalidArgument("Brand ID is required");
    }

    if (!req.prices || req.prices.length === 0) {
      throw APIError.invalidArgument("At least one price must be specified");
    }

    // Verify brand exists
    const brand = await db.queryRow<{ id: number }>`
      SELECT id FROM brands WHERE id = ${req.brand_id}
    `;

    if (!brand) {
      throw APIError.invalidArgument("Brand not found");
    }

    // Create fragrance
    const fragrance = await db.queryRow<{
      id: number;
      brand_id: number;
      name: string;
      description: string;
      scent_family: string;
      top_notes: string;
      middle_notes: string;
      base_notes: string;
      image_url: string;
      created_at: Date;
    }>`
      INSERT INTO fragrances (
        brand_id, name, description, scent_family, 
        top_notes, middle_notes, base_notes, image_url
      )
      VALUES (
        ${req.brand_id}, ${req.name}, ${req.description || ""}, ${req.scent_family || ""}, 
        ${req.top_notes || ""}, ${req.middle_notes || ""}, ${req.base_notes || ""}, ${req.image_url || ""}
      )
      RETURNING *
    `;

    if (!fragrance) {
      throw APIError.internal("Failed to create fragrance");
    }

    // Add prices
    for (const priceData of req.prices) {
      // Verify decant size exists
      const decanSize = await db.queryRow<{ id: number }>`
        SELECT id FROM decant_sizes WHERE id = ${priceData.decant_size_id}
      `;

      if (!decanSize) {
        throw APIError.invalidArgument(`Decant size ${priceData.decant_size_id} not found`);
      }

      await db.exec`
        INSERT INTO fragrance_decant_prices (fragrance_id, decant_size_id, price)
        VALUES (${fragrance.id}, ${priceData.decant_size_id}, ${priceData.price})
      `;
    }

    return fragrance;
  }
);