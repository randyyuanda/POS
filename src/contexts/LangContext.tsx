import React, { createContext, useContext, useState } from 'react';

export type Lang = 'en' | 'id' | 'zh';

type Translations = Record<string, string>;

const translations: Record<Lang, Translations> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.pos': 'Point of Sale',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.customers': 'Customers',
    'nav.reports': 'Reports',
    'nav.loyalty': 'Loyalty',
    'nav.settings': 'Settings',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.loginBtn': 'Sign In',
    'auth.registerBtn': 'Create Account',
    'auth.hasAccount': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    'auth.welcome': 'Welcome back',
    'auth.welcomeSub': 'Sign in to your SwiftPOS account',
    'auth.createAccount': 'Create Account',
    'auth.createSub': 'Join SwiftPOS and start selling',
    'auth.logout': 'Logout',
    'auth.profile': 'My Profile',
    'auth.emailRequired': 'Please enter your email',
    'auth.emailInvalid': 'Please enter a valid email',
    'auth.passwordRequired': 'Please enter your password',
    'auth.passwordMin': 'Password must be at least 6 characters',
    'auth.nameRequired': 'Please enter your name',
    'auth.role': 'Role',
    'auth.signInTo': 'Sign in to',
    'auth.loginSubtitle': 'Manage your store efficiently',
    'auth.brandTagline': 'The smart way to manage your business',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': "Welcome back! Here's what's happening today.",
    'dashboard.todayRevenue': "Today's Revenue",
    'dashboard.todayOrders': "Today's Orders",
    'dashboard.totalProducts': 'Total Products',
    'dashboard.totalCustomers': 'Total Customers',
    'dashboard.vsLastWeek': 'vs last week',
    'dashboard.weeklyRevenue': 'Weekly Revenue',
    'dashboard.salesByCategory': 'Sales by Category',
    'dashboard.orderTrend': 'Order Trend (7 Days)',
    'dashboard.topProducts': 'Top Products',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.viewAll': 'View All',
    'dashboard.order': 'Order',
    'dashboard.customer': 'Customer',
    'dashboard.items': 'Items',
    'dashboard.total': 'Total',
    'dashboard.payment': 'Payment',
    'dashboard.status': 'Status',
    'dashboard.time': 'Time',

    // Header
    'header.notifications': 'Notifications',
    'header.darkMode': 'Dark Mode',
    'header.lightMode': 'Light Mode',
    'header.language': 'Language',

    // Roles
    'role.superadmin': 'Super Admin',
    'role.admin': 'Admin',
    'role.cashier': 'Cashier',
  },

  id: {
    // Navigation
    'nav.dashboard': 'Dasbor',
    'nav.pos': 'Kasir',
    'nav.products': 'Produk',
    'nav.orders': 'Pesanan',
    'nav.customers': 'Pelanggan',
    'nav.reports': 'Laporan',
    'nav.loyalty': 'Loyalitas',
    'nav.settings': 'Pengaturan',

    // Auth
    'auth.login': 'Masuk',
    'auth.register': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.name': 'Nama Lengkap',
    'auth.loginBtn': 'Masuk',
    'auth.registerBtn': 'Buat Akun',
    'auth.hasAccount': 'Sudah punya akun?',
    'auth.noAccount': 'Belum punya akun?',
    'auth.welcome': 'Selamat datang kembali',
    'auth.welcomeSub': 'Masuk ke akun SwiftPOS Anda',
    'auth.createAccount': 'Buat Akun',
    'auth.createSub': 'Bergabung dengan SwiftPOS dan mulai berjualan',
    'auth.logout': 'Keluar',
    'auth.profile': 'Profil Saya',
    'auth.emailRequired': 'Masukkan email Anda',
    'auth.emailInvalid': 'Masukkan email yang valid',
    'auth.passwordRequired': 'Masukkan kata sandi Anda',
    'auth.passwordMin': 'Kata sandi minimal 6 karakter',
    'auth.nameRequired': 'Masukkan nama Anda',
    'auth.role': 'Peran',
    'auth.signInTo': 'Masuk ke',
    'auth.loginSubtitle': 'Kelola toko Anda dengan efisien',
    'auth.brandTagline': 'Cara cerdas mengelola bisnis Anda',

    // Dashboard
    'dashboard.title': 'Dasbor',
    'dashboard.subtitle': 'Selamat datang kembali! Ini yang terjadi hari ini.',
    'dashboard.todayRevenue': 'Pendapatan Hari Ini',
    'dashboard.todayOrders': 'Pesanan Hari Ini',
    'dashboard.totalProducts': 'Total Produk',
    'dashboard.totalCustomers': 'Total Pelanggan',
    'dashboard.vsLastWeek': 'vs minggu lalu',
    'dashboard.weeklyRevenue': 'Pendapatan Mingguan',
    'dashboard.salesByCategory': 'Penjualan per Kategori',
    'dashboard.orderTrend': 'Tren Pesanan (7 Hari)',
    'dashboard.topProducts': 'Produk Terlaris',
    'dashboard.recentOrders': 'Pesanan Terbaru',
    'dashboard.viewAll': 'Lihat Semua',
    'dashboard.order': 'Pesanan',
    'dashboard.customer': 'Pelanggan',
    'dashboard.items': 'Item',
    'dashboard.total': 'Total',
    'dashboard.payment': 'Pembayaran',
    'dashboard.status': 'Status',
    'dashboard.time': 'Waktu',

    // Header
    'header.notifications': 'Notifikasi',
    'header.darkMode': 'Mode Gelap',
    'header.lightMode': 'Mode Terang',
    'header.language': 'Bahasa',

    // Roles
    'role.superadmin': 'Super Admin',
    'role.admin': 'Admin',
    'role.cashier': 'Kasir',
  },

  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.pos': '销售终端',
    'nav.products': '产品',
    'nav.orders': '订单',
    'nav.customers': '客户',
    'nav.reports': '报告',
    'nav.loyalty': '忠诚度',
    'nav.settings': '设置',

    // Auth
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.name': '姓名',
    'auth.loginBtn': '登录',
    'auth.registerBtn': '创建账户',
    'auth.hasAccount': '已有账户？',
    'auth.noAccount': '没有账户？',
    'auth.welcome': '欢迎回来',
    'auth.welcomeSub': '登录您的 SwiftPOS 账户',
    'auth.createAccount': '创建账户',
    'auth.createSub': '加入 SwiftPOS，开始销售',
    'auth.logout': '退出',
    'auth.profile': '我的资料',
    'auth.emailRequired': '请输入邮箱',
    'auth.emailInvalid': '请输入有效邮箱',
    'auth.passwordRequired': '请输入密码',
    'auth.passwordMin': '密码至少6个字符',
    'auth.nameRequired': '请输入姓名',
    'auth.role': '角色',
    'auth.signInTo': '登录',
    'auth.loginSubtitle': '高效管理您的商店',
    'auth.brandTagline': '智能管理业务的方式',

    // Dashboard
    'dashboard.title': '仪表板',
    'dashboard.subtitle': '欢迎回来！以下是今天的情况。',
    'dashboard.todayRevenue': '今日收入',
    'dashboard.todayOrders': '今日订单',
    'dashboard.totalProducts': '产品总数',
    'dashboard.totalCustomers': '客户总数',
    'dashboard.vsLastWeek': '较上周',
    'dashboard.weeklyRevenue': '每周收入',
    'dashboard.salesByCategory': '按类别销售',
    'dashboard.orderTrend': '订单趋势（7天）',
    'dashboard.topProducts': '热销产品',
    'dashboard.recentOrders': '最近订单',
    'dashboard.viewAll': '查看全部',
    'dashboard.order': '订单',
    'dashboard.customer': '客户',
    'dashboard.items': '商品',
    'dashboard.total': '总计',
    'dashboard.payment': '支付方式',
    'dashboard.status': '状态',
    'dashboard.time': '时间',

    // Header
    'header.notifications': '通知',
    'header.darkMode': '深色模式',
    'header.lightMode': '浅色模式',
    'header.language': '语言',

    // Roles
    'role.superadmin': '超级管理员',
    'role.admin': '管理员',
    'role.cashier': '收银员',
  },
};

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('swiftpos_lang') as Lang) || 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('swiftpos_lang', l);
  };

  const t = (key: string): string => {
    return translations[lang][key] ?? translations['en'][key] ?? key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
