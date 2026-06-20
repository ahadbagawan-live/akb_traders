"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShop } from "@/lib/shop-context";
import { useStoreData } from "@/lib/use-store-data";
import { getCustomers, getProducts, getOrders, getBills } from "@/lib/store";
import { Users, Package, ShoppingCart, FileText, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { activeShopId, activeShop } = useShop();

  const [customers] = useStoreData(() => getCustomers(activeShopId), activeShopId);
  const [products] = useStoreData(() => getProducts(activeShopId), activeShopId);
  const [orders] = useStoreData(() => getOrders(activeShopId), activeShopId);
  const [bills] = useStoreData(() => getBills(activeShopId), activeShopId);

  const stats = useMemo(() => ({
    customers: customers.length,
    products: products.filter((p) => p.isActive).length,
    pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "confirmed").length,
    totalOrders: orders.length,
    totalBills: bills.length,
    revenue: bills.reduce((sum, b) => sum + b.total, 0),
    unpaid: bills.filter((b) => !b.isPaid).reduce((sum, b) => sum + b.total, 0),
  }), [customers, products, orders, bills]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const recentBills = useMemo(() => bills.slice(0, 5), [bills]);

  const statCards = [
    { title: "Customers", value: stats.customers, icon: Users, href: "/customers", color: "text-blue-600" },
    { title: "Products", value: stats.products, icon: Package, href: "/products", color: "text-green-600" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: ShoppingCart, href: "/orders", color: "text-orange-600" },
    { title: "Total Bills", value: stats.totalBills, icon: FileText, href: "/bills", color: "text-purple-600" },
    { title: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, href: "/bills", color: "text-emerald-600" },
    { title: "Unpaid", value: `₹${stats.unpaid.toLocaleString("en-IN")}`, icon: IndianRupee, href: "/bills", color: "text-red-600" },
  ];

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    billed: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {activeShop?.name || "AKB Traders"} - Overview
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ title, value, icon: Icon, href, color }) => (
          <Link key={title} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs text-muted-foreground">{title}</span>
                </div>
                <p className="text-xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet. <Link href="/orders/new" className="text-primary underline">Create one</Link></p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="block">
                    <div className="flex items-center justify-between p-2 rounded hover:bg-accent">
                      <div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{order.subtotal}</p>
                        <Badge variant="secondary" className={`text-xs ${statusColor[order.status] || ""}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bills yet. Bills are generated when orders are delivered.</p>
            ) : (
              <div className="space-y-3">
                {recentBills.map((bill) => (
                  <Link key={bill.id} href={`/bills/${bill.id}`} className="block">
                    <div className="flex items-center justify-between p-2 rounded hover:bg-accent">
                      <div>
                        <p className="text-sm font-medium">{bill.customerName}</p>
                        <p className="text-xs text-muted-foreground">{bill.billNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{bill.total}</p>
                        <Badge variant="secondary" className={bill.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {bill.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
