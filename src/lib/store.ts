"use client";

import { Customer, Product, Order, Bill, Shop, OrderItem } from "./types";

const KEYS = {
  shops: "akb_shops",
  customers: "akb_customers",
  products: "akb_products",
  orders: "akb_orders",
  bills: "akb_bills",
  activeShop: "akb_active_shop",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T[]) : [];
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateNumber(prefix: string): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${rand}`;
}

// --- Shops ---
const DEFAULT_SHOPS: Shop[] = [
  { id: "shop-1", name: "AKB Traders - Shop 1", address: "Shop 1 Address", phone: "" },
  { id: "shop-2", name: "AKB Traders - Shop 2", address: "Shop 2 Address", phone: "" },
];

export function getShops(): Shop[] {
  const shops = read<Shop>(KEYS.shops);
  if (shops.length === 0) {
    write(KEYS.shops, DEFAULT_SHOPS);
    return DEFAULT_SHOPS;
  }
  return shops;
}

export function updateShop(shop: Shop): void {
  const shops = getShops();
  const idx = shops.findIndex((s) => s.id === shop.id);
  if (idx >= 0) shops[idx] = shop;
  write(KEYS.shops, shops);
}

export function getActiveShopId(): string {
  if (typeof window === "undefined") return "shop-1";
  return localStorage.getItem(KEYS.activeShop) || "shop-1";
}

export function setActiveShopId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.activeShop, id);
}

// --- Customers ---
export function getCustomers(shopId?: string): Customer[] {
  const all = read<Customer>(KEYS.customers);
  return shopId ? all.filter((c) => c.shopId === shopId) : all;
}

export function getCustomer(id: string): Customer | undefined {
  return read<Customer>(KEYS.customers).find((c) => c.id === id);
}

export function addCustomer(data: Omit<Customer, "id" | "createdAt">): Customer {
  const customer: Customer = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const customers = read<Customer>(KEYS.customers);
  customers.push(customer);
  write(KEYS.customers, customers);
  return customer;
}

export function updateCustomer(customer: Customer): void {
  const customers = read<Customer>(KEYS.customers);
  const idx = customers.findIndex((c) => c.id === customer.id);
  if (idx >= 0) customers[idx] = customer;
  write(KEYS.customers, customers);
}

export function deleteCustomer(id: string): void {
  write(KEYS.customers, read<Customer>(KEYS.customers).filter((c) => c.id !== id));
}

// --- Products ---
export function getProducts(shopId?: string): Product[] {
  const all = read<Product>(KEYS.products);
  return shopId ? all.filter((p) => p.shopId === shopId) : all;
}

export function getProduct(id: string): Product | undefined {
  return read<Product>(KEYS.products).find((p) => p.id === id);
}

export function addProduct(data: Omit<Product, "id">): Product {
  const product: Product = { ...data, id: generateId() };
  const products = read<Product>(KEYS.products);
  products.push(product);
  write(KEYS.products, products);
  return product;
}

export function updateProduct(product: Product): void {
  const products = read<Product>(KEYS.products);
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) products[idx] = product;
  write(KEYS.products, products);
}

export function deleteProduct(id: string): void {
  write(KEYS.products, read<Product>(KEYS.products).filter((p) => p.id !== id));
}

// --- Orders ---
export function getOrders(shopId?: string): Order[] {
  const all = read<Order>(KEYS.orders);
  const filtered = shopId ? all.filter((o) => o.shopId === shopId) : all;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrder(id: string): Order | undefined {
  return read<Order>(KEYS.orders).find((o) => o.id === id);
}

export function addOrder(data: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">): Order {
  const order: Order = {
    ...data,
    id: generateId(),
    orderNumber: generateNumber("ORD"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = read<Order>(KEYS.orders);
  orders.push(order);
  write(KEYS.orders, orders);
  return order;
}

export function updateOrder(order: Order): void {
  const orders = read<Order>(KEYS.orders);
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = { ...order, updatedAt: new Date().toISOString() };
  }
  write(KEYS.orders, orders);
}

export function deleteOrder(id: string): void {
  write(KEYS.orders, read<Order>(KEYS.orders).filter((o) => o.id !== id));
}

// --- Bills ---
export function getBills(shopId?: string): Bill[] {
  const all = read<Bill>(KEYS.bills);
  const filtered = shopId ? all.filter((b) => b.shopId === shopId) : all;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBill(id: string): Bill | undefined {
  return read<Bill>(KEYS.bills).find((b) => b.id === id);
}

export function generateBillFromOrder(order: Order, discount: number = 0): Bill {
  const existingBills = read<Bill>(KEYS.bills);
  const existing = existingBills.find((b) => b.orderId === order.id);
  if (existing) return existing;

  const customer = getCustomer(order.customerId);
  const shops = getShops();
  const shop = shops.find((s) => s.id === order.shopId);

  const bill: Bill = {
    id: generateId(),
    billNumber: generateNumber("BILL"),
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: customer?.address || "",
    shopId: order.shopId,
    shopName: shop?.name || "AKB Traders",
    items: order.items,
    subtotal: order.subtotal,
    discount,
    total: order.subtotal - discount,
    billDate: new Date().toISOString(),
    notes: order.notes,
    isPaid: false,
    createdAt: new Date().toISOString(),
  };

  const bills = read<Bill>(KEYS.bills);
  bills.push(bill);
  write(KEYS.bills, bills);

  // Update order status to billed
  updateOrder({ ...order, status: "billed" });

  return bill;
}

export function updateBill(bill: Bill): void {
  const bills = read<Bill>(KEYS.bills);
  const idx = bills.findIndex((b) => b.id === bill.id);
  if (idx >= 0) bills[idx] = bill;
  write(KEYS.bills, bills);
}

// --- WhatsApp Message Parser ---
export function parseWhatsAppMessage(
  message: string,
  products: Product[]
): { items: OrderItem[]; unmatched: string[] } {
  const lines = message.split("\n").map((l) => l.trim()).filter(Boolean);
  const items: OrderItem[] = [];
  const unmatched: string[] = [];

  for (const line of lines) {
    // Skip greetings, timestamps, etc.
    if (/^(hi|hello|hey|good\s*(morning|evening|night)|namaste|ok|thanks|thank)/i.test(line)) continue;
    if (/^\d{1,2}[:/]\d{2}/.test(line)) continue; // timestamps
    if (/^\[.*\]/.test(line)) continue; // WhatsApp metadata

    // Try to match patterns like: "Tomato 5kg", "5 kg tomato", "Onion - 10", "Potato 2 dozen"
    let matched = false;

    // Pattern: "item quantity unit" or "item - quantity unit"
    const patterns = [
      /^(.+?)\s*[-–:]\s*(\d+(?:\.\d+)?)\s*(kg|kgs|piece|pieces|pcs|pc|dozen|dz|bundle|bundles)?\s*$/i,
      /^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|kgs|piece|pieces|pcs|pc|dozen|dz|bundle|bundles)?\s*$/i,
      /^(\d+(?:\.\d+)?)\s*(kg|kgs|piece|pieces|pcs|pc|dozen|dz|bundle|bundles)?\s*[-–:]?\s*(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let itemName: string;
        let qty: number;
        let unitStr: string | undefined;

        if (pattern === patterns[2]) {
          qty = parseFloat(match[1]);
          unitStr = match[2];
          itemName = match[3].trim();
        } else {
          itemName = match[1].trim();
          qty = parseFloat(match[2]);
          unitStr = match[3];
        }

        // Normalize unit
        let unit = "kg";
        if (unitStr) {
          const lower = unitStr.toLowerCase();
          if (lower.startsWith("piece") || lower === "pcs" || lower === "pc") unit = "piece";
          else if (lower.startsWith("dozen") || lower === "dz") unit = "dozen";
          else if (lower.startsWith("bundle")) unit = "bundle";
        }

        // Try to match to a product
        const product = products.find(
          (p) =>
            p.name.toLowerCase() === itemName.toLowerCase() ||
            p.nameHindi?.toLowerCase() === itemName.toLowerCase() ||
            p.name.toLowerCase().includes(itemName.toLowerCase()) ||
            itemName.toLowerCase().includes(p.name.toLowerCase())
        );

        items.push({
          productId: product?.id || "",
          productName: product?.name || itemName,
          quantity: qty,
          unit: product?.unit || unit,
          pricePerUnit: product?.defaultPrice || 0,
          total: qty * (product?.defaultPrice || 0),
        });
        matched = true;
        break;
      }
    }

    if (!matched && line.length > 1) {
      unmatched.push(line);
    }
  }

  return { items, unmatched };
}

// --- WhatsApp Bill Sharing ---
export function generateWhatsAppBillMessage(bill: Bill): string {
  const lines: string[] = [];
  lines.push(`*${bill.shopName}*`);
  lines.push(`Bill No: ${bill.billNumber}`);
  lines.push(`Date: ${new Date(bill.billDate).toLocaleDateString("en-IN")}`);
  lines.push("");
  lines.push(`Customer: ${bill.customerName}`);
  lines.push("");
  lines.push("*Items:*");
  lines.push("─────────────────");

  for (const item of bill.items) {
    lines.push(`${item.productName}`);
    lines.push(`  ${item.quantity} ${item.unit} × ₹${item.pricePerUnit} = ₹${item.total}`);
  }

  lines.push("─────────────────");
  lines.push(`Subtotal: ₹${bill.subtotal}`);
  if (bill.discount > 0) {
    lines.push(`Discount: -₹${bill.discount}`);
  }
  lines.push(`*Total: ₹${bill.total}*`);
  lines.push("");
  if (bill.notes) {
    lines.push(`Note: ${bill.notes}`);
    lines.push("");
  }
  lines.push("Thank you for your business!");
  lines.push("- AKB Traders");

  return lines.join("\n");
}

export function getWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const phoneWithCountry = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}
