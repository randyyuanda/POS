export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  sku: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  customer?: Customer;
  cashier: string;
  createdAt: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  usageLimit: number;       // 0 = unlimited
  usedCount: number;
  perCustomerLimit: number; // 0 = unlimited
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  applicableCategory: string;
  description: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  color: string;
  gradient: string;
  minSpend: number;
  pointsMultiplier: number;
  discountRate: number;
  benefits: string[];
  emoji: string;
}

export interface LoyaltyAccount {
  customerId: string;
  points: number;
  lifetimePoints: number;
  lifetimeSpend: number;
  tierId: string;
  walletBalance: number;
  joinedAt: string;
  lastActivity: string;
}

export interface PointsTransaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'earned' | 'redeemed' | 'topup' | 'adjusted' | 'expired';
  points: number;
  walletAmount?: number;
  description: string;
  orderId?: string;
  balance: number;
  createdAt: string;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  percentage: number;
}
