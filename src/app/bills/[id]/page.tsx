"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBill,
  updateBill,
  generateWhatsAppBillMessage,
  getWhatsAppShareUrl,
} from "@/lib/store";
import { ArrowLeft, MessageCircle, Printer, Check, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BillDetailPage() {
  const params = useParams();
  const [version, setVersion] = useState(0);
  const bill = useMemo(() => {
    const id = params.id as string;
    return getBill(id) || null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, version]);

  if (!bill) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Bill not found</p>
        <Link href="/bills">
          <Button variant="link">Back to bills</Button>
        </Link>
      </div>
    );
  }

  const handleWhatsAppShare = () => {
    const message = generateWhatsAppBillMessage(bill);
    const url = getWhatsAppShareUrl(bill.customerPhone, message);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePaid = () => {
    const updated = { ...bill, isPaid: !bill.isPaid };
    updateBill(updated);
    setVersion((v) => v + 1);
    toast.success(bill.isPaid ? "Marked as unpaid" : "Marked as paid");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/bills">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{bill.billNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(bill.billDate).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={togglePaid}>
            {bill.isPaid ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Mark Unpaid
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Mark Paid
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700">
            <MessageCircle className="h-4 w-4 mr-1" />
            Send via WhatsApp
          </Button>
        </div>
      </div>

      {/* Printable Bill */}
      <div>
        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{bill.shopName}</h2>
              <p className="text-sm text-muted-foreground">Wholesale Vegetable Dealers</p>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm">
                <div className="text-left">
                  <p className="font-medium">Bill To:</p>
                  <p className="font-bold text-lg">{bill.customerName}</p>
                  {bill.customerAddress && <p>{bill.customerAddress}</p>}
                  {bill.customerPhone && <p>Phone: {bill.customerPhone}</p>}
                </div>
                <div className="text-right">
                  <p>
                    <span className="font-medium">Bill No:</span> {bill.billNumber}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(bill.billDate).toLocaleDateString("en-IN")}
                  </p>
                  <p>
                    <span className="font-medium">Order:</span> {bill.orderNumber}
                  </p>
                  <Badge className={`mt-1 ${bill.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {bill.isPaid ? "PAID" : "UNPAID"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Items */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">₹{item.pricePerUnit}</TableCell>
                    <TableCell className="text-right font-medium">₹{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-4 border-t pt-4 space-y-2">
              <div className="flex justify-end gap-8 text-sm">
                <span>Subtotal:</span>
                <span className="font-medium w-24 text-right">₹{bill.subtotal}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-end gap-8 text-sm text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium w-24 text-right">-₹{bill.discount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-end gap-8 text-lg font-bold">
                <span>Total:</span>
                <span className="w-24 text-right">₹{bill.total}</span>
              </div>
            </div>

            {/* Footer */}
            {bill.notes && (
              <div className="mt-6 text-sm text-muted-foreground">
                <p className="font-medium">Notes:</p>
                <p>{bill.notes}</p>
              </div>
            )}

            <Separator className="my-6" />
            <p className="text-center text-sm text-muted-foreground">
              Thank you for your business! - {bill.shopName}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
