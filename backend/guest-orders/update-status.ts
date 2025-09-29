import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface UpdateGuestOrderStatusRequest {
  id: number;
  status: string;
}

export interface UpdateGuestOrderStatusResponse {
  success: boolean;
  message: string;
}

export const updateStatus = api<UpdateGuestOrderStatusRequest, UpdateGuestOrderStatusResponse>(
  { expose: true, method: "PUT", path: "/guest-orders/:id/status" },
  async (req) => {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(req.status)) {
      throw APIError.invalidArgument(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Check if guest order exists
    const existingOrder = await db.queryRow<{ id: number; status: string }>`
      SELECT id, status FROM guest_orders WHERE id = ${req.id}
    `;

    if (!existingOrder) {
      throw APIError.notFound("Guest order not found");
    }

    // Update status
    await db.exec`
      UPDATE guest_orders 
      SET status = ${req.status}, updated_at = NOW()
      WHERE id = ${req.id}
    `;

    return {
      success: true,
      message: `Order status updated to ${req.status}`
    };
  }
);