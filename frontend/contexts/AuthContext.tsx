import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import backend from "~backend/client";
import type { AuthResponse } from "~backend/auth/register";

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await backend.auth.login({ email, password });
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const response: AuthResponse = await backend.auth.register({ email, name, password });
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
