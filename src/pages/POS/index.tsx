import { useState, useMemo, useEffect } from 'react';
import {
  Row, Col, Card, Input, Button, Typography, Space, Tag, Divider,
  InputNumber, Empty, Modal, Radio, message, Badge, Select, Dropdown, Tooltip,
  Avatar, Segmented, List, Grid, Tabs, Switch,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, MinusOutlined, DeleteOutlined,
  ShoppingCartOutlined, CreditCardOutlined, DollarOutlined,
  MobileOutlined, CheckCircleOutlined, UserOutlined, DownloadOutlined,
  AppstoreOutlined, UnorderedListOutlined, MenuOutlined, BarsOutlined,
  FilePdfOutlined, FileExcelOutlined, PrinterOutlined, ClearOutlined,
  FullscreenOutlined, FullscreenExitOutlined, FileTextOutlined,
  ClockCircleOutlined, TagOutlined, WalletOutlined, StarOutlined,
  GiftOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { products, categories, customers, recentOrders } from '../../data/mockData';
import type { Product, CartItem, Order, Voucher } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLoyalty } from '../../contexts/LoyaltyContext';
import { theme as antTheme } from 'antd';

const { Title, Text } = Typography;

// ─── Types ───────────────────────────────────────────────────────────────────
type POSLayout = 'grid' | 'cafe' | 'supermarket' | 'restaurant' | 'list';
type POSMode = '2panel' | '3panel';

interface LayoutConfig {
  label: string; emoji: string; description: string; icon: React.ReactNode;
  cols: { xs: number; sm: number; md: number };
  imgSize: number; showDesc: boolean; horizontal: boolean; compact: boolean; accent: string;
}

// ─── Layout configs ───────────────────────────────────────────────────────────
const LAYOUTS: Record<POSLayout, LayoutConfig> = {
  grid: {
    label: 'Default', emoji: '⊞', description: 'Standard product grid',
    icon: <AppstoreOutlined />, cols: { xs: 12, sm: 8, md: 6 },
    imgSize: 60, showDesc: false, horizontal: false, compact: false, accent: '#667eea',
  },
  cafe: {
    label: 'Cafe', emoji: '☕', description: 'Warm cafe style',
    icon: <MenuOutlined />, cols: { xs: 12, sm: 12, md: 8 },
    imgSize: 88, showDesc: false, horizontal: false, compact: false, accent: '#c47941',
  },
  supermarket: {
    label: 'Supermarket', emoji: '🛒', description: 'Dense grid for many items',
    icon: <BarsOutlined />, cols: { xs: 8, sm: 6, md: 4 },
    imgSize: 38, showDesc: false, horizontal: false, compact: true, accent: '#2e7d32',
  },
  restaurant: {
    label: 'Restaurant', emoji: '🍽️', description: 'Menu cards with description',
    icon: <UnorderedListOutlined />, cols: { xs: 24, sm: 12, md: 12 },
    imgSize: 80, showDesc: true, horizontal: true, compact: false, accent: '#b71c1c',
  },
  list: {
    label: 'List', emoji: '☰', description: 'Compact single-column',
    icon: <UnorderedListOutlined />, cols: { xs: 24, sm: 24, md: 24 },
    imgSize: 40, showDesc: false, horizontal: true, compact: true, accent: '#1565c0',
  },
};

// ─── Export helpers ───────────────────────────────────────────────────────────
function exportOrdersExcel(orders: Order[]) {
  const rows = orders.map((o) => [
    o.orderNumber,
    o.customer?.name ?? 'Walk-in',
    o.items.reduce((s, i) => s + i.quantity, 0),
    `$${o.subtotal.toFixed(2)}`,
    `-$${o.discount.toFixed(2)}`,
    `$${o.tax.toFixed(2)}`,
    `$${o.total.toFixed(2)}`,
    o.paymentMethod,
    o.status.toUpperCase(),
    o.cashier,
    new Date(o.createdAt).toLocaleString(),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ['Order #', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment', 'Status', 'Cashier', 'Time'],
    ...rows,
  ]);
  ws['!cols'] = [14, 18, 7, 10, 10, 8, 10, 10, 12, 14, 20].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, `swiftpos-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
  message.success('Excel downloaded');
}

function exportOrdersPDF(orders: Order[]) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString();
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('SwiftPOS — Order Report', 14, 17);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${now}`, 14, 24);
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 34,
    head: [['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Time']],
    body: orders.map((o) => [
      o.orderNumber, o.customer?.name ?? 'Walk-in',
      o.items.reduce((s, i) => s + i.quantity, 0).toString(),
      `$${o.total.toFixed(2)}`,
      o.paymentMethod, o.status.toUpperCase(),
      new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 255] },
  });
  doc.save(`swiftpos-orders-${new Date().toISOString().slice(0, 10)}.pdf`);
  message.success('PDF downloaded');
}

