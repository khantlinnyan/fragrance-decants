import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface AddToCartRequest {
  user_id: number;
  fragrance_id: number;
  decant_size_id: number;
  quantity: number;
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

// Adds an item to the user's shopping cart.
export const add = api<AddToCartRequest, CartItem>(
  { expose: true, method: "POST", path: "/cart/add" },
  async (req) => {
    // Check if item already exists in cart
    const existingItem = await db.queryRow<{ id: number; quantity: number }>`
      SELECT id, quantity FROM cart_items 
      WHERE user_id = ${req.user_id} 
      AND fragrance_id = ${req.fragrance_id} 
      AND decant_size_id = ${req.decant_size_id}
    `;

    let cartItemId: number;

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + req.quantity;
      await db.exec`
        UPDATE cart_items 
        SET quantity = ${newQuantity}
        WHERE id = ${existingItem.id}
      `;
      cartItemId = existingItem.id;
    } else {
      // Insert new item
      const newItem = await db.queryRow<{ id: number }>`
        INSERT INTO cart_items (user_id, fragrance_id, decant_size_id, quantity)
        VALUES (${req.user_id}, ${req.fragrance_id}, ${req.decant_size_id}, ${req.quantity})
        RETURNING id
      `;
      
      if (!newItem) {
        throw APIError.internal("Failed to add item to cart");
      }
      cartItemId = newItem.id;
    }

    // Get the cart item details
    const cartItem = await db.queryRow<{
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
      WHERE ci.id = ${cartItemId}
    `;

    if (!cartItem) {
      throw APIError.internal("Failed to retrieve cart item");
    }

    return {
      id: cartItem.id,
      fragrance_id: cartItem.fragrance_id,
      fragrance_name: cartItem.fragrance_name,
      brand_name: cartItem.brand_name,
      decant_size_id: cartItem.decant_size_id,
      size_ml: cartItem.size_ml,
      size_label: cartItem.size_label,
      quantity: cartItem.quantity,
      price_per_item: cartItem.price_per_item,
      total_price: cartItem.quantity * cartItem.price_per_item,
    };
  }
);
