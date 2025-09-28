import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface CreateAccountFromGuestRequest {
  guest_order_id: number;
  password: string;
}

export interface CreateAccountFromGuestResponse {
  user_id: number;
  email: string;
  message: string;
}

export const createFromGuest = api<CreateAccountFromGuestRequest, CreateAccountFromGuestResponse>(
  { expose: true, method: "POST", path: "/auth/create-from-guest" },
  async (req) => {
    if (!req.password || req.password.length < 6) {
      throw APIError.invalidArgument("Password must be at least 6 characters long");
    }

    // Get guest order details
    const guestOrder = await db.queryRow<{
      id: number;
      email: string;
      address_line1: string;
      address_line2: string;
      city: string;
      state_province: string;
      postal_code: string;
      country: string;
      phone: string;
      total_amount: number;
      save_details_for_account: boolean;
    }>`
      SELECT * FROM guest_orders WHERE id = ${req.guest_order_id}
    `;

    if (!guestOrder) {
      throw APIError.notFound("Guest order not found");
    }

    if (!guestOrder.save_details_for_account) {
      throw APIError.invalidArgument("Guest did not opt to save details for account creation");
    }

    // Check if user with this email already exists
    const existingUser = await db.queryRow<{ id: number }>`
      SELECT id FROM users WHERE email = ${guestOrder.email}
    `;

    if (existingUser) {
      throw APIError.invalidArgument("User with this email already exists");
    }

    // Extract name from email (simple approach)
    const name = guestOrder.email.split('@')[0];

    // Create user account
    const user = await db.queryRow<{
      id: number;
      email: string;
    }>`
      INSERT INTO users (
        email, name, address_line1, address_line2, city, 
        state_province, postal_code, country, phone
      )
      VALUES (
        ${guestOrder.email}, ${name}, ${guestOrder.address_line1}, 
        ${guestOrder.address_line2 || ""}, ${guestOrder.city}, 
        ${guestOrder.state_province}, ${guestOrder.postal_code}, 
        ${guestOrder.country}, ${guestOrder.phone || ""}
      )
      RETURNING id, email
    `;

    if (!user) {
      throw APIError.internal("Failed to create user account");
    }

    // Get guest order items
    const guestOrderItems = await db.queryAll<{
      fragrance_id: number;
      decant_size_id: number;
      quantity: number;
      price_per_item: number;
    }>`
      SELECT fragrance_id, decant_size_id, quantity, price_per_item
      FROM guest_order_items
      WHERE guest_order_id = ${req.guest_order_id}
    `;

    // Create a regular order from the guest order
    const order = await db.queryRow<{ id: number }>`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (${user.id}, ${guestOrder.total_amount}, 'confirmed')
      RETURNING id
    `;

    if (!order) {
      throw APIError.internal("Failed to create order");
    }

    // Create order items
    for (const item of guestOrderItems) {
      await db.exec`
        INSERT INTO order_items (order_id, fragrance_id, decant_size_id, quantity, price_per_item)
        VALUES (${order.id}, ${item.fragrance_id}, ${item.decant_size_id}, ${item.quantity}, ${item.price_per_item})
      `;
    }

    // Update guest order status to indicate account was created
    await db.exec`
      UPDATE guest_orders 
      SET status = 'account_created'
      WHERE id = ${req.guest_order_id}
    `;

    return {
      user_id: user.id,
      email: user.email,
      message: "Account created successfully! You can now sign in with your email and password."
    };
  }
);