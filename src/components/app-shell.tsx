"use client";

import { ReactNode } from "react";
import { ShopProvider } from "@/lib/shop-context";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShopProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </ShopProvider>
  );
}
