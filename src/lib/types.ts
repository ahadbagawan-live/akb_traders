export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: "mess" | "canteen" | "other";
  shopId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameHindi?: string;
  unit: "kg" | "piece" | "dozen" | "bundle";
  defaultPrice: number;
  category: string;
  shopId: string;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "billed" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  notes: string;
  whatsappRaw?: string;
  orderDate: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  billDate: string;
  notes: string;
  isPaid: boolean;
  createdAt: string;
}
