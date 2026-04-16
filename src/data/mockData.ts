import type { Product, Order, Customer, SalesData, CategorySales, MembershipTier, Voucher, LoyaltyAccount, PointsTransaction } from '../types';

export const categories = ['All', 'Food', 'Beverages', 'Snacks', 'Desserts', 'Electronics', 'Clothing'];

export const products: Product[] = [
  { id: '1', name: 'Espresso', price: 3.5, category: 'Beverages', image: 'https://placehold.co/80x80/FF6B6B/white?text=ES', stock: 100, sku: 'BEV-001', description: 'Strong black coffee' },
  { id: '2', name: 'Cappuccino', price: 4.5, category: 'Beverages', image: 'https://placehold.co/80x80/4ECDC4/white?text=CA', stock: 80, sku: 'BEV-002', description: 'Espresso with steamed milk foam' },
  { id: '3', name: 'Latte', price: 5.0, category: 'Beverages', image: 'https://placehold.co/80x80/45B7D1/white?text=LA', stock: 90, sku: 'BEV-003', description: 'Espresso with steamed milk' },
  { id: '4', name: 'Green Tea', price: 3.0, category: 'Beverages', image: 'https://placehold.co/80x80/96CEB4/white?text=GT', stock: 120, sku: 'BEV-004', description: 'Japanese green tea' },
  { id: '5', name: 'Orange Juice', price: 4.0, category: 'Beverages', image: 'https://placehold.co/80x80/FFEAA7/333?text=OJ', stock: 60, sku: 'BEV-005', description: 'Fresh squeezed' },
  { id: '6', name: 'Croissant', price: 3.5, category: 'Food', image: 'https://placehold.co/80x80/DDA0DD/white?text=CR', stock: 40, sku: 'FOD-001', description: 'Buttery French pastry' },
  { id: '7', name: 'Club Sandwich', price: 8.5, category: 'Food', image: 'https://placehold.co/80x80/F7DC6F/333?text=CS', stock: 30, sku: 'FOD-002', description: 'Triple decker sandwich' },
  { id: '8', name: 'Caesar Salad', price: 9.0, category: 'Food', image: 'https://placehold.co/80x80/82E0AA/white?text=SA', stock: 25, sku: 'FOD-003', description: 'Classic Caesar with croutons' },
  { id: '9', name: 'Margherita Pizza', price: 12.0, category: 'Food', image: 'https://placehold.co/80x80/EC7063/white?text=PZ', stock: 20, sku: 'FOD-004', description: 'Classic Italian pizza' },
  { id: '10', name: 'Beef Burger', price: 11.5, category: 'Food', image: 'https://placehold.co/80x80/E59866/white?text=BG', stock: 35, sku: 'FOD-005', description: 'Juicy beef patty' },
  { id: '11', name: 'Chocolate Cake', price: 6.0, category: 'Desserts', image: 'https://placehold.co/80x80/8E44AD/white?text=CC', stock: 15, sku: 'DES-001', description: 'Rich chocolate layer cake' },
  { id: '12', name: 'Cheesecake', price: 6.5, category: 'Desserts', image: 'https://placehold.co/80x80/F1948A/white?text=CK', stock: 12, sku: 'DES-002', description: 'New York style' },
  { id: '13', name: 'Ice Cream', price: 4.5, category: 'Desserts', image: 'https://placehold.co/80x80/AED6F1/333?text=IC', stock: 50, sku: 'DES-003', description: 'Vanilla bean ice cream' },
  { id: '14', name: 'Potato Chips', price: 2.5, category: 'Snacks', image: 'https://placehold.co/80x80/F9E79F/333?text=PC', stock: 200, sku: 'SNK-001', description: 'Crispy salted chips' },
  { id: '15', name: 'Granola Bar', price: 2.0, category: 'Snacks', image: 'https://placehold.co/80x80/A9DFBF/333?text=GB', stock: 150, sku: 'SNK-002', description: 'Oat and honey bar' },
  { id: '16', name: 'Wireless Earbuds', price: 49.99, category: 'Electronics', image: 'https://placehold.co/80x80/2C3E50/white?text=WE', stock: 8, sku: 'ELC-001', description: 'Bluetooth 5.0' },
];