function exportReceiptPDF(params: {
  orderNumber: string; orderTime: Date; cart: CartItem[]; customer: string;
  cashier: string; subtotal: number; discountPct: number; discountAmt: number;
  tax: number; total: number; paymentMethod: string;
  cashTendered: number; change: number; note: string;
}) {
  const { orderNumber, orderTime, cart, customer, cashier, subtotal,
    discountPct, discountAmt, tax, total, paymentMethod, cashTendered, change, note } = params;
  const doc = new jsPDF({ unit: 'mm', format: [80, 220], orientation: 'portrait' });
  const pw = 80; let y = 8;

  const txt = (s: string, size = 8, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(s, align === 'center' ? pw / 2 : align === 'right' ? pw - 4 : 4, y, { align });
    y += size * 0.42 + 2.2;
  };
  const dash = (c = '-') => { doc.setFontSize(7); doc.text(c.repeat(42), pw / 2, y, { align: 'center' }); y += 5; };
  const pair = (l: string, r: string, bold = false) => {
    doc.setFontSize(7.5); doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(l, 4, y); doc.text(r, pw - 4, y, { align: 'right' }); y += 5;
  };

  doc.setTextColor(0, 0, 0);
  txt('SwiftPOS', 13, true, 'center');
  txt('Point of Sale Receipt', 7, false, 'center');
  y += 1; dash();
  txt(`Date: ${orderTime.toLocaleDateString()}`, 7);
  txt(`Time: ${orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 7);
  txt(`Order: ${orderNumber}`, 7);
  txt(`Cashier: ${cashier}`, 7);
  txt(`Customer: ${customer}`, 7);
  dash();
  txt('ITEMS', 7, true);
  y += 1;
  cart.forEach((item) => {
    txt(item.product.name.substring(0, 24), 7, true);
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
    doc.text(`${item.quantity} × $${item.product.price.toFixed(2)}`, 4, y);
    doc.text(`$${(item.product.price * item.quantity).toFixed(2)}`, pw - 4, y, { align: 'right' });
    y += 5;
  });
  dash();
  pair('Subtotal', `$${subtotal.toFixed(2)}`);
  if (discountAmt > 0) pair(`Discount (${discountPct}%)`, `-$${discountAmt.toFixed(2)}`);
  pair('Tax (10%)', `$${tax.toFixed(2)}`);
  dash('=');
  pair('TOTAL', `$${total.toFixed(2)}`, true);
  dash();
  pair('Payment', paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1));
  if (paymentMethod === 'cash' && cashTendered > 0) {
    pair('Tendered', `$${cashTendered.toFixed(2)}`);
    pair('Change', `$${change.toFixed(2)}`);
  }
  if (note) { dash(); txt(`Note: ${note}`, 6.5); }
  dash(); y += 2;
  txt('Thank you for your purchase!', 7.5, true, 'center');
  txt('Please come again', 6.5, false, 'center');
  doc.save(`receipt-${orderNumber}.pdf`);
  message.success('Receipt downloaded');
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, layout, accent, inCart, onAdd }: {
  product: Product; layout: POSLayout; accent: string; inCart: boolean; onAdd: () => void;
}) {
  const cfg = LAYOUTS[layout];
  const { token } = antTheme.useToken();
  const border = `1.5px solid ${inCart ? accent : token.colorBorderSecondary}`;
  const bg = inCart ? `${accent}10` : token.colorBgContainer;

  if (layout === 'list') {
    return (
      <div onClick={onAdd} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
        borderRadius: 8, cursor: 'pointer', border, background: bg, transition: 'all 0.15s', marginBottom: 5,
      }}>
        <img src={product.image} alt={product.name}
          style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 12, display: 'block' }} ellipsis>{product.name}</Text>
          <Text type="secondary" style={{ fontSize: 10 }}>{product.category} · Stock: {product.stock}</Text>
        </div>
        <Text style={{ color: accent, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          ${product.price.toFixed(2)}
        </Text>
        <Button type={inCart ? 'primary' : 'default'} size="small" shape="circle" icon={<PlusOutlined />}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          style={{ flexShrink: 0, ...(inCart ? { background: accent, borderColor: accent } : {}) }}
        />
      </div>
    );
  }

  if (layout === 'restaurant') {
    return (
      <div onClick={onAdd} style={{
        display: 'flex', gap: 10, padding: 10, borderRadius: 10,
        cursor: 'pointer', border, background: bg, transition: 'all 0.15s', marginBottom: 8,
      }}>
        <img src={product.image} alt={product.name}
          style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{product.name}</Text>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4, lineHeight: 1.4 }}>
            {product.description ?? product.category}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: accent, fontWeight: 700, fontSize: 16 }}>${product.price.toFixed(2)}</Text>
            <Space>
              <Text type="secondary" style={{ fontSize: 10 }}>Stock: {product.stock}</Text>
              {inCart && <Tag color={accent} style={{ margin: 0, fontSize: 10, padding: '0 5px' }}>In Cart</Tag>}
            </Space>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card hoverable onClick={onAdd}
      style={{ borderRadius: 10, cursor: 'pointer', border, background: bg, transition: 'all 0.15s', position: 'relative' }}
      styles={{ body: { padding: cfg.compact ? 7 : 10, textAlign: 'center' } }}
    >
      {inCart && (
        <div style={{
          position: 'absolute', top: 5, right: 5, width: 17, height: 17, borderRadius: '50%',
          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
        }}>
          <CheckCircleOutlined style={{ color: 'white', fontSize: 9 }} />
        </div>
      )}
      <img src={product.image} alt={product.name}
        style={{ width: cfg.imgSize, height: cfg.imgSize, borderRadius: 7, objectFit: 'cover', marginBottom: 5 }} />
      <Text strong style={{ fontSize: cfg.compact ? 10 : 12, display: 'block', lineHeight: 1.3, marginBottom: 2 }}>
        {product.name}
      </Text>
      <Text style={{ color: accent, fontWeight: 700, fontSize: cfg.compact ? 11 : 14, display: 'block' }}>
        ${product.price.toFixed(2)}
      </Text>
      {!cfg.compact && (
        <Text type="secondary" style={{ fontSize: 9 }}>Stock: {product.stock}</Text>
      )}
    </Card>
  );
}

// ─── Bill status colors ───────────────────────────────────────────────────────
const BILL_STATUS: Record<string, string> = {
  completed: 'green', pending: 'gold', refunded: 'blue', cancelled: 'red',
};

// ─── Main POS ────────────────────────────────────────────────────────────────
export default function POS() {
  const { user } = useAuth();
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { vouchers, accounts, tiers, earnPoints: loyaltyEarn, redeemPoints: loyaltyRedeem, deductWallet, incrementVoucherUsage } = useLoyalty();

  // — Panel & layout mode —
  const [posMode, setPosMode] = useState<POSMode>(() =>
    (localStorage.getItem('swiftpos_posmode') as POSMode) || '2panel');
  const [posLayout, setPosLayout] = useState<POSLayout>(() =>
    (localStorage.getItem('swiftpos_poslayout') as POSLayout) || 'grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const layoutCfg = LAYOUTS[posLayout];

  // — Cart state —
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>();

  // — Payment modal —
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('card');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [currentOrderNum] = useState(() => `ORD-${Date.now().toString().slice(-6)}`);
  const [orderTime] = useState(() => new Date());

  // — Loyalty / voucher state —
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [redeemPts, setRedeemPts] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [earnedPts, setEarnedPts] = useState(0);

  // — Today's bills (3-panel) —
  const [todaysBills, setTodaysBills] = useState<Order[]>([...recentOrders]);
  const [selectedBill, setSelectedBill] = useState<Order | null>(null);
  const [billDetailModal, setBillDetailModal] = useState(false);

  // — Computed —
  const filtered = useMemo(() => products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [search, activeCategory]);

  const cartProductIds = useMemo(() => new Set(cart.map((i) => i.product.id)), [cart]);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const discountAmt = (subtotal * discount) / 100;
  const total = subtotal + tax - discountAmt;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  // — Loyalty derived values —
  const customerAccount = useMemo(() =>
    selectedCustomer ? accounts.find((a) => a.customerId === selectedCustomer) ?? null : null
  , [selectedCustomer, accounts]);
  const customerTierInfo = useMemo(() =>
    customerAccount ? tiers.find((t) => t.id === customerAccount.tierId) ?? null : null
  , [customerAccount, tiers]);
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    let d = appliedVoucher.type === 'percentage' ? (subtotal * appliedVoucher.value / 100) : appliedVoucher.value;
    if (appliedVoucher.maxDiscount) d = Math.min(d, appliedVoucher.maxDiscount);
    return Math.min(d, total);
  }, [appliedVoucher, subtotal, total]);
  const pointsDiscount = redeemPts / 100;
  const preWalletTotal = Math.max(0, total - voucherDiscount - pointsDiscount);
  const walletAvailable = customerAccount?.walletBalance ?? 0;
  const walletUsed = useWallet ? Math.min(walletAvailable, preWalletTotal) : 0;
  const grandTotal = Math.max(0, preWalletTotal - walletUsed);
  const maxRedeemPts = customerAccount
    ? Math.floor(Math.min(customerAccount.points, (total - voucherDiscount) * 100) / 100) * 100
    : 0;

  const change = cashTendered - grandTotal;

  const customerName = selectedCustomer
    ? customers.find((c) => c.id === selectedCustomer)?.name ?? 'Walk-in' : 'Walk-in';

  const todayRevenue = todaysBills
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.total, 0);

  // — Cart ops —
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };
  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, quantity: qty } : i));
  };
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.product.id !== id));
  const clearCart = () => { setCart([]); setDiscount(0); setNote(''); setSelectedCustomer(undefined); };

  // — Persistence —
  const setLayout = (l: POSLayout) => { setPosLayout(l); localStorage.setItem('swiftpos_poslayout', l); };
  const setMode = (m: POSMode) => { setPosMode(m); localStorage.setItem('swiftpos_posmode', m); };

  // — Voucher apply —
  const applyVoucher = () => {
    const v = vouchers.find((v) => v.code === voucherCode.toUpperCase() && v.isActive);
    if (!v) { setVoucherError('Invalid or inactive voucher code'); return; }
    if (new Date(v.expiryDate) < new Date()) { setVoucherError('This voucher has expired'); return; }
    if (v.usageLimit > 0 && v.usedCount >= v.usageLimit) { setVoucherError('Voucher has been fully redeemed'); return; }
    if (subtotal < v.minPurchase) { setVoucherError(`Min purchase of $${v.minPurchase.toFixed(2)} required`); return; }
    if (v.applicableCategory !== 'All') {
      const hasMatch = cart.some((i) => i.product.category === v.applicableCategory);
      if (!hasMatch) { setVoucherError(`Voucher only applies to ${v.applicableCategory} items`); return; }
    }
    setAppliedVoucher(v);
    setVoucherError('');
    message.success(`Voucher "${v.code}" applied — ${v.type === 'percentage' ? `${v.value}% off` : `$${v.value} off`}`);
  };

  // — Checkout —
  const handleCheckout = () => {
    if (cart.length === 0) { message.warning('Cart is empty'); return; }
    // Reset loyalty state
    setVoucherCode(''); setAppliedVoucher(null); setVoucherError('');
    setRedeemPts(0); setUseWallet(false); setEarnedPts(0);
    // Auto-apply tier discount if customer is a member
    if (selectedCustomer) {
      const acc = accounts.find((a) => a.customerId === selectedCustomer);
      if (acc) {
        const tier = tiers.find((t) => t.id === acc.tierId);
        if (tier && tier.discountRate > discount) setDiscount(tier.discountRate);
      }
    }
    setPaymentModal(true);
    setCashTendered(Math.ceil(total));
  };

  const handlePayment = () => {
    if (paymentMethod === 'cash' && cashTendered < grandTotal) {
      message.error('Insufficient cash tendered'); return;
    }
    // Process loyalty
    let pts = 0;
    if (selectedCustomer && customerAccount) {
      const custName = customers.find((c) => c.id === selectedCustomer)?.name ?? '';
      pts = loyaltyEarn(selectedCustomer, custName, grandTotal, currentOrderNum);
      if (redeemPts > 0) loyaltyRedeem(selectedCustomer, custName, redeemPts, currentOrderNum);
      if (walletUsed > 0) deductWallet(selectedCustomer, walletUsed, currentOrderNum);
    }
    if (appliedVoucher) incrementVoucherUsage(appliedVoucher.id);
    setEarnedPts(pts);
    setOrderSuccess(true);
  };

  const handleNewOrder = () => {
    const newBill: Order = {
      id: currentOrderNum, orderNumber: currentOrderNum,
      items: [...cart], subtotal, tax, discount: discountAmt, total: grandTotal,
      paymentMethod, status: 'completed',
      customer: selectedCustomer ? customers.find((c) => c.id === selectedCustomer) : undefined,
      cashier: user?.name ?? 'Cashier', createdAt: new Date().toISOString(),
    };
    setTodaysBills((prev) => [newBill, ...prev]);
    setPaymentModal(false);
    setOrderSuccess(false);
    clearCart();
    setVoucherCode(''); setAppliedVoucher(null); setVoucherError('');
    setRedeemPts(0); setUseWallet(false); setEarnedPts(0);
    message.success('Order completed!');
  };

  const handleDownloadReceipt = () => {
    exportReceiptPDF({
      orderNumber: currentOrderNum, orderTime, cart,
      customer: customerName, cashier: user?.name ?? 'Cashier',
      subtotal, discountPct: discount, discountAmt,
      tax, total: grandTotal, paymentMethod,
      cashTendered, change: Math.max(0, change), note,
    });
  };

  // ── Fullscreen clock ──────────────────────────────────────────────────────
  const [fsTime, setFsTime] = useState(new Date());
  useEffect(() => {
    if (!isFullscreen) return;
    const t = setInterval(() => setFsTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [isFullscreen]);

  // ── Dropdown menus ────────────────────────────────────────────────────────
  const exportMenu = {
    items: [
      { key: 'excel', icon: <FileExcelOutlined style={{ color: '#1d6f42' }} />, label: 'Export to Excel (.xlsx)', onClick: () => exportOrdersExcel(todaysBills) },
      { key: 'pdf', icon: <FilePdfOutlined style={{ color: '#e53935' }} />, label: 'Export to PDF', onClick: () => exportOrdersPDF(todaysBills) },
    ],
  };

  const layoutMenu = {
    items: Object.entries(LAYOUTS).map(([key, cfg]) => ({
      key,
      label: (
        <Space>
          <span style={{ fontSize: 15 }}>{cfg.emoji}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{cfg.label}</div>
            <div style={{ fontSize: 10, opacity: 0.6 }}>{cfg.description}</div>
          </div>
        </Space>
      ),
      onClick: () => setLayout(key as POSLayout),
    })),
    selectedKeys: [posLayout],
  };

  // ── Column widths per mode ────────────────────────────────────────────────
  const prodCols = posMode === '3panel' ? { xs: 24, md: 14, lg: 10 } : { xs: 24, md: 14, lg: 15 };
  const cartCols = posMode === '3panel' ? { xs: 24, md: 10, lg: 8 } : { xs: 24, md: 10, lg: 9 };

  // ─────────────────────────────────────────────────────────────────────────
  // PANELS
  // ─────────────────────────────────────────────────────────────────────────

  // — Products panel —
  const productsPanel = (
    <Card bordered={false} style={{
      borderRadius: 12,
      height: isMobile ? undefined : '100%',
      display: 'flex', flexDirection: 'column',
      overflow: isMobile ? undefined : 'hidden',
    }}
      styles={{ body: { padding: 14, display: 'flex', flexDirection: 'column', flex: isMobile ? undefined : 1, overflow: isMobile ? undefined : 'hidden' } }}>
      <Input prefix={<SearchOutlined />} placeholder="Search products..." value={search}
        onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: 10, borderRadius: 8 }} allowClear />

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 3, scrollbarWidth: 'none', flexShrink: 0 }}>
        {categories.map((cat) => (
          <Tag key={cat} onClick={() => setActiveCategory(cat)} style={{
            cursor: 'pointer', padding: '3px 12px', borderRadius: 20, border: 'none',
            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
            background: activeCategory === cat ? layoutCfg.accent : token.colorFillSecondary,
            color: activeCategory === cat ? 'white' : token.colorText,
            fontWeight: activeCategory === cat ? 600 : 400,
          }}>{cat}</Tag>
        ))}
      </div>

      <Text type="secondary" style={{ fontSize: 11, marginBottom: 8, flexShrink: 0, display: 'block' }}>
        {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' ? ` · ${activeCategory}` : ''}
      </Text>

      {/* Scrollable product area */}
      <div style={{
        flex: isMobile ? undefined : 1,
        overflowY: 'auto',
        minHeight: isMobile ? 300 : 0,
        maxHeight: isMobile ? 'calc(100dvh - 280px)' : undefined,
        paddingRight: 2,
      }}>
        {filtered.length === 0 ? (
          <Empty description="No products found" style={{ marginTop: 40 }} />
        ) : (posLayout === 'list' || posLayout === 'restaurant') ? (
          filtered.map((p) => (
            <ProductCard key={p.id} product={p} layout={posLayout} accent={layoutCfg.accent}
              inCart={cartProductIds.has(p.id)} onAdd={() => addToCart(p)} />
          ))
        ) : (
          <Row gutter={[8, 8]}>
            {filtered.map((p) => (
              <Col key={p.id} {...layoutCfg.cols}>
                <ProductCard product={p} layout={posLayout} accent={layoutCfg.accent}
                  inCart={cartProductIds.has(p.id)} onAdd={() => addToCart(p)} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Card>
  );

  // — Cart panel —
  const cartPanel = (
    <div style={{
      height: isMobile ? undefined : '100%',
      background: token.colorBgContainer, borderRadius: 12,
      border: `1px solid ${token.colorBorderSecondary}`,
      display: 'flex', flexDirection: 'column',
      overflow: isMobile ? undefined : 'hidden',
    }}>
      {/* Cart header */}
      <div style={{
        padding: '12px 14px', borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <Space size={10}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
          }}>
            <ShoppingCartOutlined style={{ color: 'white', fontSize: 16 }} />
            {totalItems > 0 && (
              <div style={{
                position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17,
                borderRadius: 9, background: '#ff4d4f', color: 'white',
                fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}>{totalItems}</div>
            )}
          </div>
          <div>
            <Text strong style={{ fontSize: 14, display: 'block', lineHeight: 1.2 }}>Current Order</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {cart.length === 0 ? 'Empty' : `${cart.length} product${cart.length > 1 ? 's' : ''}`}
            </Text>
          </div>
        </Space>
        <Tooltip title="Clear cart">
          <Button size="small" danger type="text" icon={<ClearOutlined />}
            onClick={clearCart} disabled={cart.length === 0} style={{ borderRadius: 6 }}>
            Clear
          </Button>
        </Tooltip>
      </div>

      {/* Customer select */}
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}>
        <Select placeholder={<Space size={4}><UserOutlined />Customer (optional)</Space>}
          value={selectedCustomer} onChange={setSelectedCustomer} allowClear style={{ width: '100%' }}
          options={customers.map((c) => ({
            value: c.id,
            label: <Space size={6}><Avatar size={18} style={{ background: '#667eea', fontSize: 9 }}>{c.name[0]}</Avatar>{c.name}</Space>,
          }))} />
      </div>

      {/* Cart items — scrollable */}
      <div style={{
        flex: isMobile ? undefined : 1,
        overflowY: 'auto',
        minHeight: 0,
        maxHeight: isMobile ? 'calc(100dvh - 380px)' : undefined,
        padding: '6px 14px',
      }}>
        {cart.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
            <ShoppingCartOutlined style={{ fontSize: 36, marginBottom: 8 }} />
            <Text type="secondary" style={{ fontSize: 13 }}>Cart is empty</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Tap products to add</Text>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 0',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}>
              <img src={item.product.image} alt={item.product.name}
                style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 12, display: 'block', fontWeight: 500 }} ellipsis>{item.product.name}</Text>
                <Text style={{ color: '#667eea', fontSize: 12, fontWeight: 600 }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </div>
              <Space size={2}>
                <Button size="small" type="text" shape="circle" icon={<MinusOutlined />}
                  onClick={() => updateQty(item.product.id, item.quantity - 1)}
                  style={{ width: 22, height: 22, minWidth: 22, fontSize: 9 }} />
                <InputNumber value={item.quantity} min={1} max={item.product.stock}
                  onChange={(v) => updateQty(item.product.id, v ?? 1)}
                  style={{ width: 40 }} size="small" controls={false} />
                <Button size="small" type="text" shape="circle" icon={<PlusOutlined />}
                  onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  style={{ width: 22, height: 22, minWidth: 22, fontSize: 9 }} />
                <Button size="small" type="text" shape="circle" danger icon={<DeleteOutlined />}
                  onClick={() => removeFromCart(item.product.id)}
                  style={{ width: 22, height: 22, minWidth: 22, fontSize: 9 }} />
              </Space>
            </div>
          ))
        )}
      </div>

      {/* Fixed footer — totals + checkout */}
      <div style={{ flexShrink: 0, padding: '10px 14px 14px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Input placeholder="Order note..." value={note} onChange={(e) => setNote(e.target.value)}
          size="small" style={{ marginBottom: 8, borderRadius: 6 }} />

        <div style={{ background: token.colorFillQuaternary, borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
          {[['Subtotal', `$${subtotal.toFixed(2)}`], ['Tax (10%)', `$${tax.toFixed(2)}`]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{l}</Text>
              <Text style={{ fontSize: 11 }}>{v}</Text>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Discount</Text>
            <Space size={4}>
              <InputNumber value={discount} min={0} max={100}
                onChange={(v) => setDiscount(v ?? 0)}
                formatter={(v) => `${v}%`}
                parser={(v) => Number(v?.replace('%', '') ?? 0)}
                size="small" style={{ width: 56 }} />
              {discountAmt > 0 && <Text style={{ color: '#ff4d4f', fontSize: 11 }}>-${discountAmt.toFixed(2)}</Text>}
            </Space>
          </div>
          <Divider style={{ margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 13 }}>Total</Text>
            <Text strong style={{ fontSize: 15, color: '#667eea' }}>${total.toFixed(2)}</Text>
          </div>
        </div>

        <Button type="primary" size="large" block icon={<CreditCardOutlined />}
          onClick={handleCheckout} disabled={cart.length === 0}
          style={{
            background: cart.length === 0 ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none', borderRadius: 8, height: 44, fontSize: 14, fontWeight: 600,
          }}>
          {cart.length === 0 ? 'Checkout' : `Checkout — $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );

  // — Today's Bills panel —
  const billsPanel = (
    <div style={{
      height: isMobile ? undefined : '100%',
      background: token.colorBgContainer, borderRadius: 12,
      border: `1px solid ${token.colorBorderSecondary}`,
      display: 'flex', flexDirection: 'column',
      overflow: isMobile ? undefined : 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <Space>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileTextOutlined style={{ color: 'white', fontSize: 16 }} />
          </div>
          <div>
            <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.2 }}>Today's Bills</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{todaysBills.length} transactions</Text>
          </div>
        </Space>
        <div style={{ textAlign: 'right' }}>
          <Text style={{ color: '#52c41a', fontWeight: 700, fontSize: 14, display: 'block', lineHeight: 1.2 }}>
            ${todayRevenue.toFixed(2)}
          </Text>
          <Text type="secondary" style={{ fontSize: 10 }}>revenue</Text>
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ padding: '6px 14px 4px', borderBottom: `1px solid ${token.colorBorderSecondary}`, flexShrink: 0 }}>
        <Space size={4} wrap>
          {(['all', 'completed', 'pending', 'refunded'] as const).map((s) => {
            const count = s === 'all' ? todaysBills.length : todaysBills.filter((b) => b.status === s).length;
            return (
              <Tag key={s} style={{ cursor: 'pointer', fontSize: 10, borderRadius: 8 }}
                color={s === 'completed' ? 'green' : s === 'pending' ? 'gold' : s === 'refunded' ? 'blue' : undefined}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({count})
              </Tag>
            );
          })}
        </Space>
      </div>

      {/* Bills list — scrollable */}
      <div style={{
        flex: isMobile ? undefined : 1,
        overflowY: 'auto',
        minHeight: 0,
        maxHeight: isMobile ? 300 : undefined,
        padding: '6px 10px',
      }}>
        {todaysBills.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4 }}>
            <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>No bills yet</Text>
          </div>
        ) : (
          todaysBills.map((bill) => (
            <div key={bill.id} style={{
              padding: '8px 10px', borderRadius: 8, marginBottom: 5,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorFillQuaternary,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onClick={() => { setSelectedBill(bill); setBillDetailModal(true); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 11, display: 'block', color: '#667eea' }}>
                    {bill.orderNumber}
                  </Text>
                  <Text style={{ fontSize: 10, display: 'block' }} type="secondary">
                    {bill.customer?.name ?? 'Walk-in'}
                  </Text>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Text strong style={{ fontSize: 12, display: 'block', color: '#52c41a' }}>
                    ${bill.total.toFixed(2)}
                  </Text>
                  <Tag color={BILL_STATUS[bill.status]} style={{ fontSize: 9, padding: '0 4px', margin: 0 }}>
                    {bill.status.toUpperCase()}
                  </Tag>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Space size={4}>
                  <ClockCircleOutlined style={{ fontSize: 9, opacity: 0.5 }} />
                  <Text type="secondary" style={{ fontSize: 9 }}>
                    {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 9 }}>
                  {bill.items.reduce((s, i) => s + i.quantity, 0)} items · {bill.paymentMethod}
                </Text>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Daily summary footer */}
      <div style={{
        flexShrink: 0, padding: '8px 14px', borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 11 }}>Completed</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#52c41a' }}>
              {todaysBills.filter((b) => b.status === 'completed').length}
            </Text>
          </Space>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 11 }}>Pending</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: '#fa8c16' }}>
              {todaysBills.filter((b) => b.status === 'pending').length}
            </Text>
          </Space>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 11 }}>Avg</Text>
            <Text style={{ fontSize: 11, fontWeight: 600 }}>
              ${todaysBills.length > 0 ? (todayRevenue / todaysBills.filter((b) => b.status === 'completed').length || 0).toFixed(0) : '0'}
            </Text>
          </Space>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // HEADER ROW
  // ─────────────────────────────────────────────────────────────────────────
  const headerRow = (
    <div style={{
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: 10, flexShrink: 0,
      flexWrap: 'wrap', gap: 6,
    }}>
      <div>
        <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>{isMobile ? 'POS' : 'Point of Sale'}</Title>
        {!isMobile && <Text type="secondary" style={{ fontSize: 11 }}>Select products and process payment</Text>}
      </div>
      <Space size={4} wrap>
        {/* Panel mode toggle — hide on mobile */}
        {!isMobile && (
          <Segmented
            size="small"
            value={posMode}
            onChange={(v) => setMode(v as POSMode)}
            options={[
              { value: '2panel', label: <Tooltip title="Products + Cart"><span>⊟ Standard</span></Tooltip> },
              { value: '3panel', label: <Tooltip title="Products + Cart + Bills"><span>⊞ Full System</span></Tooltip> },
            ]}
          />
        )}

        {/* Layout selector */}
        <Dropdown menu={layoutMenu} trigger={['click']}>
          <Button size="small" icon={layoutCfg.icon}>
            {isMobile ? layoutCfg.emoji : `${layoutCfg.emoji} ${layoutCfg.label}`}
          </Button>
        </Dropdown>

        {/* Export — icon only on mobile */}
        <Dropdown menu={exportMenu} trigger={['click']}>
          <Button size="small" icon={<DownloadOutlined />}>{!isMobile && 'Export'}</Button>
        </Dropdown>

        {/* Fullscreen toggle — desktop only */}
        {!isMobile && user?.role !== 'cashier' && (
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen POS mode'}>
            <Button
              size="small"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
              type={isFullscreen ? 'primary' : 'default'}
              style={isFullscreen ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none',
              } : {}}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN GRID
  // ─────────────────────────────────────────────────────────────────────────
  const mobileTabItems = [
    {
      key: 'products',
      label: <span><AppstoreOutlined /> Products ({filtered.length})</span>,
      children: productsPanel,
    },
    {
      key: 'cart',
      label: (
        <span>
          <ShoppingCartOutlined /> Cart
          {totalItems > 0 && (
            <Badge count={totalItems} size="small" style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
      children: cartPanel,
    },
    ...(posMode === '3panel' ? [{
      key: 'bills',
      label: <span><FileTextOutlined /> Bills</span>,
      children: billsPanel,
    }] : []),
  ];

  const mainGrid = isMobile ? (
    <Tabs
      items={mobileTabItems}
      size="small"
      style={{ flex: 1 }}
      tabBarStyle={{ marginBottom: 8 }}
    />
  ) : (
    <Row gutter={[10, 10]} style={{ flex: 1, minHeight: 0 }}>
      <Col {...prodCols} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {productsPanel}
      </Col>
      <Col {...cartCols} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {cartPanel}
      </Col>
      {posMode === '3panel' && (
        <Col xs={24} lg={6} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {billsPanel}
        </Col>
      )}
    </Row>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENT MODAL
  // ─────────────────────────────────────────────────────────────────────────
  const paymentModalEl = (
    <Modal open={paymentModal} onCancel={() => { if (!orderSuccess) setPaymentModal(false); }}
      footer={null} title={null} width={440} style={{ maxWidth: '95vw' }} centered closable={!orderSuccess}>
      {orderSuccess ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#f6ffed',
            border: '3px solid #52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <CheckCircleOutlined style={{ fontSize: 36, color: '#52c41a' }} />
          </div>
          <Title level={4} style={{ color: '#52c41a', margin: '0 0 4px' }}>Payment Successful!</Title>
          <Text type="secondary">Order {currentOrderNum} · ${grandTotal.toFixed(2)} paid</Text>

          {paymentMethod === 'cash' && change > 0 && (
            <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '8px 14px', margin: '10px 0' }}>
              <Text>Change: </Text>
              <Text strong style={{ color: '#52c41a', fontSize: 18 }}>${change.toFixed(2)}</Text>
            </div>
          )}

          {/* Loyalty summary */}
          {customerAccount && (
            <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 10, padding: '10px 14px', margin: '10px 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{customerTierInfo?.emoji}</span>
                <div>
                  <Text strong style={{ fontSize: 12 }}>{customerName}</Text>
                  <Tag style={{ marginLeft: 6, fontSize: 10, background: `${customerTierInfo?.color}20`, color: customerTierInfo?.color, border: `1px solid ${customerTierInfo?.color}40` }}>
                    {customerTierInfo?.name}
                  </Tag>
                </div>
              </div>
              {earnedPts > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 12 }}>Points earned</Text>
                  <Text strong style={{ fontSize: 12, color: '#52c41a' }}>+{earnedPts} pts</Text>
                </div>
              )}
              {redeemPts > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 12 }}>Points redeemed</Text>
                  <Text style={{ fontSize: 12, color: '#fa8c16' }}>-{redeemPts} pts</Text>
                </div>
              )}
              {walletUsed > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 12 }}>Wallet used</Text>
                  <Text style={{ fontSize: 12, color: '#667eea' }}>-${walletUsed.toFixed(2)}</Text>
                </div>
              )}
              <Divider style={{ margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>New points balance</Text>
                <Text strong style={{ fontSize: 11, color: '#d4a017' }}>
                  {(customerAccount.points + earnedPts - redeemPts).toLocaleString()} pts
                </Text>
              </div>
              {/* Tier progress to next tier */}
              {(() => {
                const sorted = [...tiers].sort((a, b) => a.minSpend - b.minSpend);
                const currIdx = sorted.findIndex((t) => t.id === customerAccount.tierId);
                const next = currIdx < sorted.length - 1 ? sorted[currIdx + 1] : null;
                if (!next) return <Text style={{ fontSize: 10, color: '#764ba2' }}>💎 Max tier reached!</Text>;
                const remaining = Math.max(0, next.minSpend - customerAccount.lifetimeSpend - grandTotal);
                return <Text type="secondary" style={{ fontSize: 10 }}>
                  ${remaining.toFixed(0)} more to reach {next.emoji} {next.name}
                </Text>;
              })()}
            </div>
          )}

          <div style={{ background: token.colorFillQuaternary, borderRadius: 8, padding: 10, margin: '8px 0', textAlign: 'left' }}>
            {cart.slice(0, 3).map((item) => (
              <Text key={item.product.id} style={{ fontSize: 12, display: 'block' }}>
                {item.product.name} × {item.quantity}
              </Text>
            ))}
            {cart.length > 3 && <Text type="secondary" style={{ fontSize: 11 }}>…and {cart.length - 3} more</Text>}
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block icon={<PrinterOutlined />} onClick={handleDownloadReceipt} style={{ borderRadius: 8 }}>
              Download Receipt PDF
            </Button>
            <Button type="primary" block size="large" onClick={handleNewOrder} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none', borderRadius: 8, height: 44, fontWeight: 600,
            }}>
              New Order
            </Button>
          </Space>
        </div>
      ) : (
        <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: 2 }}>
          <Title level={4} style={{ margin: '0 0 12px' }}>Process Payment</Title>

          {/* ── Member panel ── */}
          {customerAccount && customerTierInfo && (
            <div style={{ background: token.colorFillQuaternary, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Avatar size={28} style={{ background: customerTierInfo.gradient, fontSize: 12, flexShrink: 0 }}>
                  {customerName[0]}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 12, display: 'block' }}>{customerName}</Text>
                  <Tag style={{ fontSize: 10, fontWeight: 600, background: `${customerTierInfo.color}20`, color: customerTierInfo.color, border: `1px solid ${customerTierInfo.color}40` }}>
                    {customerTierInfo.emoji} {customerTierInfo.name}
                  </Tag>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Text style={{ fontSize: 11, color: '#d4a017', fontWeight: 600, display: 'block' }}>
                    <StarOutlined /> {customerAccount.points.toLocaleString()} pts
                  </Text>
                  <Text style={{ fontSize: 11, color: '#667eea', fontWeight: 600 }}>
                    <WalletOutlined /> ${customerAccount.walletBalance.toFixed(2)}
                  </Text>
                </div>
              </div>

              {/* Points redemption */}
              {customerAccount.points >= 100 && (
                <div style={{ marginBottom: 8, padding: '8px 10px', background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#d4a017' }}>
                      <StarOutlined /> Redeem Points (100 pts = $1)
                    </Text>
                    {redeemPts > 0 && (
                      <Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 700 }}>-${pointsDiscount.toFixed(2)}</Text>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <InputNumber
                      value={redeemPts} min={0} max={maxRedeemPts} step={100}
                      onChange={(v) => setRedeemPts(Math.floor((v ?? 0) / 100) * 100)}
                      style={{ flex: 1 }} size="small"
                      formatter={(v) => `${v} pts`}
                      parser={(v) => Number(v?.replace(' pts', '') ?? 0)}
                    />
                    <Button size="small" onClick={() => setRedeemPts(maxRedeemPts)} style={{ borderRadius: 6 }}>
                      Max ({maxRedeemPts})
                    </Button>
                    {redeemPts > 0 && <Button size="small" onClick={() => setRedeemPts(0)} danger style={{ borderRadius: 6 }}>Clear</Button>}
                  </div>
                </div>
              )}

              {/* Wallet usage */}
              {customerAccount.walletBalance > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f0f5ff', borderRadius: 8, border: '1px solid #adc6ff' }}>
                  <div>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: '#667eea' }}>
                      <WalletOutlined /> Use Wallet Balance
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                      Available: ${customerAccount.walletBalance.toFixed(2)}
                      {useWallet && walletUsed > 0 && <Text style={{ color: '#52c41a', marginLeft: 6 }}>→ using ${walletUsed.toFixed(2)}</Text>}
                    </Text>
                  </div>
                  <Switch checked={useWallet} onChange={setUseWallet} size="small" />
                </div>
              )}
            </div>
          )}

          {/* ── Voucher input ── */}
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ display: 'block', marginBottom: 7, fontSize: 13 }}>
              <TagOutlined /> Voucher Code
            </Text>
            {appliedVoucher ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <GiftOutlined style={{ color: '#52c41a' }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 12, color: '#52c41a' }}>{appliedVoucher.code}</Text>
                  <Text style={{ fontSize: 11, marginLeft: 8 }}>{appliedVoucher.name}</Text>
                  <Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 700, display: 'block' }}>
                    -{appliedVoucher.type === 'percentage' ? `${appliedVoucher.value}%` : `$${appliedVoucher.value}`} off
                    {appliedVoucher.maxDiscount ? ` (max $${appliedVoucher.maxDiscount})` : ''} = -$${voucherDiscount.toFixed(2)}
                  </Text>
                </div>
                <Button type="text" size="small" danger icon={<CloseCircleOutlined />}
                  onClick={() => { setAppliedVoucher(null); setVoucherCode(''); setVoucherError(''); }} />
              </div>
            ) : (
              <div>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Enter voucher code..."
                    value={voucherCode} onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                    onPressEnter={applyVoucher}
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                    status={voucherError ? 'error' : undefined}
                  />
                  <Button onClick={applyVoucher} style={{ background: '#667eea', color: 'white', border: 'none' }}>Apply</Button>
                </Space.Compact>
                {voucherError && <Text type="danger" style={{ fontSize: 11 }}>{voucherError}</Text>}
              </div>
            )}
          </div>

          {/* ── Totals ── */}
          <div style={{ background: token.colorFillQuaternary, borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            {[
              [`Items (${totalItems})`, `$${subtotal.toFixed(2)}`, false],
              ...(discountAmt > 0 ? [[`Discount (${discount}%)`, `-$${discountAmt.toFixed(2)}`, true]] : []),
              ['Tax (10%)', `$${tax.toFixed(2)}`, false],
              ...(voucherDiscount > 0 ? [[`Voucher (${appliedVoucher?.code})`, `-$${voucherDiscount.toFixed(2)}`, true]] : []),
              ...(pointsDiscount > 0 ? [[`Points (${redeemPts} pts)`, `-$${pointsDiscount.toFixed(2)}`, true]] : []),
              ...(walletUsed > 0 ? [[`Wallet`, `-$${walletUsed.toFixed(2)}`, true]] : []),
            ].map(([l, v, isDiscount]) => (
              <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{l}</Text>
                <Text style={{ fontSize: 12, color: isDiscount ? '#52c41a' : undefined }}>{v}</Text>
              </div>
            ))}
            <Divider style={{ margin: '7px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 14 }}>Grand Total</Text>
              <Text strong style={{ fontSize: 22, color: '#667eea' }}>${grandTotal.toFixed(2)}</Text>
            </div>
            {customerAccount && customerTierInfo && (
              <Text type="secondary" style={{ fontSize: 10, display: 'block', textAlign: 'right', marginTop: 2 }}>
                ~{Math.floor(grandTotal * customerTierInfo.pointsMultiplier)} pts to earn after payment
              </Text>
            )}
          </div>

          {/* ── Payment Method ── */}
          <Text strong style={{ display: 'block', marginBottom: 10 }}>Payment Method</Text>
          <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%', marginBottom: 14 }}>
            <Row gutter={8}>
              {[
                { value: 'card', icon: <CreditCardOutlined style={{ fontSize: 20 }} />, label: 'Card' },
                { value: 'cash', icon: <DollarOutlined style={{ fontSize: 20 }} />, label: 'Cash' },
                { value: 'digital', icon: <MobileOutlined style={{ fontSize: 20 }} />, label: 'Digital' },
              ].map((m) => (
                <Col span={8} key={m.value}>
                  <Radio.Button value={m.value} style={{
                    width: '100%', textAlign: 'center', borderRadius: 8, height: 68,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Space direction="vertical" size={1}>{m.icon}<Text style={{ fontSize: 10 }}>{m.label}</Text></Space>
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>

          {paymentMethod === 'cash' && (
            <div style={{ marginBottom: 14 }}>
              <Text strong style={{ display: 'block', marginBottom: 7 }}>Cash Tendered</Text>
              <InputNumber prefix="$" value={cashTendered} onChange={(v) => setCashTendered(v ?? 0)}
                style={{ width: '100%' }} size="large" min={0} precision={2} />
              <Space style={{ marginTop: 7, flexWrap: 'wrap' }}>
                {[Math.ceil(grandTotal), Math.ceil(grandTotal / 5) * 5 + 5, Math.ceil(grandTotal / 10) * 10 + 10, 100].map((a) => (
                  <Button key={a} size="small" onClick={() => setCashTendered(a)} style={{ borderRadius: 6 }}>${a}</Button>
                ))}
              </Space>
              {cashTendered >= grandTotal && (
                <div style={{ marginTop: 8, padding: '6px 10px', background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                  <Text>Change: </Text>
                  <Text strong style={{ color: '#52c41a', fontSize: 15 }}>${change.toFixed(2)}</Text>
                </div>
              )}
            </div>
          )}

          <Button type="primary" block size="large" icon={<CheckCircleOutlined />}
            onClick={handlePayment}
            disabled={paymentMethod === 'cash' && cashTendered < grandTotal}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none', borderRadius: 8, height: 46, fontWeight: 600,
            }}>
            Confirm Payment — ${grandTotal.toFixed(2)}
          </Button>
        </div>
      )}
    </Modal>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // BILL DETAIL MODAL
  // ─────────────────────────────────────────────────────────────────────────
  const billDetailModalEl = (
    <Modal open={billDetailModal} onCancel={() => setBillDetailModal(false)}
      footer={[
        <Button key="close" type="primary" onClick={() => setBillDetailModal(false)}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
          Close
        </Button>,
      ]}
      title={
        <Space>
          <Text strong>Bill Detail</Text>
          {selectedBill && <Tag color={BILL_STATUS[selectedBill.status]}>{selectedBill.status.toUpperCase()}</Tag>}
        </Space>
      }
      width={440} style={{ maxWidth: '95vw' }} centered>
      {selectedBill && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <Text strong style={{ color: '#667eea' }}>{selectedBill.orderNumber}</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                {new Date(selectedBill.createdAt).toLocaleString()}
              </Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>${selectedBill.total.toFixed(2)}</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                {selectedBill.paymentMethod} · {selectedBill.cashier}
              </Text>
            </div>
          </div>
          <List
            dataSource={selectedBill.items}
            renderItem={(item) => (
              <List.Item style={{ padding: '6px 0' }}>
                <List.Item.Meta
                  avatar={<Avatar src={item.product.image} shape="square" size={36} style={{ borderRadius: 6 }} />}
                  title={<Text style={{ fontSize: 12 }}>{item.product.name}</Text>}
                  description={<Text type="secondary" style={{ fontSize: 10 }}>×{item.quantity} @ ${item.product.price.toFixed(2)}</Text>}
                />
                <Text strong style={{ fontSize: 12 }}>${(item.product.price * item.quantity).toFixed(2)}</Text>
              </List.Item>
            )}
          />
          <div style={{ background: token.colorFillQuaternary, borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
            {[['Subtotal', `$${selectedBill.subtotal.toFixed(2)}`], ['Tax', `$${selectedBill.tax.toFixed(2)}`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{l}</Text>
                <Text style={{ fontSize: 12 }}>{v}</Text>
              </div>
            ))}
            <Divider style={{ margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total</Text>
              <Text strong style={{ color: '#667eea', fontSize: 15 }}>${selectedBill.total.toFixed(2)}</Text>
            </div>
          </div>
        </>
      )}
    </Modal>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FULLSCREEN OVERLAY (for admin/superadmin)
  // ─────────────────────────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: token.colorBgLayout,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Mini top bar */}
          <div style={{
            height: 52, flexShrink: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px',
          }}>
            <Space size={10}>
              <ShoppingCartOutlined style={{ color: 'white', fontSize: 18 }} />
              <Text style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>SwiftPOS</Text>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 10, borderRadius: 10, margin: 0 }}>
                POS Mode
              </Tag>
            </Space>
            <Space size={6}>
              <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }} />
              <Text style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
                {fsTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                {fsTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            </Space>
            <Space size={10}>
              <Avatar style={{ background: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Avatar>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{user?.name}</Text>
              <Button size="small" icon={<FullscreenExitOutlined />} onClick={() => setIsFullscreen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 8 }}>
                Exit Fullscreen
              </Button>
            </Space>
          </div>

          {/* POS content */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '12px 16px 14px', display: 'flex', flexDirection: 'column' }}>
            {headerRow}
            {mainGrid}
          </div>
        </div>
        {paymentModalEl}
        {billDetailModalEl}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NORMAL / CASHIER-SHELL MODE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={isMobile
        ? { display: 'flex', flexDirection: 'column', flex: 1 }
        : { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }
      }>
        {headerRow}
        {mainGrid}
      </div>
      {paymentModalEl}
      {billDetailModalEl}
    </>
  );
}
