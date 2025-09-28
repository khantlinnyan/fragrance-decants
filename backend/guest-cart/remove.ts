import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface RemoveFromGuestCartRequest {
  id: number;
}

export interface RemoveFromGuestCartResponse {
  success: boolean;
  message: string;
}

export const remove = api<RemoveFromGuestCartRequest, RemoveFromGuestCartResponse>(
  { expose: true, method: "DELETE", path: "/guest-cart/:id" },
  async (req) => {
    // Check if cart item exists
    const existingItem = await db.queryRow<{ id: number }>`
      SELECT id FROM guest_cart_items WHERE id = ${req.id}
    `;

    if (!existingItem) {
      throw APIError.notFound("Cart item not found");
    }

    // Remove item
    await db.exec`DELETE FROM guest_cart_items WHERE id = ${req.id}`;

    return {
      success: true,
      message: "Item removed from cart"
    };
  }
);