"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getOrder, updateOrder, generateBillFromOrder, deleteOrder } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { ArrowLeft, Truck, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  billed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [version, setVersion] = useState(0);
  const order = useMemo(() => {
    const id = params.id as string;
    return getOrder(id) || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, version]);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/orders">
          <Button variant="link">Back to orders</Button>
        </Link>
      </div>
    );
  }

  const handleStatusChange = (status: OrderStatus) => {
    const updated = {
      ...order,
      status,
      ...(status === "delivered" ? { deliveryDate: new Date().toISOString() } : {}),
    };
    updateOrder(updated);
    setVersion((v) => v + 1);
    toast.success(`Status updated to ${status}`);
  };

  const handleGenerateBill = () => {
    const bill = generateBillFromOrder(order);
    setVersion((v) => v + 1);
    toast.success(`Bill ${bill.billNumber} generated`);
    router.push(`/bills/${bill.id}`);
  };

  const handleDelete = () => {
    if (confirm("Delete this order? This cannot be undone.")) {
      deleteOrder(order.id);
      toast.success("Order deleted");
      router.push("/orders");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {order.customerName} &middot;{" "}
              {new Date(order.orderDate).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
        <Badge className={`text-sm ${STATUS_COLORS[order.status]}`}>
          {order.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>₹{item.pricePerUnit}</TableCell>
                  <TableCell className="text-right font-medium">₹{item.total}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  ₹{order.subtotal}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {order.whatsappRaw && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Original WhatsApp Message</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap font-mono">
              {order.whatsappRaw}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.status !== "billed" && order.status !== "cancelled" && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Change Status:</span>
              <Select value={order.status} onValueChange={(v) => v && handleStatusChange(v as OrderStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3">
            {(order.status === "pending" || order.status === "confirmed") && (
              <Button onClick={() => handleStatusChange("delivered")}>
                <Truck className="h-4 w-4 mr-2" />
                Mark as Delivered
              </Button>
            )}

            {order.status === "delivered" && (
              <Button onClick={handleGenerateBill}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Bill
              </Button>
            )}

            {order.status !== "billed" && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
