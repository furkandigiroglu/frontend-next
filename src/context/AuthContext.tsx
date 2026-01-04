"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken, setToken, login as apiLogin } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for token on mount
    const storedToken = getToken();
    if (storedToken) {
      setTokenState(storedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const data = await apiLogin(username, password);
      if (data.access_token) {
        setToken(data.access_token);
        setTokenState(data.access_token);
        setIsAuthenticated(true);
        router.refresh(); // Refresh to update server components if needed
      }
    } catch (error) {
      console.error("Login failed in context:", error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setIsAuthenticated(false);
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, logout }}>
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