export const customers: Customer[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@email.com', phone: '+1-555-0101', address: '123 Main St', totalOrders: 24, totalSpent: 486.50, joinedAt: '2024-01-15' },
  { id: '2', name: 'Bob Smith', email: 'bob@email.com', phone: '+1-555-0102', address: '456 Oak Ave', totalOrders: 15, totalSpent: 312.75, joinedAt: '2024-02-20' },
  { id: '3', name: 'Carol White', email: 'carol@email.com', phone: '+1-555-0103', address: '789 Pine Rd', totalOrders: 32, totalSpent: 720.00, joinedAt: '2023-11-05' },
  { id: '4', name: 'David Brown', email: 'david@email.com', phone: '+1-555-0104', address: '321 Elm St', totalOrders: 8, totalSpent: 156.25, joinedAt: '2024-03-10' },
  { id: '5', name: 'Eve Davis', email: 'eve@email.com', phone: '+1-555-0105', address: '654 Maple Dr', totalOrders: 45, totalSpent: 1025.50, joinedAt: '2023-09-22' },
  { id: '6', name: 'Frank Wilson', email: 'frank@email.com', phone: '+1-555-0106', address: '987 Cedar Ln', totalOrders: 12, totalSpent: 278.00, joinedAt: '2024-01-30' },
  { id: '7', name: 'Grace Lee', email: 'grace@email.com', phone: '+1-555-0107', address: '246 Birch Blvd', totalOrders: 19, totalSpent: 445.75, joinedAt: '2023-12-14' },
  { id: '8', name: 'Henry Taylor', email: 'henry@email.com', phone: '+1-555-0108', address: '135 Walnut Way', totalOrders: 6, totalSpent: 98.50, joinedAt: '2024-04-01' },
];

export const recentOrders: Order[] = [
  {
    id: '1', orderNumber: 'ORD-2024-001',
    items: [{ product: products[0], quantity: 2 }, { product: products[5], quantity: 1 }],
    subtotal: 10.50, tax: 1.05, discount: 0, total: 11.55,
    paymentMethod: 'card', status: 'completed', customer: customers[0],
    cashier: 'John D.', createdAt: '2026-04-14T09:15:00',
  },
  {
    id: '2', orderNumber: 'ORD-2024-002',
    items: [{ product: products[1], quantity: 1 }, { product: products[6], quantity: 1 }],
    subtotal: 13.00, tax: 1.30, discount: 1.00, total: 13.30,
    paymentMethod: 'cash', status: 'completed', customer: customers[1],
    cashier: 'Sarah M.', createdAt: '2026-04-14T09:45:00',
  },
  {
    id: '3', orderNumber: 'ORD-2024-003',
    items: [{ product: products[2], quantity: 2 }, { product: products[10], quantity: 1 }],
    subtotal: 16.00, tax: 1.60, discount: 0, total: 17.60,
    paymentMethod: 'digital', status: 'completed', customer: customers[2],
    cashier: 'John D.', createdAt: '2026-04-14T10:20:00',
  },
  {
    id: '4', orderNumber: 'ORD-2024-004',
    items: [{ product: products[8], quantity: 1 }, { product: products[4], quantity: 2 }],
    subtotal: 20.00, tax: 2.00, discount: 2.00, total: 20.00,
    paymentMethod: 'card', status: 'completed',
    cashier: 'Sarah M.', createdAt: '2026-04-14T11:05:00',
  },
  {
    id: '5', orderNumber: 'ORD-2024-005',
    items: [{ product: products[9], quantity: 1 }, { product: products[11], quantity: 1 }],
    subtotal: 18.00, tax: 1.80, discount: 0, total: 19.80,
    paymentMethod: 'cash', status: 'pending', customer: customers[4],
    cashier: 'John D.', createdAt: '2026-04-14T11:30:00',
  },
];

