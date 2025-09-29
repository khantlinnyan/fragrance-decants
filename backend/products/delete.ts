import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface DeleteFragranceRequest {
  id: number;
}

export interface DeleteFragranceResponse {
  success: boolean;
  message: string;
}

export const deleteFragrance = api<DeleteFragranceRequest, DeleteFragranceResponse>(
  { expose: true, method: "DELETE", path: "/fragrances/:id" },
  async (req) => {
    // Check if fragrance exists
    const existingFragrance = await db.queryRow<{ id: number }>`
      SELECT id FROM fragrances WHERE id = ${req.id}
    `;

    if (!existingFragrance) {
      throw APIError.notFound("Fragrance not found");
    }

    // Check if fragrance is referenced in any orders or cart items
    const references = await db.queryRow<{ 
      order_items_count: string;
      cart_items_count: string;
      guest_order_items_count: string;
      guest_cart_items_count: string;
    }>`
      SELECT 
        (SELECT COUNT(*) FROM order_items WHERE fragrance_id = ${req.id}) as order_items_count,
        (SELECT COUNT(*) FROM cart_items WHERE fragrance_id = ${req.id}) as cart_items_count,
        (SELECT COUNT(*) FROM guest_order_items WHERE fragrance_id = ${req.id}) as guest_order_items_count,
        (SELECT COUNT(*) FROM guest_cart_items WHERE fragrance_id = ${req.id}) as guest_cart_items_count
    `;

    const totalReferences = 
      parseInt(references?.order_items_count || '0') +
      parseInt(references?.cart_items_count || '0') +
      parseInt(references?.guest_order_items_count || '0') +
      parseInt(references?.guest_cart_items_count || '0');

    if (totalReferences > 0) {
      throw APIError.invalidArgument(
        "Cannot delete fragrance that is referenced in orders or cart items"
      );
    }

    // Delete fragrance prices first (due to foreign key constraints)
    await db.exec`DELETE FROM fragrance_decant_prices WHERE fragrance_id = ${req.id}`;

    // Delete the fragrance
    await db.exec`DELETE FROM fragrances WHERE id = ${req.id}`;

    return {
      success: true,
      message: "Fragrance deleted successfully"
    };
  }
);