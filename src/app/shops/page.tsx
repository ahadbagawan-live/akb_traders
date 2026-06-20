"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useShop } from "@/lib/shop-context";
import { updateShop } from "@/lib/store";
import { Shop } from "@/lib/types";
import { Store, Save } from "lucide-react";
import { toast } from "sonner";

export default function ShopsPage() {
  const { shops, activeShopId, switchShop, refreshShops } = useShop();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const startEdit = (shop: Shop) => {
    setEditingId(shop.id);
    setForm({ name: shop.name, address: shop.address, phone: shop.phone });
  };

  const handleSave = (shop: Shop) => {
    if (!form.name.trim()) {
      toast.error("Shop name is required");
      return;
    }
    updateShop({ ...shop, name: form.name, address: form.address, phone: form.phone });
    setEditingId(null);
    refreshShops();
    toast.success("Shop updated");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Shops</h1>
        <p className="text-sm text-muted-foreground">
          Manage your AKB Traders shop locations
        </p>
      </div>

      <div className="space-y-4">
        {shops.map((shop) => (
          <Card key={shop.id} className={activeShopId === shop.id ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {editingId === shop.id ? (
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    shop.name
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {activeShopId === shop.id ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => switchShop(shop.id)}>
                      Switch
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingId === shop.id ? (
                <>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Shop address"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Shop phone"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(shop)}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    <p>Address: {shop.address || "Not set"}</p>
                    <p>Phone: {shop.phone || "Not set"}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startEdit(shop)}>
                    Edit Details
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
