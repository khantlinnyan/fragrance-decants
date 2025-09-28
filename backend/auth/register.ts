import { api, APIError } from "encore.dev/api";
import db from "../prisma/database";

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
}

// Creates a new user account.
export const register = api<RegisterRequest, AuthResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Check if user already exists
    const existingUser = await db.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }

    // Create new user
    const user = await db.queryRow<{ id: number; email: string; name: string }>`
      INSERT INTO users (email, name) 
      VALUES (${req.email}, ${req.name})
      RETURNING id, email, name
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
    }

    // Generate a simple token (in production, use proper JWT)
    const token = `user_${user.id}_${Date.now()}`;

    return {
      user,
      token,
    };
  }
);
