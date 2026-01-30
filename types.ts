
export enum UserRole {
  MANAGEMENT = 'MANAGEMENT',
  ADMIN = 'ADMIN',
  KASIR = 'KASIR',
  PELAYAN = 'PELAYAN',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST'
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
  stock: number;
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
  orderDate?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID';
  origin: 'OFFLINE' | 'ONLINE';
  customerId?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  role: UserRole;
  password?: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  createdAt: number;
  transactionDate: string;
}

export interface AppSettings {
  promoText: string;
  restaurantName: string;
  address: string;
  maintenanceMode: boolean;
}
