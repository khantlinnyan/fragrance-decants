import { api } from "encore.dev/api";
import db from "../prisma/database";

export interface GetCartRequest {
  user_id: number;
}

export interface CartItem {
  id: number;
  fragrance_id: number;
  fragrance_name: string;
  brand_name: string;
  decant_size_id: number;
  size_ml: number;
  size_label: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

export interface GetCartResponse {
  items: CartItem[];
  total_amount: number;
}

// Retrieves the user's shopping cart.
export const get = api<GetCartRequest, GetCartResponse>(
  { expose: true, method: "GET", path: "/cart/:user_id" },
  async (req) => {
    const items = await db.queryAll<{
      id: number;
      fragrance_id: number;
      fragrance_name: string;
      brand_name: string;
      decant_size_id: number;
      size_ml: number;
      size_label: string;
      quantity: number;
      price_per_item: number;
    }>`
      SELECT 
        ci.id,
        ci.fragrance_id,
        f.name as fragrance_name,
        b.name as brand_name,
        ci.decant_size_id,
        ds.size_ml,
        ds.label as size_label,
        ci.quantity,
        fdp.price as price_per_item
      FROM cart_items ci
      JOIN fragrances f ON ci.fragrance_id = f.id
      JOIN brands b ON f.brand_id = b.id
      JOIN decant_sizes ds ON ci.decant_size_id = ds.id
      JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id AND ds.id = fdp.decant_size_id
      WHERE ci.user_id = ${req.user_id}
      ORDER BY ci.created_at DESC
    `;

    const cartItems: CartItem[] = items.map((item) => ({
      id: item.id,
      fragrance_id: item.fragrance_id,
      fragrance_name: item.fragrance_name,
      brand_name: item.brand_name,
      decant_size_id: item.decant_size_id,
      size_ml: item.size_ml,
      size_label: item.size_label,
      quantity: item.quantity,
      price_per_item: item.price_per_item,
      total_price: item.quantity * item.price_per_item,
    }));

    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    return {
      items: cartItems,
      total_amount,
    };
  }
);