export const salesData: SalesData[] = [
  { date: 'Apr 8', revenue: 1240, orders: 32 },
  { date: 'Apr 9', revenue: 1580, orders: 41 },
  { date: 'Apr 10', revenue: 1120, orders: 28 },
  { date: 'Apr 11', revenue: 1890, orders: 52 },
  { date: 'Apr 12', revenue: 1650, orders: 45 },
  { date: 'Apr 13', revenue: 2100, orders: 58 },
  { date: 'Apr 14', revenue: 980, orders: 26 },
];

export const categorySales: CategorySales[] = [
  { category: 'Food', revenue: 4250, percentage: 38 },
  { category: 'Beverages', revenue: 3100, percentage: 28 },
  { category: 'Desserts', revenue: 1680, percentage: 15 },
  { category: 'Electronics', revenue: 1120, percentage: 10 },
  { category: 'Snacks', revenue: 560, percentage: 5 },
  { category: 'Clothing', revenue: 450, percentage: 4 },
];

export const topProducts = [
  { name: 'Margherita Pizza', sold: 124, revenue: 1488 },
  { name: 'Beef Burger', sold: 98, revenue: 1127 },
  { name: 'Cappuccino', sold: 215, revenue: 967.5 },
  { name: 'Latte', sold: 185, revenue: 925 },
  { name: 'Caesar Salad', sold: 89, revenue: 801 },
];

// ─── Loyalty & Membership ─────────────────────────────────────────────────────

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'bronze', name: 'Bronze', emoji: '🥉',
    color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)',
    minSpend: 0, pointsMultiplier: 1, discountRate: 0,
    benefits: ['Earn 1 pt per $1 spent', 'Birthday 2× points', 'Access to member deals', 'Monthly newsletter'],
  },
  {
    id: 'silver', name: 'Silver', emoji: '🥈',
    color: '#8c8c8c', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #8c8c8c 100%)',
    minSpend: 300, pointsMultiplier: 1.25, discountRate: 3,
    benefits: ['Earn 1.25× pts per $1', '3% auto-discount on all orders', 'Priority support', 'Early promo access', 'Birthday 3× points'],
  },
  {
    id: 'gold', name: 'Gold', emoji: '🥇',
    color: '#d4a017', gradient: 'linear-gradient(135deg, #f7dc6f 0%, #d4a017 100%)',
    minSpend: 700, pointsMultiplier: 1.5, discountRate: 5,
    benefits: ['Earn 1.5× pts per $1', '5% auto-discount on all orders', 'Dedicated support', 'Free birthday dessert', 'Exclusive Gold vouchers', 'Birthday 5× points'],
  },
  {
    id: 'platinum', name: 'Platinum', emoji: '💎',
    color: '#764ba2', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minSpend: 1200, pointsMultiplier: 2, discountRate: 8,
    benefits: ['Earn 2× pts per $1', '8% auto-discount on all orders', 'Personal concierge', 'Free dessert every visit', 'Exclusive Platinum events', 'Priority queue', 'Birthday 10× points'],
  },
];

