"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShop } from "@/lib/shop-context";
import { useStoreData } from "@/lib/use-store-data";
import { getCustomers, getProducts, addOrder } from "@/lib/store";
import { OrderItem } from "@/lib/types";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewOrderPage() {
  const { activeShopId } = useShop();
  const router = useRouter();
  const [customers] = useStoreData(() => getCustomers(activeShopId), activeShopId);
  const [products] = useStoreData(() => getProducts(activeShopId).filter((p) => p.isActive), activeShopId);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [orderDate, setOrderDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });

  const addItem = () => {
    setItems([
      ...items,
      { productId: "", productName: "", quantity: 1, unit: "kg", pricePerUnit: 0, total: 0 },
    ]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.productId = product.id;
        item.productName = product.name;
        item.unit = product.unit;
        item.pricePerUnit = product.defaultPrice;
        item.total = item.quantity * product.defaultPrice;
      }
    } else if (field === "quantity") {
      item.quantity = Number(value) || 0;
      item.total = item.quantity * item.pricePerUnit;
    } else if (field === "pricePerUnit") {
      item.pricePerUnit = Number(value) || 0;
      item.total = item.quantity * item.pricePerUnit;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    if (items.some((i) => !i.productName)) {
      toast.error("Please select a product for all items");
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const order = addOrder({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      shopId: activeShopId,
      items,
      subtotal,
      status: "pending",
      notes,
      orderDate: new Date(orderDate).toISOString(),
    });

    toast.success(`Order ${order.orderNumber} created`);
    router.push("/orders");
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Order</h1>
          <p className="text-sm text-muted-foreground">Create a manual order</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No customers found. <Link href="/customers" className="text-primary underline">Add one first</Link>
                </p>
              )}
            </div>
            <div>
              <Label>Order Date</Label>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Items</CardTitle>
            <Button size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items added. Click &quot;Add Item&quot; to start.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs">Product</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(v) => v && updateItem(idx, "productId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} (₹{p.defaultPrice}/{p.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Price/Unit</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.pricePerUnit}
                      onChange={(e) => updateItem(idx, "pricePerUnit", e.target.value)}
                    />
                  </div>
                  <div className="w-20 text-right">
                    <Label className="text-xs">Total</Label>
                    <p className="h-9 flex items-center justify-end font-medium">
                      ₹{item.total}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(idx)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-end pt-3 border-t">
                <p className="text-lg font-bold">Subtotal: ₹{subtotal}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions..."
            rows={2}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/orders">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSubmit} size="lg">
          Create Order
        </Button>
      </div>
    </div>
  );
}
