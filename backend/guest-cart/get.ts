import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface GetGuestCartRequest {
  session_id: Query<string>;
}

export interface GuestCartItem {
  id: number;
  fragrance_id: number;
  fragrance_name: string;
  brand_name: string;
  decant_size_id: number;
  size_label: string;
  quantity: number;
  price_per_item: number;
  total_price: number;
}

export interface GuestCartResponse {
  items: GuestCartItem[];
  total_items: number;
  total_amount: number;
}

export const get = api<GetGuestCartRequest, GuestCartResponse>(
  { expose: true, method: "GET", path: "/guest-cart" },
  async (req) => {
    const items = await db.queryAll<{
      id: number;
      fragrance_id: number;
      fragrance_name: string;
      brand_name: string;
      decant_size_id: number;
      size_label: string;
      quantity: number;
      price_per_item: number;
    }>`
      SELECT 
        gci.id,
        f.id as fragrance_id,
        f.name as fragrance_name,
        b.name as brand_name,
        ds.id as decant_size_id,
        ds.label as size_label,
        gci.quantity,
        fdp.price as price_per_item
      FROM guest_cart_items gci
      JOIN fragrances f ON gci.fragrance_id = f.id
      JOIN brands b ON f.brand_id = b.id
      JOIN decant_sizes ds ON gci.decant_size_id = ds.id
      JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id AND ds.id = fdp.decant_size_id
      WHERE gci.session_id = ${req.session_id}
      ORDER BY gci.created_at DESC
    `;

    const cartItems: GuestCartItem[] = items.map(item => ({
      ...item,
      total_price: item.price_per_item * item.quantity,
    }));

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);

    return {
      items: cartItems,
      total_items: totalItems,
      total_amount: totalAmount,
    };
  }
);