export const initialVouchers: Voucher[] = [
  {
    id: 'v1', code: 'WELCOME10', name: 'Welcome 10% Off',
    type: 'percentage', value: 10, minPurchase: 0, maxDiscount: null,
    usageLimit: 0, usedCount: 45, perCustomerLimit: 1,
    startDate: '2026-01-01', expiryDate: '2026-12-31', isActive: true,
    applicableCategory: 'All', description: 'First-time customer discount — 10% off any order',
  },
  {
    id: 'v2', code: 'FLAT5', name: '$5 Off $20+',
    type: 'fixed', value: 5, minPurchase: 20, maxDiscount: null,
    usageLimit: 0, usedCount: 128, perCustomerLimit: 0,
    startDate: '2026-01-01', expiryDate: '2026-12-31', isActive: true,
    applicableCategory: 'All', description: '$5 flat discount when spending $20 or more',
  },
  {
    id: 'v3', code: 'SUMMER20', name: 'Summer Sale 20%',
    type: 'percentage', value: 20, minPurchase: 30, maxDiscount: 15,
    usageLimit: 500, usedCount: 312, perCustomerLimit: 2,
    startDate: '2026-04-01', expiryDate: '2026-06-30', isActive: true,
    applicableCategory: 'All', description: 'Summer sale — 20% off (max $15 cap, min $30)',
  },
  {
    id: 'v4', code: 'BEVE15', name: 'Beverages 15% Off',
    type: 'percentage', value: 15, minPurchase: 10, maxDiscount: 8,
    usageLimit: 0, usedCount: 67, perCustomerLimit: 0,
    startDate: '2026-04-01', expiryDate: '2026-05-31', isActive: true,
    applicableCategory: 'Beverages', description: '15% off all Beverages orders (min $10, max $8)',
  },
  {
    id: 'v5', code: 'VIP30', name: 'VIP 30% Discount',
    type: 'percentage', value: 30, minPurchase: 50, maxDiscount: 25,
    usageLimit: 100, usedCount: 18, perCustomerLimit: 1,
    startDate: '2026-04-01', expiryDate: '2026-04-30', isActive: true,
    applicableCategory: 'All', description: 'Exclusive VIP voucher — 30% off orders over $50 (max $25)',
  },
  {
    id: 'v6', code: 'NEWUSER', name: 'New User $10 Off',
    type: 'fixed', value: 10, minPurchase: 15, maxDiscount: null,
    usageLimit: 1000, usedCount: 892, perCustomerLimit: 1,
    startDate: '2026-01-01', expiryDate: '2026-12-31', isActive: true,
    applicableCategory: 'All', description: 'One-time $10 discount for new users',
  },
  {
    id: 'v7', code: 'FLASH15', name: 'Flash Sale 15%',
    type: 'percentage', value: 15, minPurchase: 0, maxDiscount: 10,
    usageLimit: 50, usedCount: 50, perCustomerLimit: 1,
    startDate: '2026-04-10', expiryDate: '2026-04-10', isActive: false,
    applicableCategory: 'All', description: 'One-day flash sale — fully redeemed',
  },
  {
    id: 'v8', code: 'FOOD10', name: 'Food Lovers 10%',
    type: 'percentage', value: 10, minPurchase: 15, maxDiscount: null,
    usageLimit: 0, usedCount: 234, perCustomerLimit: 0,
    startDate: '2026-03-01', expiryDate: '2026-06-30', isActive: true,
    applicableCategory: 'Food', description: '10% off all food items (min $15)',
  },
];

// Tier mapped by totalSpent: bronze<300, silver 300-700, gold 700-1200, platinum 1200+
export const initialLoyaltyAccounts: LoyaltyAccount[] = [
  { customerId: '1', points: 125, lifetimePoints: 612, lifetimeSpend: 486.50, tierId: 'silver', walletBalance: 12.50, joinedAt: '2024-01-15', lastActivity: '2026-04-14' },
  { customerId: '2', points: 80, lifetimePoints: 391, lifetimeSpend: 312.75, tierId: 'silver', walletBalance: 5.00, joinedAt: '2024-02-20', lastActivity: '2026-04-12' },
  { customerId: '3', points: 215, lifetimePoints: 1080, lifetimeSpend: 720.00, tierId: 'gold', walletBalance: 25.00, joinedAt: '2023-11-05', lastActivity: '2026-04-14' },
  { customerId: '4', points: 42, lifetimePoints: 156, lifetimeSpend: 156.25, tierId: 'bronze', walletBalance: 0, joinedAt: '2024-03-10', lastActivity: '2026-04-10' },
  { customerId: '5', points: 380, lifetimePoints: 2051, lifetimeSpend: 1025.50, tierId: 'gold', walletBalance: 45.00, joinedAt: '2023-09-22', lastActivity: '2026-04-14' },
  { customerId: '6', points: 55, lifetimePoints: 278, lifetimeSpend: 278.00, tierId: 'bronze', walletBalance: 0, joinedAt: '2024-01-30', lastActivity: '2026-04-08' },
  { customerId: '7', points: 98, lifetimePoints: 557, lifetimeSpend: 445.75, tierId: 'silver', walletBalance: 8.00, joinedAt: '2023-12-14', lastActivity: '2026-04-13' },
  { customerId: '8', points: 15, lifetimePoints: 99, lifetimeSpend: 98.50, tierId: 'bronze', walletBalance: 0, joinedAt: '2024-04-01', lastActivity: '2026-04-05' },
];

