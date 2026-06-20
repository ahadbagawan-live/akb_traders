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
import { useShop } from "@/lib/shop-context";
import { useStoreData } from "@/lib/use-store-data";
import { getBills, updateBill } from "@/lib/store";
import { Bill } from "@/lib/types";
import { Search, Eye, IndianRupee } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BillsPage() {
  const { activeShopId } = useShop();
  const [bills, refresh] = useStoreData(() => getBills(activeShopId), activeShopId);
  const [search, setSearch] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">("all");

  const filtered = bills.filter((b) => {
    const matchSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(search.toLowerCase());
    const matchPaid =
      paidFilter === "all" ||
      (paidFilter === "paid" && b.isPaid) ||
      (paidFilter === "unpaid" && !b.isPaid);
    return matchSearch && matchPaid;
  });

  const totalAmount = filtered.reduce((sum, b) => sum + b.total, 0);
  const unpaidAmount = filtered.filter((b) => !b.isPaid).reduce((sum, b) => sum + b.total, 0);

  const togglePaid = (bill: Bill) => {
    updateBill({ ...bill, isPaid: !bill.isPaid });
    toast.success(bill.isPaid ? "Marked as unpaid" : "Marked as paid");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-sm text-muted-foreground">View and manage generated bills</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
            <IndianRupee className="h-3.5 w-3.5 text-green-600" />
            <span className="text-green-700 font-medium">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          {unpaidAmount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg">
              <IndianRupee className="h-3.5 w-3.5 text-red-600" />
              <span className="text-red-700 font-medium">₹{unpaidAmount.toLocaleString("en-IN")} unpaid</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {(["all", "unpaid", "paid"] as const).map((f) => (
            <button
              key={f}
              className={`px-3 py-2 text-sm font-medium ${
                paidFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent"
              }`}
              onClick={() => setPaidFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {bills.length === 0
                      ? "No bills yet. Bills are generated when orders are marked as delivered."
                      : "No matching bills."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-sm">{b.billNumber}</TableCell>
                    <TableCell className="font-medium">{b.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {b.items.length} item{b.items.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-medium">₹{b.total}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePaid(b)}
                        className="p-0"
                      >
                        <Badge className={b.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {b.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(b.billDate).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/bills/${b.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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
