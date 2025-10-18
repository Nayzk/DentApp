
// Fix: Added type definitions to resolve module errors.
export type Page = 
  | 'dashboard'
  | 'products'
  | 'sales'
  | 'customers'
  | 'suppliers'
  | 'orders'
  | 'sales-orders'
  | 'reports'
  | 'users'
  | 'about'
  | 'purchase-requests';

export interface User {
  id: string;
  username: string;
  password?: string; // Should not be stored in frontend state after login
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
  expiryDate: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
}

// Fix: Added SalesOrderItem and SalesOrder types to fix compilation errors.
export interface SalesOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface SalesOrder {
    id: string;
    orderNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    items: SalesOrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    status: 'pending' | 'invoiced' | 'cancelled';
    notes?: string;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    date: string;
    supplierId: string;
    supplierName: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
}

// Fix: Added PurchaseRequest and PurchaseRequestItem types to resolve module errors.
export interface PurchaseRequestItem {
  productId: string;
  productName: string;
  quantity: number;
  reason?: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  date: string;
  requestedBy: string;
  items: PurchaseRequestItem[];
  status: 'pending' | 'approved' | 'rejected';
  linkedOrderId?: string;
  linkedOrderNumber?: string;
}