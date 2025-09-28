import { api } from "encore.dev/api";
import db from "../prisma/database";

export interface RemoveFromCartRequest {
  user_id: number;
  cart_item_id: number;
}

// Removes an item from the user's shopping cart.
export const remove = api<RemoveFromCartRequest, void>(
  { expose: true, method: "DELETE", path: "/cart/remove" },
  async (req) => {
    await db.exec`
      DELETE FROM cart_items 
      WHERE id = ${req.cart_item_id} AND user_id = ${req.user_id}
    `;
  }
);
