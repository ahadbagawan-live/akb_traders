"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useShop } from "@/lib/shop-context";
import { useStoreData } from "@/lib/use-store-data";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/store";
import { Product } from "@/lib/types";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Leafy Vegetables",
  "Root Vegetables",
  "Gourds",
  "Beans & Pods",
  "Tomatoes & Peppers",
  "Onions & Garlic",
  "Potatoes",
  "Fruits",
  "Other",
];

const UNITS: Product["unit"][] = ["kg", "piece", "dozen", "bundle"];

export default function ProductsPage() {
  const { activeShopId } = useShop();
  const [products, refresh] = useStoreData(() => getProducts(activeShopId), activeShopId);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    unit: "kg" as Product["unit"],
    defaultPrice: "",
    category: "Other",
    isActive: true,
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameHindi && p.nameHindi.toLowerCase().includes(search.toLowerCase())) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", nameHindi: "", unit: "kg", defaultPrice: "", category: "Other", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      nameHindi: p.nameHindi || "",
      unit: p.unit,
      defaultPrice: String(p.defaultPrice),
      category: p.category,
      isActive: p.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const price = parseFloat(form.defaultPrice) || 0;
    if (editing) {
      updateProduct({
        ...editing,
        name: form.name,
        nameHindi: form.nameHindi || undefined,
        unit: form.unit,
        defaultPrice: price,
        category: form.category,
        isActive: form.isActive,
      });
      toast.success("Product updated");
    } else {
      addProduct({
        name: form.name,
        nameHindi: form.nameHindi || undefined,
        unit: form.unit,
        defaultPrice: price,
        category: form.category,
        isActive: form.isActive,
        shopId: activeShopId,
      });
      toast.success("Product added");
    }
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      deleteProduct(id);
      toast.success("Product deleted");
      refresh();
    }
  };

  const toggleActive = (p: Product) => {
    updateProduct({ ...p, isActive: !p.isActive });
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your vegetable catalog</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {products.length === 0 ? "No products yet. Add your vegetables!" : "No results found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id} className={!p.isActive ? "opacity-50" : ""}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{p.name}</span>
                        {p.nameHindi && (
                          <span className="text-xs text-muted-foreground ml-2">({p.nameHindi})</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.category}</Badge>
                    </TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>₹{p.defaultPrice}/{p.unit}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(p)}
                        className={p.isActive ? "text-green-600" : "text-red-600"}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name (English) *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tomato"
                />
              </div>
              <div>
                <Label>Name (Hindi)</Label>
                <Input
                  value={form.nameHindi}
                  onChange={(e) => setForm({ ...form, nameHindi: e.target.value })}
                  placeholder="e.g. Tamatar"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => v && setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => v && setForm({ ...form, unit: v as Product["unit"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Price (₹)</Label>
                <Input
                  type="number"
                  value={form.defaultPrice}
                  onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
