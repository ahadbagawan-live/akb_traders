# AKB Traders - Billing System

Wholesale vegetable billing and order management application for AKB Traders.

## Features

- **Customer Management** - Add and manage Mess & Canteen customers
- **Product Catalog** - Manage vegetable inventory with prices (per kg/unit)
- **Order Entry** - Manual order creation with item selection
- **WhatsApp Order Import** - Paste WhatsApp messages to extract order items automatically
- **Order Tracking** - Track order status: Pending → Confirmed → Delivered → Billed
- **Bill Generation** - Auto-generate professional invoices from delivered orders
- **WhatsApp Bill Sharing** - One-click send bills to customers via WhatsApp
- **Multi-Shop Support** - Switch between 2 AKB Traders shop locations
- **Print Bills** - Print-friendly bill layout

## Tech Stack

- [Next.js](https://nextjs.org/) 15 (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [shadcn/ui](https://ui.shadcn.com/) components
- [Firebase](https://firebase.google.com/) (ready for Auth + Firestore)
- localStorage for offline-first data storage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Workflow

1. **Setup** - Configure your shop details in Shops page
2. **Add Customers** - Add your Mess/Canteen customers
3. **Add Products** - Add vegetables with default prices
4. **Create Orders** - Manually or import from WhatsApp messages
5. **Mark Delivered** - Update order status when delivered
6. **Generate Bill** - Create invoice from delivered order
7. **Share Bill** - Send bill via WhatsApp to customer
