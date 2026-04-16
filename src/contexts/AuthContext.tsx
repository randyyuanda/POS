import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message?: string };
  register: (name: string, email: string, password: string, role?: UserRole) => { success: boolean; message?: string };
  logout: () => void;
}

const STORAGE_KEY = 'swiftpos_users';
const SESSION_KEY = 'swiftpos_session';

const DEFAULT_USERS: StoredUser[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@admin.com',
    password: 'superadmin123',
    role: 'superadmin',
  },
  {
    id: '2',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin123',
    role: 'admin',
  },
];

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function initUsers() {
  // Migrate old email format (without .com) to new format
  const EMAIL_MIGRATIONS: Record<string, string> = {
    'superadmin@admin': 'superadmin@admin.com',
    'admin@admin': 'admin@admin.com',
  };
  let stored = getStoredUsers();
  let migrated = false;
  stored = stored.map((u) => {
    if (EMAIL_MIGRATIONS[u.email]) {
      migrated = true;
      return { ...u, email: EMAIL_MIGRATIONS[u.email] };
    }
    return u;
  });
  if (migrated) saveUsers(stored);

  const existingEmails = stored.map((u) => u.email);
  const toAdd = DEFAULT_USERS.filter((u) => !existingEmails.includes(u.email));
  if (toAdd.length > 0) {
    saveUsers([...stored, ...toAdd]);
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initUsers();
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = (email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return { success: false, message: 'Invalid email or password' };
    const { password: _, ...userData } = found;
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const register = (name: string, email: string, password: string, role: UserRole = 'cashier') => {
    const users = getStoredUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }
    const newUser: StoredUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
    };
    saveUsers([...users, newUser]);
    const { password: _, ...userData } = newUser;
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
