import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface CreateGuestOrderRequest {
  session_id: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone?: string;
  save_details_for_account?: boolean;
  items: Array<{
    fragrance_id: number;
    decant_size_id: number;
    quantity: number;
  }>;
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

export const create = api<CreateGuestOrderRequest, GuestOrder>(
  { expose: true, method: "POST", path: "/guest-orders" },
  async (req) => {
    if (!req.session_id?.trim()) {
      throw APIError.invalidArgument("Session ID is required");
    }

    if (!req.email?.trim()) {
      throw APIError.invalidArgument("Email is required");
    }

    if (!req.address_line1?.trim()) {
      throw APIError.invalidArgument("Address line 1 is required");
    }

    if (!req.city?.trim()) {
      throw APIError.invalidArgument("City is required");
    }

    if (!req.state_province?.trim()) {
      throw APIError.invalidArgument("State/Province is required");
    }

    if (!req.postal_code?.trim()) {
      throw APIError.invalidArgument("Postal code is required");
    }

    if (!req.country?.trim()) {
      throw APIError.invalidArgument("Country is required");
    }

    if (!req.items || req.items.length === 0) {
      throw APIError.invalidArgument("At least one item is required");
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of req.items) {
      if (item.quantity <= 0) {
        throw APIError.invalidArgument("Quantity must be greater than 0");
      }

      // Get fragrance and price information
      const itemData = await db.queryRow<{
        fragrance_id: number;
        fragrance_name: string;
        brand_name: string;
        decant_size_id: number;
        size_label: string;
        price: number;
      }>`
        SELECT 
          f.id as fragrance_id,
          f.name as fragrance_name,
          b.name as brand_name,
          ds.id as decant_size_id,
          ds.label as size_label,
          fdp.price
        FROM fragrances f
        JOIN brands b ON f.brand_id = b.id
        JOIN decant_sizes ds ON ds.id = ${item.decant_size_id}
        JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id AND ds.id = fdp.decant_size_id
        WHERE f.id = ${item.fragrance_id}
      `;

      if (!itemData) {
        throw APIError.invalidArgument(`Invalid fragrance or decant size combination`);
      }

      const itemTotal = itemData.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        ...itemData,
        quantity: item.quantity,
        price_per_item: itemData.price,
      });
    }

    // Create guest order
    const guestOrder = await db.queryRow<{
      id: number;
      created_at: Date;
    }>`
      INSERT INTO guest_orders (
        session_id, email, address_line1, address_line2, city, 
        state_province, postal_code, country, phone, total_amount, 
        status, save_details_for_account
      )
      VALUES (
        ${req.session_id}, ${req.email}, ${req.address_line1}, ${req.address_line2 || ""}, 
        ${req.city}, ${req.state_province}, ${req.postal_code}, ${req.country}, 
        ${req.phone || ""}, ${totalAmount}, 'pending', ${req.save_details_for_account || false}
      )
      RETURNING id, created_at
    `;

    if (!guestOrder) {
      throw APIError.internal("Failed to create guest order");
    }

    // Create guest order items
    for (const item of validatedItems) {
      await db.exec`
        INSERT INTO guest_order_items (guest_order_id, fragrance_id, decant_size_id, quantity, price_per_item)
        VALUES (${guestOrder.id}, ${item.fragrance_id}, ${item.decant_size_id}, ${item.quantity}, ${item.price_per_item})
      `;
    }

    // Clear guest cart for this session
    await db.exec`DELETE FROM guest_cart_items WHERE session_id = ${req.session_id}`;

    return {
      id: guestOrder.id,
      session_id: req.session_id,
      email: req.email,
      address_line1: req.address_line1,
      address_line2: req.address_line2,
      city: req.city,
      state_province: req.state_province,
      postal_code: req.postal_code,
      country: req.country,
      phone: req.phone,
      total_amount: totalAmount,
      status: 'pending',
      save_details_for_account: req.save_details_for_account || false,
      created_at: guestOrder.created_at,
      items: validatedItems.map(item => ({
        fragrance_name: item.fragrance_name,
        brand_name: item.brand_name,
        size_label: item.size_label,
        quantity: item.quantity,
        price_per_item: item.price_per_item,
      })),
    };
  }
);