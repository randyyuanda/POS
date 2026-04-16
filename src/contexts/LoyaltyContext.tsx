import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  initialVouchers, initialLoyaltyAccounts, initialPointsTransactions, MEMBERSHIP_TIERS,
} from '../data/mockData';
import type { Voucher, LoyaltyAccount, PointsTransaction, MembershipTier } from '../types';

interface LoyaltyContextValue {
  vouchers: Voucher[];
  accounts: LoyaltyAccount[];
  transactions: PointsTransaction[];
  tiers: MembershipTier[];

  // Voucher CRUD
  addVoucher: (v: Omit<Voucher, 'id' | 'usedCount'>) => void;
  updateVoucher: (id: string, updates: Partial<Voucher>) => void;
  deleteVoucher: (id: string) => void;
  incrementVoucherUsage: (id: string) => void;

  // Tier config
  updateTier: (id: string, updates: Partial<MembershipTier>) => void;

  // Loyalty account actions
  earnPoints: (customerId: string, customerName: string, spendAmount: number, orderId: string) => number;
  redeemPoints: (customerId: string, customerName: string, points: number, orderId: string) => void;
  deductWallet: (customerId: string, amount: number, orderId: string) => void;
  topUpWallet: (customerId: string, amount: number) => void;
  adjustPoints: (customerId: string, customerName: string, delta: number, reason: string) => void;
  forceSetTier: (customerId: string, tierId: string) => void;
}

const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>(initialLoyaltyAccounts);
  const [transactions, setTransactions] = useState<PointsTransaction[]>(initialPointsTransactions);
  const [tiers, setTiers] = useState<MembershipTier[]>(MEMBERSHIP_TIERS);

  // ── Helper: compute tier from lifetime spend ────────────────────────────────
  const computeTierId = (lifetimeSpend: number): string => {
    const sorted = [...tiers].sort((a, b) => b.minSpend - a.minSpend);
    return sorted.find((t) => lifetimeSpend >= t.minSpend)?.id ?? 'bronze';
  };

  // ── Vouchers ────────────────────────────────────────────────────────────────
  const addVoucher = (v: Omit<Voucher, 'id' | 'usedCount'>) => {
    setVouchers((prev) => [...prev, { ...v, id: `v-${Date.now()}`, usedCount: 0 }]);
  };

  const updateVoucher = (id: string, updates: Partial<Voucher>) => {
    setVouchers((prev) => prev.map((v) => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVoucher = (id: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== id));
  };

  const incrementVoucherUsage = (id: string) => {
    setVouchers((prev) => prev.map((v) => v.id === id ? { ...v, usedCount: v.usedCount + 1 } : v));
  };

  // ── Tier config ─────────────────────────────────────────────────────────────
  const updateTier = (id: string, updates: Partial<MembershipTier>) => {
    setTiers((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
  };

  // ── Points & Wallet ─────────────────────────────────────────────────────────
  const earnPoints = (customerId: string, customerName: string, spendAmount: number, orderId: string): number => {
    let earned = 0;
    setAccounts((prev) => prev.map((a) => {
      if (a.customerId !== customerId) return a;
      const tier = tiers.find((t) => t.id === a.tierId);
      const multiplier = tier?.pointsMultiplier ?? 1;
      earned = Math.floor(spendAmount * multiplier);
      const newPoints = a.points + earned;
      const newLifetimePoints = a.lifetimePoints + earned;
      const newLifetimeSpend = a.lifetimeSpend + spendAmount;
      const newTierId = computeTierId(newLifetimeSpend);
      return { ...a, points: newPoints, lifetimePoints: newLifetimePoints, lifetimeSpend: newLifetimeSpend, tierId: newTierId, lastActivity: new Date().toISOString() };
    }));
    if (earned > 0) {
      const account = accounts.find((a) => a.customerId === customerId);
      const tier = tiers.find((t) => t.id === account?.tierId);
      setTransactions((prev) => [{
        id: `pt-${Date.now()}`,
        customerId, customerName,
        type: 'earned', points: earned,
        description: `Order ${orderId} — $${spendAmount.toFixed(2)} (${tier?.pointsMultiplier ?? 1}× multiplier)`,
        orderId, balance: (account?.points ?? 0) + earned,
        createdAt: new Date().toISOString(),
      }, ...prev]);
    }
    return earned;
  };

  const redeemPoints = (customerId: string, customerName: string, points: number, orderId: string) => {
    setAccounts((prev) => prev.map((a) =>
      a.customerId === customerId
        ? { ...a, points: Math.max(0, a.points - points), lastActivity: new Date().toISOString() }
        : a
    ));
    const account = accounts.find((a) => a.customerId === customerId);
    setTransactions((prev) => [{
      id: `pt-${Date.now()}`,
      customerId, customerName,
      type: 'redeemed', points: -points,
      description: `Redeemed ${points} pts → $${(points / 100).toFixed(2)} discount on ${orderId}`,
      orderId, balance: Math.max(0, (account?.points ?? 0) - points),
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const deductWallet = (customerId: string, amount: number, orderId: string) => {
    setAccounts((prev) => prev.map((a) =>
      a.customerId === customerId
        ? { ...a, walletBalance: Math.max(0, a.walletBalance - amount), lastActivity: new Date().toISOString() }
        : a
    ));
    const account = accounts.find((a) => a.customerId === customerId);
    const customerName = account ? '' : '';
    setTransactions((prev) => [{
      id: `pt-${Date.now()}`,
      customerId, customerName: customerName,
      type: 'redeemed', points: 0, walletAmount: -amount,
      description: `Wallet used — $${amount.toFixed(2)} on order ${orderId}`,
      orderId, balance: account?.points ?? 0,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const topUpWallet = (customerId: string, amount: number) => {
    setAccounts((prev) => prev.map((a) =>
      a.customerId === customerId
        ? { ...a, walletBalance: a.walletBalance + amount, lastActivity: new Date().toISOString() }
        : a
    ));
    const account = accounts.find((a) => a.customerId === customerId);
    setTransactions((prev) => [{
      id: `pt-${Date.now()}`,
      customerId, customerName: '',
      type: 'topup', points: 0, walletAmount: amount,
      description: `Wallet top-up — $${amount.toFixed(2)}`,
      balance: account?.points ?? 0,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const adjustPoints = (customerId: string, customerName: string, delta: number, reason: string) => {
    setAccounts((prev) => prev.map((a) =>
      a.customerId === customerId
        ? { ...a, points: Math.max(0, a.points + delta), lifetimePoints: delta > 0 ? a.lifetimePoints + delta : a.lifetimePoints, lastActivity: new Date().toISOString() }
        : a
    ));
    const account = accounts.find((a) => a.customerId === customerId);
    setTransactions((prev) => [{
      id: `pt-${Date.now()}`,
      customerId, customerName,
      type: 'adjusted', points: delta,
      description: reason, balance: Math.max(0, (account?.points ?? 0) + delta),
      createdAt: new Date().toISOString(),
    }, ...prev]);
  };

  const forceSetTier = (customerId: string, tierId: string) => {
    setAccounts((prev) => prev.map((a) =>
      a.customerId === customerId ? { ...a, tierId } : a
    ));
  };

  return (
    <LoyaltyContext.Provider value={{
      vouchers, accounts, transactions, tiers,
      addVoucher, updateVoucher, deleteVoucher, incrementVoucherUsage,
      updateTier,
      earnPoints, redeemPoints, deductWallet, topUpWallet, adjustPoints, forceSetTier,
    }}>
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyalty must be used inside LoyaltyProvider');
  return ctx;
}
