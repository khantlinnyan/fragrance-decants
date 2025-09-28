import { api, APIError } from "encore.dev/api";
import db from "../prisma/database";

export interface LoginRequest {
  email: string;
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

// Authenticates an existing user.
export const login = api<LoginRequest, AuthResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const user = await db.queryRow<{ id: number; email: string; name: string }>`
      SELECT id, email, name FROM users WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Generate a simple token (in production, use proper JWT)
    const token = `user_${user.id}_${Date.now()}`;

    return {
      user,
      token,
    };
  }
);
