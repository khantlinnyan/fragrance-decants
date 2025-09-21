import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface CreateOrderRequest {
  user_id: number;
}

export interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: Date;
  items: Array<{
    fragrance_name: string;
    brand_name: string;
    size_label: string;
    quantity: number;
    price_per_item: number;
  }>;
}

// Creates a new order from the user's shopping cart.
export const create = api<CreateOrderRequest, Order>(
  { expose: true, method: "POST", path: "/orders/create" },
  async (req) => {
    // Get cart items
    const cartItems = await db.queryAll<{
      fragrance_id: number;
      fragrance_name: string;
      brand_name: string;
      decant_size_id: number;
      size_label: string;
      quantity: number;
      price_per_item: number;
    }>`
      SELECT 
        ci.fragrance_id,
        f.name as fragrance_name,
        b.name as brand_name,
        ci.decant_size_id,
        ds.label as size_label,
        ci.quantity,
        fdp.price as price_per_item
      FROM cart_items ci
      JOIN fragrances f ON ci.fragrance_id = f.id
      JOIN brands b ON f.brand_id = b.id
      JOIN decant_sizes ds ON ci.decant_size_id = ds.id
      JOIN fragrance_decant_prices fdp ON f.id = fdp.fragrance_id AND ds.id = fdp.decant_size_id
      WHERE ci.user_id = ${req.user_id}
    `;

    if (cartItems.length === 0) {
      throw APIError.invalidArgument("Cart is empty");
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price_per_item), 0);

    // Create order
    const order = await db.queryRow<{ id: number; created_at: Date }>`
      INSERT INTO orders (user_id, total_amount, status)
      VALUES (${req.user_id}, ${totalAmount}, 'confirmed')
      RETURNING id, created_at
    `;

    if (!order) {
      throw APIError.internal("Failed to create order");
    }

    // Create order items
    for (const item of cartItems) {
      await db.exec`
        INSERT INTO order_items (order_id, fragrance_id, decant_size_id, quantity, price_per_item)
        VALUES (${order.id}, ${item.fragrance_id}, ${item.decant_size_id}, ${item.quantity}, ${item.price_per_item})
      `;
    }

    // Clear cart
    await db.exec`DELETE FROM cart_items WHERE user_id = ${req.user_id}`;

    return {
      id: order.id,
      total_amount: totalAmount,
      status: 'confirmed',
      created_at: order.created_at,
      items: cartItems.map(item => ({
        fragrance_name: item.fragrance_name,
        brand_name: item.brand_name,
        size_label: item.size_label,
        quantity: item.quantity,
        price_per_item: item.price_per_item,
      })),
    };
  }
);
