"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShop } from "@/lib/shop-context";
import { useStoreData } from "@/lib/use-store-data";
import { getOrders, updateOrder, generateBillFromOrder } from "@/lib/store";
import { Order, OrderStatus } from "@/lib/types";
import {
  Plus,
  Search,
  Eye,
  Truck,
  FileText,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered" },
  { value: "billed", label: "Billed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  billed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { activeShopId } = useShop();
  const router = useRouter();
  const [orders, refresh] = useStoreData(() => getOrders(activeShopId), activeShopId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const markDelivered = (order: Order) => {
    updateOrder({
      ...order,
      status: "delivered",
      deliveryDate: new Date().toISOString(),
    });
    toast.success("Order marked as delivered");
    refresh();
  };

  const generateBill = (order: Order) => {
    const bill = generateBillFromOrder(order);
    toast.success(`Bill ${bill.billNumber} generated`);
    router.push(`/bills/${bill.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Link href="/orders/whatsapp">
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              From WhatsApp
            </Button>
          </Link>
          <Link href="/orders/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as OrderStatus | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {orders.length === 0 ? (
                      <>No orders yet. <Link href="/orders/new" className="text-primary underline">Create one</Link></>
                    ) : (
                      "No matching orders."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-sm">{o.orderNumber}</TableCell>
                    <TableCell className="font-medium">{o.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-medium">₹{o.subtotal}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[o.status]}>{o.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.orderDate).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/orders/${o.id}`}>
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(o.status === "pending" || o.status === "confirmed") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Mark Delivered"
                            onClick={() => markDelivered(o)}
                          >
                            <Truck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {o.status === "delivered" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Generate Bill"
                            onClick={() => generateBill(o)}
                          >
                            <FileText className="h-4 w-4 text-purple-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
