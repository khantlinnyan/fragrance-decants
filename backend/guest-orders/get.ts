import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface GetGuestOrderRequest {
  id: number;
}

export interface GuestOrder {
  id: number;
  session_id: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone?: string;
  total_amount: number;
  status: string;
  save_details_for_account: boolean;
  created_at: Date;
  items: Array<{
    fragrance_name: string;
    brand_name: string;
    size_label: string;
    quantity: number;
    price_per_item: number;
  }>;
}

export const get = api<GetGuestOrderRequest, GuestOrder>(
  { expose: true, method: "GET", path: "/guest-orders/:id" },
  async (req) => {
    // Get guest order
    const guestOrder = await db.queryRow<{
      id: number;
      session_id: string;
      email: string;
      address_line1: string;
      address_line2: string;
      city: string;
      state_province: string;
      postal_code: string;
      country: string;
      phone: string;
      total_amount: number;
      status: string;
      save_details_for_account: boolean;
      created_at: Date;
    }>`
      SELECT * FROM guest_orders WHERE id = ${req.id}
    `;

    if (!guestOrder) {
      throw APIError.notFound("Guest order not found");
    }

    // Get order items
    const items = await db.queryAll<{
      fragrance_name: string;
      brand_name: string;
      size_label: string;
      quantity: number;
      price_per_item: number;
    }>`
      SELECT 
        f.name as fragrance_name,
        b.name as brand_name,
        ds.label as size_label,
        goi.quantity,
        goi.price_per_item
      FROM guest_order_items goi
      JOIN fragrances f ON goi.fragrance_id = f.id
      JOIN brands b ON f.brand_id = b.id
      JOIN decant_sizes ds ON goi.decant_size_id = ds.id
      WHERE goi.guest_order_id = ${req.id}
      ORDER BY f.name
    `;

    return {
      ...guestOrder,
      address_line2: guestOrder.address_line2 || undefined,
      phone: guestOrder.phone || undefined,
      items,
    };
  }
);