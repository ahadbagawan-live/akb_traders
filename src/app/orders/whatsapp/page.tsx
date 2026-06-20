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
import {
  getCustomers,
  getProducts,
  addOrder,
  parseWhatsAppMessage,
} from "@/lib/store";
import { OrderItem } from "@/lib/types";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function WhatsAppOrderPage() {
  const { activeShopId } = useShop();
  const router = useRouter();
  const [customers] = useStoreData(() => getCustomers(activeShopId), activeShopId);
  const [products] = useStoreData(() => getProducts(activeShopId).filter((p) => p.isActive), activeShopId);
  const [customerId, setCustomerId] = useState("");
  const [rawMessage, setRawMessage] = useState("");
  const [parsedItems, setParsedItems] = useState<OrderItem[]>([]);
  const [unmatchedLines, setUnmatchedLines] = useState<string[]>([]);
  const [parsed, setParsed] = useState(false);

  const handleParse = () => {
    if (!rawMessage.trim()) {
      toast.error("Please paste a WhatsApp message");
      return;
    }
    const result = parseWhatsAppMessage(rawMessage, products);
    setParsedItems(result.items);
    setUnmatchedLines(result.unmatched);
    setParsed(true);

    if (result.items.length === 0) {
      toast.error("Could not extract any items. Try the manual format: 'Tomato 5 kg'");
    } else {
      toast.success(`Extracted ${result.items.length} items`);
    }
  };

  const updateParsedItem = (index: number, field: string, value: string | number) => {
    const newItems = [...parsedItems];
    const item = { ...newItems[index] };

    if (field === "quantity") {
      item.quantity = Number(value) || 0;
      item.total = item.quantity * item.pricePerUnit;
    } else if (field === "pricePerUnit") {
      item.pricePerUnit = Number(value) || 0;
      item.total = item.quantity * item.pricePerUnit;
    } else if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.productId = product.id;
        item.productName = product.name;
        item.unit = product.unit;
        item.pricePerUnit = product.defaultPrice;
        item.total = item.quantity * product.defaultPrice;
      }
    }

    newItems[index] = item;
    setParsedItems(newItems);
  };

  const removeParsedItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index));
  };

  const subtotal = parsedItems.reduce((sum, item) => sum + item.total, 0);

  const handleCreateOrder = () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (parsedItems.length === 0) {
      toast.error("No items to create order");
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const order = addOrder({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      shopId: activeShopId,
      items: parsedItems,
      subtotal,
      status: "pending",
      notes: "",
      whatsappRaw: rawMessage,
      orderDate: new Date().toISOString(),
    });

    toast.success(`Order ${order.orderNumber} created from WhatsApp`);
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
          <h1 className="text-2xl font-bold">WhatsApp Order Import</h1>
          <p className="text-sm text-muted-foreground">
            Paste a WhatsApp message to extract order items
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            Paste WhatsApp Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          </div>
          <div>
            <Label>WhatsApp Message</Label>
            <Textarea
              value={rawMessage}
              onChange={(e) => {
                setRawMessage(e.target.value);
                setParsed(false);
              }}
              placeholder={`Paste the order message here. Supported formats:\n\nTomato 5 kg\nOnion - 10 kg\n3 kg Potato\nCapsicum 2\nCoriander 5 bundle`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleParse} className="w-full">
            Parse Message
          </Button>
        </CardContent>
      </Card>

      {parsed && (
        <>
          {unmatchedLines.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Could not parse these lines:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {unmatchedLines.map((line, i) => (
                    <li key={i} className="font-mono">&quot;{line}&quot;</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {parsedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Extracted Items ({parsedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price/Unit</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {item.productId ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {item.productName}
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                {item.productName}
                              </Badge>
                              <Select
                                onValueChange={(v: string | null) => v && updateParsedItem(idx, "productId", v)}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs">
                                  <SelectValue placeholder="Match..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={item.quantity}
                            onChange={(e) => updateParsedItem(idx, "quantity", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={item.pricePerUnit}
                            onChange={(e) => updateParsedItem(idx, "pricePerUnit", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">₹{item.total}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeParsedItem(idx)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center pt-4 border-t mt-4">
                  <p className="text-lg font-bold">Subtotal: ₹{subtotal}</p>
                  <Button onClick={handleCreateOrder} size="lg">
                    Create Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
