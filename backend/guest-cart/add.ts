import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface AddToGuestCartRequest {
  session_id: string;
  fragrance_id: number;
  decant_size_id: number;
  quantity?: number;
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

export const add = api<AddToGuestCartRequest, GuestCartItem>(
  { expose: true, method: "POST", path: "/guest-cart/add" },
  async (req) => {
    if (!req.session_id?.trim()) {
      throw APIError.invalidArgument("Session ID is required");
    }

    const quantity = req.quantity || 1;

    if (quantity <= 0) {
      throw APIError.invalidArgument("Quantity must be greater than 0");
    }

    // Verify fragrance and get price information
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
      JOIN decant_sizes ds ON ds.id = ${req.decant_size_id}
      JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id AND ds.id = fdp.decant_size_id
      WHERE f.id = ${req.fragrance_id}
    `;

    if (!itemData) {
      throw APIError.invalidArgument("Invalid fragrance or decant size combination");
    }

    // Check if item already exists in cart
    const existingItem = await db.queryRow<{ id: number; quantity: number }>`
      SELECT id, quantity FROM guest_cart_items 
      WHERE session_id = ${req.session_id} 
        AND fragrance_id = ${req.fragrance_id} 
        AND decant_size_id = ${req.decant_size_id}
    `;

    let cartItem;

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      cartItem = await db.queryRow<{
        id: number;
        quantity: number;
      }>`
        UPDATE guest_cart_items 
        SET quantity = ${newQuantity}
        WHERE id = ${existingItem.id}
        RETURNING id, quantity
      `;
    } else {
      // Create new cart item
      cartItem = await db.queryRow<{
        id: number;
        quantity: number;
      }>`
        INSERT INTO guest_cart_items (session_id, fragrance_id, decant_size_id, quantity)
        VALUES (${req.session_id}, ${req.fragrance_id}, ${req.decant_size_id}, ${quantity})
        RETURNING id, quantity
      `;
    }

    if (!cartItem) {
      throw APIError.internal("Failed to add item to cart");
    }

    return {
      id: cartItem.id,
      fragrance_id: itemData.fragrance_id,
      fragrance_name: itemData.fragrance_name,
      brand_name: itemData.brand_name,
      decant_size_id: itemData.decant_size_id,
      size_label: itemData.size_label,
      quantity: cartItem.quantity,
      price_per_item: itemData.price,
      total_price: itemData.price * cartItem.quantity,
    };
  }
);