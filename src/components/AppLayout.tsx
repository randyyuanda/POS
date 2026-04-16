import { useState } from 'react';
import {
  Layout, Menu, Avatar, Badge, Dropdown, Space, Typography, Button, theme, Tooltip, Select,
  Tag, Drawer, Grid,
} from 'antd';
import {
  DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined,
  OrderedListOutlined, UserOutlined, BarChartOutlined, SettingOutlined,
  BellOutlined, LogoutOutlined, UserSwitchOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  SunOutlined, MoonOutlined, GlobalOutlined, CloseOutlined, GiftOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { useLang, type Lang } from '../contexts/LangContext';
import { useThemeMode } from '../contexts/ThemeContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const LANG_OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'id', label: 'ID' },
  { value: 'zh', label: '中文' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: '#764ba2',
  admin: '#667eea',
  cashier: '#4facfe',
};

const ALL_NAV = [
  { key: '/dashboard', icon: <DashboardOutlined />, labelKey: 'nav.dashboard', roles: ['superadmin', 'admin'] },
  { key: '/pos', icon: <ShoppingCartOutlined />, labelKey: 'nav.pos', roles: ['superadmin', 'admin'] },
  { key: '/products', icon: <AppstoreOutlined />, labelKey: 'nav.products', roles: ['superadmin', 'admin'] },
  { key: '/orders', icon: <OrderedListOutlined />, labelKey: 'nav.orders', roles: ['superadmin', 'admin'] },
  { key: '/customers', icon: <UserOutlined />, labelKey: 'nav.customers', roles: ['superadmin', 'admin'] },
  { key: '/reports', icon: <BarChartOutlined />, labelKey: 'nav.reports', roles: ['superadmin', 'admin'] },
  { key: '/loyalty', icon: <GiftOutlined />, labelKey: 'nav.loyalty', roles: ['superadmin', 'admin'] },
  { key: '/settings', icon: <SettingOutlined />, labelKey: 'nav.settings', roles: ['superadmin', 'admin'] },
] as const;

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const { themeMode, toggleTheme } = useThemeMode();

  const userRole = user?.role ?? 'admin';
  const roleColor = ROLE_COLORS[userRole];

  const menuItems = ALL_NAV
    .filter((item) => (item.roles as readonly string[]).includes(userRole))
    .map(({ key, icon, labelKey }) => ({ key, icon, label: t(labelKey) }));

  const userMenuItems = [
    { key: 'profile', icon: <UserSwitchOutlined />, label: t('auth.profile') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: t('auth.logout'), danger: true },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
  };

  const avatarLetter = user?.name?.[0]?.toUpperCase() ?? 'U';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{
        height: 64,
        display: 'flex', alignItems: 'center',
        justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
        padding: (!isMobile && collapsed) ? 0 : '0 20px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        gap: 10,
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ShoppingCartOutlined style={{ color: 'white', fontSize: 16 }} />
        </div>
        {(isMobile || !collapsed) && (
          <Text strong style={{ fontSize: 18, color: token.colorText }}>SwiftPOS</Text>
        )}
        {isMobile && (
          <Button
            type="text" size="small" icon={<CloseOutlined />}
            onClick={() => setMobileMenuOpen(false)}
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          />
        )}
      </div>

      {/* Role badge */}
      {(isMobile || !collapsed) && user && (
        <div style={{ padding: '8px 16px 4px', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Tag color={roleColor} style={{ borderRadius: 10, fontSize: 10, padding: '0 8px', fontWeight: 600 }}>
            {t(`role.${userRole}`)}
          </Tag>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => { navigate(key); if (isMobile) setMobileMenuOpen(false); }}
        style={{ border: 'none', padding: '8px 0', background: 'transparent' }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          placement="left"
          width={220}
          title={null}
          closable={false}
          styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        /* Desktop Sider */
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={220}
          style={{
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            position: 'fixed',
            left: 0, top: 0, bottom: 0,
            zIndex: 100,
            overflowY: 'auto',
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 220), transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: isMobile ? '0 12px' : '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 99, height: 64,
        }}>
          <Button
            type="text"
            icon={isMobile
              ? <MenuUnfoldOutlined />
              : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            style={{ fontSize: 18 }}
          />

          <Space size={isMobile ? 4 : 6}>
            {/* Language — hide on xs */}
            {screens.sm && (
              <Select
                value={lang}
                onChange={(v) => setLang(v as Lang)}
                size="small"
                style={{ width: 70 }}
                suffixIcon={<GlobalOutlined style={{ fontSize: 11 }} />}
                options={LANG_OPTIONS}
                variant="borderless"
              />
            )}

            {/* Theme toggle */}
            <Tooltip title={themeMode === 'dark' ? t('header.lightMode') : t('header.darkMode')}>
              <Button
                type="text" shape="circle"
                icon={themeMode === 'dark'
                  ? <SunOutlined style={{ fontSize: 16, color: '#faad14' }} />
                  : <MoonOutlined style={{ fontSize: 16 }} />}
                onClick={toggleTheme}
              />
            </Tooltip>

            {/* Notifications */}
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} shape="circle" />
            </Badge>

            {/* User dropdown */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenu }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer', padding: isMobile ? '4px' : '4px 8px', borderRadius: 8 }}>
                <Avatar style={{ background: `linear-gradient(135deg, ${roleColor} 0%, #764ba2 100%)` }}>
                  {avatarLetter}
                </Avatar>
                {/* Hide name on mobile */}
                {screens.md && (
                  <div style={{ lineHeight: 1.3 }}>
                    <Text strong style={{ display: 'block', fontSize: 13 }}>{user?.name ?? 'User'}</Text>
                    <Text style={{ fontSize: 11, color: roleColor, fontWeight: 600 }}>
                      {t(`role.${userRole}`)}
                    </Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content style={{
          padding: isMobile ? 10 : 24,
          background: token.colorBgLayout,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
