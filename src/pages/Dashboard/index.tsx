// React import not needed with new JSX transform
import {
  Row, Col, Card, Statistic, Table, Tag, Typography, Space, Avatar, Progress, Badge,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingOutlined,
  AppstoreOutlined, UserOutlined, TrophyOutlined, BarChartOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { salesData, categorySales, recentOrders, topProducts } from '../../data/mockData';
import type { Order } from '../../types';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const PIE_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const statusColor: Record<string, string> = {
  completed: 'green',
  pending: 'gold',
  refunded: 'blue',
  cancelled: 'red',
};

const paymentIcon: Record<string, string> = {
  card: '💳',
  cash: '💵',
  digital: '📱',
};

export default function Dashboard() {
  const { t } = useLang();
  const { user } = useAuth();

  const orderColumns = [
    {
      title: t('dashboard.order'), dataIndex: 'orderNumber', key: 'orderNumber',
      render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('dashboard.customer'), key: 'customer',
      render: (_: unknown, r: Order) => (
        <Space>
          <Avatar size={28} style={{ background: '#667eea', fontSize: 12 }}>
            {r.customer?.name?.[0] ?? '?'}
          </Avatar>
          <Text style={{ fontSize: 12 }}>{r.customer?.name ?? 'Guest'}</Text>
        </Space>
      ),
    },
    {
      title: t('dashboard.items'), key: 'items',
      render: (_: unknown, r: Order) => (
        <Text style={{ fontSize: 12 }}>{r.items.reduce((a, i) => a + i.quantity, 0)} {t('dashboard.items').toLowerCase()}</Text>
      ),
    },
    {
      title: t('dashboard.total'), dataIndex: 'total', key: 'total',
      render: (v: number) => <Text strong>${v.toFixed(2)}</Text>,
    },
    {
      title: t('dashboard.payment'), dataIndex: 'paymentMethod', key: 'paymentMethod',
      render: (v: string) => <span>{paymentIcon[v]} {v.charAt(0).toUpperCase() + v.slice(1)}</span>,
    },
    {
      title: t('dashboard.status'), dataIndex: 'status', key: 'status',
      render: (v: string) => <Tag color={statusColor[v]}>{v.toUpperCase()}</Tag>,
    },
    {
      title: t('dashboard.time'), dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      ),
    },
  ];

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>{t('dashboard.title')}</Title>
        <Text type="secondary">
          {t('dashboard.subtitle').replace('Welcome back!', `Welcome back, ${firstName}!`)}
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: t('dashboard.todayRevenue'), value: 1248.50, prefix: '$', precision: 2,
            icon: <DollarOutlined />, color: '#667eea', growth: 12.5, positive: true,
          },
          {
            title: t('dashboard.todayOrders'), value: 34, prefix: '',
            icon: <ShoppingOutlined />, color: '#764ba2', growth: 8.2, positive: true,
          },
          {
            title: t('dashboard.totalProducts'), value: 248, prefix: '',
            icon: <AppstoreOutlined />, color: '#f093fb', growth: 2.1, positive: false,
          },
          {
            title: t('dashboard.totalCustomers'), value: 1284, prefix: '',
            icon: <UserOutlined />, color: '#4facfe', growth: 5.7, positive: true,
          },
        ].map((stat) => (
          <Col xs={24} sm={12} xl={6} key={stat.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Statistic
                      value={stat.value}
                      prefix={stat.prefix}
                      precision={stat.prefix === '$' ? 2 : 0}
                      valueStyle={{ fontSize: 28, fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {stat.positive
                      ? <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                      : <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
                    <Text
                      style={{ color: stat.positive ? '#52c41a' : '#ff4d4f', fontSize: 12, marginLeft: 4 }}
                    >
                      {stat.growth}% {t('dashboard.vsLastWeek')}
                    </Text>
                  </div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${stat.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: stat.color, fontSize: 22 }}>{stat.icon}</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<Space><BarChartOutlined />{t('dashboard.weeklyRevenue')}</Space>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<Space><TrophyOutlined />{t('dashboard.salesByCategory')}</Space>}
            bordered={false}
            style={{ borderRadius: 12, height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={categorySales}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%" cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {categorySales.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8 }}>
              {categorySales.slice(0, 4).map((c, i) => (
                <div key={c.category} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <Space size={6}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }} />
                    <Text style={{ fontSize: 12 }}>{c.category}</Text>
                  </Space>
                  <Text strong style={{ fontSize: 12 }}>{c.percentage}%</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Orders Line Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            title={t('dashboard.orderTrend')}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#667eea"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#667eea' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={<Space><TrophyOutlined />{t('dashboard.topProducts')}</Space>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            {topProducts.map((p, i) => (
              <div key={p.name} style={{ marginBottom: i < topProducts.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Space size={8}>
                    <Badge count={i + 1} color={i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32'} />
                    <Text style={{ fontSize: 12 }}>{p.name}</Text>
                  </Space>
                  <Text strong style={{ fontSize: 12 }}>${p.revenue}</Text>
                </div>
                <Progress
                  percent={Math.round((p.revenue / topProducts[0].revenue) * 100)}
                  showInfo={false}
                  strokeColor={{ from: '#667eea', to: '#764ba2' }}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card
        title={t('dashboard.recentOrders')}
        bordered={false}
        style={{ borderRadius: 12 }}
        extra={
          <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer', color: '#667eea' }}>
            {t('dashboard.viewAll')}
          </Text>
        }
      >
        <Table
          dataSource={recentOrders}
          columns={orderColumns}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
