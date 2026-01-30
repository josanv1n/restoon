
export enum UserRole {
  MANAGEMENT = 'MANAGEMENT',
  ADMIN = 'ADMIN',
  KASIR = 'KASIR',
  PELAYAN = 'PELAYAN',
  CUSTOMER = 'CUSTOMER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'TUNAI',
  BCA = 'TRANSFER BCA'
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY'
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'FOOD' | 'DRINK';
}

export interface OrderItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber?: number;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID';
}

export interface Table {
  id: number;
  isOccupied: boolean;
  currentOrderId?: string;
}
