"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken, setToken, login as apiLogin, getProfile } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";

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
  const params = useParams();
  const locale = (params?.locale as string) || "fi";

  useEffect(() => {
    async function initAuth() {
      const storedToken = getToken();
      if (storedToken) {
        try {
          // Verify token is still valid by fetching profile
          await getProfile(storedToken);
          setTokenState(storedToken);
          setIsAuthenticated(true);
        } catch (err) {
          console.warn("Invalid token found, logging out...", err);
          removeToken();
          setTokenState(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    }
    
    initAuth();
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
    // Redirect to login page with correct locale
    // Fix: Login page is at /[locale]/login, not /[locale]/auth/login due to route group (auth)
    router.push(`/${locale}/login`);
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
