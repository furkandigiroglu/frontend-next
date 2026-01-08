"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { MarketplaceProduct } from "@/types/product";

interface WishlistContextType {
  items: MarketplaceProduct[];
  addItem: (product: MarketplaceProduct) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: MarketplaceProduct) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem("wishlist", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = useCallback((product: MarketplaceProduct) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleItem = useCallback((product: MarketplaceProduct) => {
      setItems(prev => {
          const exists = prev.some(item => item.id === product.id);
          if (exists) {
              return prev.filter(item => item.id !== product.id);
          } else {
              return [...prev, product];
          }
      });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some((item) => item.id === productId);
  }, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        wishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
