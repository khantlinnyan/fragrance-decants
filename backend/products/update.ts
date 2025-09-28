import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface UpdateFragranceRequest {
  id: number;
  brand_id?: number;
  name?: string;
  description?: string;
  scent_family?: string;
  top_notes?: string;
  middle_notes?: string;
  base_notes?: string;
  image_url?: string;
  prices?: Array<{
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

export const update = api<UpdateFragranceRequest, FragranceResponse>(
  { expose: true, method: "PUT", path: "/fragrances/:id" },
  async (req) => {
    // Check if fragrance exists
    const existingFragrance = await db.queryRow<{
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
      SELECT * FROM fragrances WHERE id = ${req.id}
    `;

    if (!existingFragrance) {
      throw APIError.notFound("Fragrance not found");
    }

    // Verify brand exists if brand_id is being updated
    if (req.brand_id && req.brand_id !== existingFragrance.brand_id) {
      const brand = await db.queryRow<{ id: number }>`
        SELECT id FROM brands WHERE id = ${req.brand_id}
      `;

      if (!brand) {
        throw APIError.invalidArgument("Brand not found");
      }
    }

    // Update fragrance
    const updatedFragrance = await db.queryRow<{
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
      UPDATE fragrances SET
        brand_id = ${req.brand_id ?? existingFragrance.brand_id},
        name = ${req.name ?? existingFragrance.name},
        description = ${req.description ?? existingFragrance.description},
        scent_family = ${req.scent_family ?? existingFragrance.scent_family},
        top_notes = ${req.top_notes ?? existingFragrance.top_notes},
        middle_notes = ${req.middle_notes ?? existingFragrance.middle_notes},
        base_notes = ${req.base_notes ?? existingFragrance.base_notes},
        image_url = ${req.image_url ?? existingFragrance.image_url}
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!updatedFragrance) {
      throw APIError.internal("Failed to update fragrance");
    }

    // Update prices if provided
    if (req.prices && req.prices.length > 0) {
      // Delete existing prices
      await db.exec`DELETE FROM fragrance_decant_prices WHERE fragrance_id = ${req.id}`;

      // Add new prices
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
          VALUES (${req.id}, ${priceData.decant_size_id}, ${priceData.price})
        `;
      }
    }

    return updatedFragrance;
  }
);