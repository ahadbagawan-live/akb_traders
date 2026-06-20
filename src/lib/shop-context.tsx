"use client";

import { createContext, useContext, useState, useCallback, useSyncExternalStore, ReactNode } from "react";
import { Shop } from "./types";
import { getShops, getActiveShopId, setActiveShopId } from "./store";

interface ShopContextType {
  shops: Shop[];
  activeShopId: string;
  activeShop: Shop | undefined;
  switchShop: (id: string) => void;
  refreshShops: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const emptySubscribe = () => () => {};

function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const mounted = useIsMounted();
  const [shops, setShops] = useState<Shop[]>(() => (typeof window !== "undefined" ? getShops() : []));
  const [activeShopIdState, setActiveShopIdState] = useState<string>(() => (typeof window !== "undefined" ? getActiveShopId() : "shop-1"));

  const activeShop = shops.find((s) => s.id === activeShopIdState);

  const switchShop = useCallback((id: string) => {
    setActiveShopId(id);
    setActiveShopIdState(id);
  }, []);

  const refreshShops = useCallback(() => {
    setShops(getShops());
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ShopContext.Provider
      value={{ shops, activeShopId: activeShopIdState, activeShop, switchShop, refreshShops }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop(): ShopContextType {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within a ShopProvider");
  return ctx;
}