export const initialPointsTransactions: PointsTransaction[] = [
  { id: 'pt1', customerId: '5', customerName: 'Eve Davis', type: 'earned', points: 38, description: 'Order ORD-2024-005 — $19.80', orderId: 'ORD-2024-005', balance: 380, createdAt: '2026-04-14T11:30:00' },
  { id: 'pt2', customerId: '3', customerName: 'Carol White', type: 'earned', points: 26, description: 'Order ORD-2024-003 — $17.60', orderId: 'ORD-2024-003', balance: 215, createdAt: '2026-04-14T10:20:00' },
  { id: 'pt3', customerId: '1', customerName: 'Alice Johnson', type: 'earned', points: 14, description: 'Order ORD-2024-001 — $11.55', orderId: 'ORD-2024-001', balance: 125, createdAt: '2026-04-14T09:15:00' },
  { id: 'pt4', customerId: '2', customerName: 'Bob Smith', type: 'earned', points: 17, description: 'Order ORD-2024-002 — $13.30', orderId: 'ORD-2024-002', balance: 80, createdAt: '2026-04-14T09:45:00' },
  { id: 'pt5', customerId: '5', customerName: 'Eve Davis', type: 'redeemed', points: -200, description: 'Redeemed 200 pts → $2.00 discount', orderId: 'ORD-2024-004', balance: 342, createdAt: '2026-04-13T14:20:00' },
  { id: 'pt6', customerId: '3', customerName: 'Carol White', type: 'topup', points: 0, walletAmount: 20, description: 'Wallet top-up — Card', balance: 215, createdAt: '2026-04-12T10:00:00' },
  { id: 'pt7', customerId: '7', customerName: 'Grace Lee', type: 'earned', points: 22, description: 'Order ORD-2024-007 — $17.60', orderId: 'ORD-2024-007', balance: 98, createdAt: '2026-04-13T15:30:00' },
  { id: 'pt8', customerId: '1', customerName: 'Alice Johnson', type: 'adjusted', points: 50, description: 'Bonus — Customer Appreciation Day', balance: 111, createdAt: '2026-04-10T09:00:00' },
  { id: 'pt9', customerId: '5', customerName: 'Eve Davis', type: 'topup', points: 0, walletAmount: 50, description: 'Wallet top-up — Digital Wallet', balance: 380, createdAt: '2026-04-11T11:00:00' },
  { id: 'pt10', customerId: '4', customerName: 'David Brown', type: 'earned', points: 12, description: 'Order ORD-2024-010 — $12.00', orderId: 'ORD-2024-010', balance: 42, createdAt: '2026-04-10T14:00:00' },
  { id: 'pt11', customerId: '2', customerName: 'Bob Smith', type: 'earned', points: 20, description: 'Order ORD-2024-011 — $16.00', orderId: 'ORD-2024-011', balance: 63, createdAt: '2026-04-12T12:30:00' },
  { id: 'pt12', customerId: '6', customerName: 'Frank Wilson', type: 'earned', points: 18, description: 'Order ORD-2024-012 — $18.00', orderId: 'ORD-2024-012', balance: 55, createdAt: '2026-04-08T16:00:00' },
  { id: 'pt13', customerId: '3', customerName: 'Carol White', type: 'adjusted', points: -50, description: 'Points correction — expired bonus', balance: 189, createdAt: '2026-04-01T00:00:00' },
  { id: 'pt14', customerId: '5', customerName: 'Eve Davis', type: 'earned', points: 45, description: 'Order ORD-2024-015 — $29.50', orderId: 'ORD-2024-015', balance: 425, createdAt: '2026-04-09T13:00:00' },
  { id: 'pt15', customerId: '8', customerName: 'Henry Taylor', type: 'earned', points: 15, description: 'Welcome bonus — first purchase', balance: 15, createdAt: '2026-04-05T10:00:00' },
];
