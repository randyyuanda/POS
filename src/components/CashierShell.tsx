import { useEffect, useState } from 'react';
import { Space, Typography, Button, Avatar, Tag, theme as antTheme } from 'antd';
import {
  ShoppingCartOutlined, LogoutOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang, type Lang } from '../contexts/LangContext';
import { useThemeMode } from '../contexts/ThemeContext';

const { Text } = Typography;

interface Props {
  children: React.ReactNode;
}

export default function CashierShell({ children }: Props) {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { themeMode, toggleTheme } = useThemeMode();
  const { token } = antTheme.useToken();
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const LANGS: { value: Lang; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'id', label: 'ID' },
    { value: 'zh', label: '中文' },
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: token.colorBgLayout,
    }}>
      {/* ── Top bar ─────────────────────────────────── */}
      <div style={{
        height: 56,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
      }}>
        {/* Left — brand */}
        <Space size={10}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingCartOutlined style={{ color: 'white', fontSize: 17 }} />
          </div>
          <Text style={{ color: 'white', fontWeight: 700, fontSize: 17, letterSpacing: 0.3 }}>
            SwiftPOS
          </Text>
          <Tag style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: 10,
            margin: 0,
            borderRadius: 10,
          }}>
            Cashier Mode
          </Tag>
        </Space>

        {/* Center — clock */}
        <div style={{ textAlign: 'center' }}>
          <Space size={6}>
            <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }} />
            <div>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, display: 'block' }}>
                {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
            </div>
          </Space>
        </div>

        {/* Right — controls + user */}
        <Space size={10}>
          {/* Lang picker */}
          <Space size={4}>
            {LANGS.map((l) => (
              <Button
                key={l.value}
                size="small"
                onClick={() => setLang(l.value)}
                style={{
                  height: 24, padding: '0 8px', fontSize: 11, borderRadius: 12,
                  background: lang === l.value ? 'rgba(255,255,255,0.3)' : 'transparent',
                  border: lang === l.value ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
                  color: 'white',
                }}
              >
                {l.label}
              </Button>
            ))}
          </Space>

          {/* Theme toggle */}
          <Button
            size="small"
            onClick={toggleTheme}
            style={{
              height: 24, padding: '0 10px', fontSize: 11, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
            }}
          >
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </Button>

          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />

          {/* User */}
          <Space size={8}>
            <Avatar
              size={32}
              style={{
                background: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? 'C'}
            </Avatar>
            <div style={{ lineHeight: 1.3 }}>
              <Text style={{ color: 'white', fontWeight: 600, fontSize: 13, display: 'block' }}>
                {user?.name ?? 'Cashier'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Cashier</Text>
            </div>
          </Space>

          <Button
            size="small"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              height: 30,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
            }}
          >
            Logout
          </Button>
        </Space>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px 16px',
      }}>
        {children}
      </div>
    </div>
  );
}
