import { useState } from 'react';
import {
  Form, Input, Button, Typography, Tabs, message, Select,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined, ShoppingCartOutlined, GlobalOutlined,
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

export default function Login() {
  const { login, register } = useAuth();
  const { t, lang, setLang } = useLang();
  const { themeMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isDark = themeMode === 'dark';

  const bgCard = isDark ? '#1f1f1f' : '#ffffff';
  const bgPage = isDark ? '#141414' : '#f0f2f5';
  const textColor = isDark ? '#fff' : '#1a1a2e';
  const subTextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

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

  const handleRegister = async (values: {
    name: string; email: string; password: string; role: UserRole;
  }) => {
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

  return (
    <div style={{
      minHeight: '100vh',
      background: bgPage,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
    }}>
      {/* Top-right controls */}
      <div style={{
        position: 'fixed',
        top: 16,
        right: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 10,
      }}>
        <Select
          value={lang}
          onChange={(v) => setLang(v as Lang)}
          size="small"
          style={{ width: 110 }}
          suffixIcon={<GlobalOutlined />}
          options={LANG_OPTIONS}
        />
        <Button
          size="small"
          onClick={toggleTheme}
          style={{
            background: isDark ? '#333' : '#eee',
            border: 'none',
            color: isDark ? '#fff' : '#333',
            borderRadius: 6,
            padding: '0 10px',
          }}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </Button>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 920,
        display: 'flex',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 24px 60px rgba(0,0,0,0.5)'
          : '0 24px 60px rgba(102,126,234,0.18)',
      }}>
        {/* Left brand panel */}
        <div style={{
          flex: '0 0 380px',
          background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
          padding: '56px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'white',
        }}
          className="login-brand-panel"
        >
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

        {/* Right form panel */}
        <div style={{
          flex: 1,
          background: bgCard,
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Tabs
            activeKey={tab}
            onChange={(k) => setTab(k as 'login' | 'register')}
            size="large"
            style={{ marginBottom: 8 }}
            items={[
              {
                key: 'login',
                label: <span style={{ fontWeight: 600, fontSize: 15 }}>{t('auth.login')}</span>,
                children: (
                  <div>
                    <div style={{ marginBottom: 28 }}>
                      <Title level={4} style={{ margin: 0, color: textColor }}>
                        {t('auth.welcome')}
                      </Title>
                      <Text style={{ color: subTextColor, fontSize: 13 }}>
                        {t('auth.welcomeSub')}
                      </Text>
                    </div>

                    <Form
                      form={loginForm}
                      layout="vertical"
                      onFinish={handleLogin}
                      size="large"
                      requiredMark={false}
                    >
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
                          placeholder="superadmin@admin"
                          style={{ borderRadius: 8 }}
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
                          style={{ borderRadius: 8 }}
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          style={{
                            height: 44,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {t('auth.loginBtn')}
                        </Button>
                      </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Text style={{ color: subTextColor, fontSize: 13 }}>
                        {t('auth.noAccount')}{' '}
                      </Text>
                      <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 600, fontSize: 13 }}
                        onClick={() => setTab('register')}
                      >
                        {t('auth.register')}
                      </Button>
                    </div>

                    {/* Default credentials hint */}
                    <div style={{
                      marginTop: 24,
                      padding: '12px 16px',
                      background: isDark ? 'rgba(102,126,234,0.12)' : 'rgba(102,126,234,0.06)',
                      borderRadius: 10,
                      border: '1px solid rgba(102,126,234,0.2)',
                    }}>
                      <Text style={{ fontSize: 12, color: subTextColor, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                        Default accounts:
                      </Text>
                      <Text style={{ fontSize: 12, color: subTextColor, display: 'block' }}>
                        superadmin@admin / superadmin123
                      </Text>
                      <Text style={{ fontSize: 12, color: subTextColor, display: 'block' }}>
                        admin@admin / admin123
                      </Text>
                    </div>
                  </div>
                ),
              },
              {
                key: 'register',
                label: <span style={{ fontWeight: 600, fontSize: 15 }}>{t('auth.register')}</span>,
                children: (
                  <div>
                    <div style={{ marginBottom: 28 }}>
                      <Title level={4} style={{ margin: 0, color: textColor }}>
                        {t('auth.createAccount')}
                      </Title>
                      <Text style={{ color: subTextColor, fontSize: 13 }}>
                        {t('auth.createSub')}
                      </Text>
                    </div>

                    <Form
                      form={registerForm}
                      layout="vertical"
                      onFinish={handleRegister}
                      size="large"
                      requiredMark={false}
                      initialValues={{ role: 'cashier' }}
                    >
                      <Form.Item
                        name="name"
                        label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.name')}</span>}
                        rules={[{ required: true, message: t('auth.nameRequired') }]}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: '#667eea' }} />}
                          placeholder="John Doe"
                          style={{ borderRadius: 8 }}
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
                          style={{ borderRadius: 8 }}
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
                          style={{ borderRadius: 8 }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="role"
                        label={<span style={{ color: textColor, fontWeight: 500 }}>{t('auth.role')}</span>}
                      >
                        <Select
                          style={{ borderRadius: 8 }}
                          options={[
                            { value: 'cashier', label: t('role.cashier') },
                            { value: 'admin', label: t('role.admin') },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item style={{ marginBottom: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          style={{
                            height: 44,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {t('auth.registerBtn')}
                        </Button>
                      </Form.Item>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Text style={{ color: subTextColor, fontSize: 13 }}>
                        {t('auth.hasAccount')}{' '}
                      </Text>
                      <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 600, fontSize: 13 }}
                        onClick={() => setTab('login')}
                      >
                        {t('auth.login')}
                      </Button>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
