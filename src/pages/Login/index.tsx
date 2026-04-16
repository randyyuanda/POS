import { useState } from 'react';
import {
  Form, Input, Button, Typography, Tabs, message, Select, Grid,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, ShoppingCartOutlined,
  GlobalOutlined, SunOutlined, MoonOutlined,
} from '@ant-design/icons';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { useLang, type Lang } from '../../contexts/LangContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesia' },
  { value: 'zh', label: '中文' },
];

const DEMO_ACCOUNTS = [
  { email: 'superadmin@admin.com', password: 'superadmin123', role: 'Super Admin' },
  { email: 'admin@admin.com',      password: 'admin123',      role: 'Admin' },
];

export default function Login() {
  const { login, register } = useAuth();
  const { t, lang, setLang } = useLang();
  const { themeMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isDark = themeMode === 'dark';
  const isMobile = !screens.md;

  const bgCard  = isDark ? '#1f1f1f' : '#ffffff';
  const bgPage  = isDark ? '#141414' : '#f0f2f5';
  const textColor    = isDark ? '#fff' : '#1a1a2e';
  const subTextColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
  const hintBg  = isDark ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.06)';

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(values.email, values.password);
    setLoading(false);
    if (result.success) {
      message.success('Welcome back!');
      navigate('/dashboard');
    } else {
      message.error(result.message || 'Login failed');
    }
  };

  const handleRegister = async (values: { name: string; email: string; password: string; role: UserRole }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = register(values.name, values.email, values.password, values.role);
    setLoading(false);
    if (result.success) {
      message.success('Account created!');
      navigate('/dashboard');
    } else {
      message.error(result.message || 'Registration failed');
    }
  };

  const fillDemo = (email: string, password: string) => {
    loginForm.setFieldsValue({ email, password });
  };

  // ── Shared form submit button ──────────────────────────────────────────────
  const submitBtn = (label: string) => (
    <Form.Item style={{ marginBottom: 12 }}>
      <Button
        type="primary" htmlType="submit" loading={loading} block
        style={{
          height: 46, borderRadius: 10,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none', fontWeight: 700, fontSize: 15,
        }}
      >
        {label}
      </Button>
    </Form.Item>
  );

  // ── Brand panel (shown on desktop as left column) ─────────────────────────
  const brandPanel = (
    <div style={{
      flex: '0 0 380px',
      background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
      padding: '56px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      color: 'white',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingCartOutlined style={{ fontSize: 22, color: 'white' }} />
          </div>
          <Text style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>SwiftPOS</Text>
        </div>

        <Title level={2} style={{ color: 'white', margin: '0 0 12px', fontWeight: 700 }}>
          {t('auth.signInTo')} SwiftPOS
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.6 }}>
          {t('auth.loginSubtitle')}
        </Text>
      </div>

      <div>
        {[
          { icon: '⚡', text: 'Fast & reliable transactions' },
          { icon: '📊', text: 'Real-time sales analytics' },
          { icon: '🔒', text: 'Secure role-based access' },
        ].map((item) => (
          <div key={item.text} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 16, opacity: 0.9,
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{item.text}</Text>
          </div>
        ))}
      </div>

      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
        {t('auth.brandTagline')}
      </Text>
    </div>
  );

  // ── Mobile brand header (compact) ─────────────────────────────────────────
  const mobileBrandHeader = (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '28px 24px 24px',
      textAlign: 'center',
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShoppingCartOutlined style={{ fontSize: 18, color: 'white' }} />
        </div>
        <Text style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>SwiftPOS</Text>
      </div>
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, display: 'block' }}>
        {t('auth.loginSubtitle')}
      </Text>
    </div>
  );

  // ── Login tab content ──────────────────────────────────────────────────────
  const loginContent = (
    <div>
      {!isMobile && (
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, color: textColor }}>{t('auth.welcome')}</Title>
          <Text style={{ color: subTextColor, fontSize: 13 }}>{t('auth.welcomeSub')}</Text>
        </div>
      )}

      <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large" requiredMark={false}>
        <Form.Item
          name="email"
          label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.email')}</span>}
          rules={[
            { required: true, message: t('auth.emailRequired') },
            { type: 'email', message: t('auth.emailInvalid'), warningOnly: true },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#667eea' }} />}
            placeholder="superadmin@admin.com"
            style={{ borderRadius: 10 }}
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.password')}</span>}
          rules={[{ required: true, message: t('auth.passwordRequired') }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#667eea' }} />}
            placeholder="••••••••"
            style={{ borderRadius: 10 }}
            autoComplete="current-password"
          />
        </Form.Item>

        {submitBtn(t('auth.loginBtn'))}
      </Form>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Text style={{ color: subTextColor, fontSize: 13 }}>{t('auth.noAccount')}{' '}</Text>
        <Button type="link" style={{ padding: 0, fontWeight: 600, fontSize: 13 }} onClick={() => setTab('register')}>
          {t('auth.register')}
        </Button>
      </div>

      {/* Demo accounts hint */}
      <div style={{
        marginTop: 20, padding: '12px 14px',
        background: hintBg, borderRadius: 10,
        border: '1px solid rgba(102,126,234,0.2)',
      }}>
        <Text style={{ fontSize: 11, color: subTextColor, display: 'block', marginBottom: 8, fontWeight: 600, letterSpacing: 0.3 }}>
          DEMO ACCOUNTS — click to fill
        </Text>
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            onClick={() => fillDemo(a.email, a.password)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', padding: '6px 8px', marginBottom: 4,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(102,126,234,0.06)',
              border: '1px solid rgba(102,126,234,0.15)', borderRadius: 7,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#667eea', display: 'block' }}>{a.role}</Text>
              <Text style={{ fontSize: 11, color: subTextColor }}>{a.email}</Text>
            </div>
            <Text style={{ fontSize: 10, color: subTextColor }}>pw: {a.password}</Text>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Register tab content ───────────────────────────────────────────────────
  const registerContent = (
    <div>
      {!isMobile && (
        <div style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0, color: textColor }}>{t('auth.createAccount')}</Title>
          <Text style={{ color: subTextColor, fontSize: 13 }}>{t('auth.createSub')}</Text>
        </div>
      )}

      <Form
        form={registerForm} layout="vertical" onFinish={handleRegister}
        size="large" requiredMark={false} initialValues={{ role: 'cashier' }}
      >
        <Form.Item
          name="name"
          label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.name')}</span>}
          rules={[{ required: true, message: t('auth.nameRequired') }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#667eea' }} />}
            placeholder="John Doe"
            style={{ borderRadius: 10 }}
            autoComplete="name"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.email')}</span>}
          rules={[
            { required: true, message: t('auth.emailRequired') },
            { type: 'email', message: t('auth.emailInvalid') },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#667eea' }} />}
            placeholder="john@example.com"
            style={{ borderRadius: 10 }}
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.password')}</span>}
          rules={[
            { required: true, message: t('auth.passwordRequired') },
            { min: 6, message: t('auth.passwordMin') },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#667eea' }} />}
            placeholder="••••••••"
            style={{ borderRadius: 10 }}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.role')}</span>}
        >
          <Select
            style={{ borderRadius: 10 }}
            options={[
              { value: 'cashier', label: t('role.cashier') },
              { value: 'admin', label: t('role.admin') },
            ]}
          />
        </Form.Item>

        {submitBtn(t('auth.registerBtn'))}
      </Form>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Text style={{ color: subTextColor, fontSize: 13 }}>{t('auth.hasAccount')}{' '}</Text>
        <Button type="link" style={{ padding: 0, fontWeight: 600, fontSize: 13 }} onClick={() => setTab('login')}>
          {t('auth.login')}
        </Button>
      </div>
    </div>
  );

  // ── Top-right controls ─────────────────────────────────────────────────────
  const topControls = (
    <div style={{
      position: 'fixed', top: 14, right: 16,
      display: 'flex', alignItems: 'center', gap: 8, zIndex: 10,
    }}>
      <Select
        value={lang} onChange={(v) => setLang(v as Lang)}
        size="small" style={{ width: isMobile ? 80 : 110 }}
        suffixIcon={<GlobalOutlined />}
        options={isMobile
          ? [{ value: 'en', label: 'EN' }, { value: 'id', label: 'ID' }, { value: 'zh', label: '中文' }]
          : LANG_OPTIONS}
      />
      <Button
        size="small" onClick={toggleTheme}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        style={{
          background: isDark ? '#333' : '#eee',
          border: 'none', color: isDark ? '#fff' : '#333',
          borderRadius: 6,
        }}
      >
        {!isMobile && (isDark ? 'Light' : 'Dark')}
      </Button>
    </div>
  );

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: bgPage, display: 'flex', flexDirection: 'column' }}>
        {topControls}
        {mobileBrandHeader}

        <div style={{ flex: 1, padding: '20px 16px 32px', background: bgCard }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: isDark ? '#2a2a2a' : '#f4f4f8',
            borderRadius: 12, padding: 4, marginBottom: 20,
          }}>
            {(['login', 'register'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontSize: 14,
                  transition: 'all 0.2s',
                  background: tab === k
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'transparent',
                  color: tab === k ? 'white' : subTextColor,
                }}
              >
                {k === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          {/* Form title */}
          <div style={{ marginBottom: 20 }}>
            <Title level={4} style={{ margin: '0 0 4px', color: textColor }}>
              {tab === 'login' ? t('auth.welcome') : t('auth.createAccount')}
            </Title>
            <Text style={{ color: subTextColor, fontSize: 13 }}>
              {tab === 'login' ? t('auth.welcomeSub') : t('auth.createSub')}
            </Text>
          </div>

          {tab === 'login' ? loginContent : registerContent}
        </div>
      </div>
    );
  }

  // ── DESKTOP layout ─────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: bgPage,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative',
    }}>
      {topControls}

      <div style={{
        width: '100%', maxWidth: 920,
        display: 'flex', borderRadius: 20, overflow: 'hidden',
        boxShadow: isDark
          ? '0 24px 60px rgba(0,0,0,0.5)'
          : '0 24px 60px rgba(102,126,234,0.18)',
      }}>
        {brandPanel}

        {/* Right form panel */}
        <div style={{
          flex: 1, background: bgCard,
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as 'login' | 'register')}
            size="large"
            style={{ marginBottom: 4 }}
            items={[
              {
                key: 'login',
                label: <span style={{ fontWeight: 600, fontSize: 15 }}>{t('auth.login')}</span>,
                children: loginContent,
              },
              {
                key: 'register',
                label: <span style={{ fontWeight: 600, fontSize: 15 }}>{t('auth.register')}</span>,
                children: registerContent,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
