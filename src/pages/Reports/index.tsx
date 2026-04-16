import { useState } from 'react';
import {
  Row, Col, Card, Typography, DatePicker, Button, Table, Tag, Select,
  Space, Dropdown,
} from 'antd';
import {
  BarChartOutlined, ArrowUpOutlined, DollarOutlined,
  FilePdfOutlined, FileExcelOutlined, DownloadOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { salesData, categorySales, topProducts } from '../../data/mockData';
import { downloadPDF, downloadExcel } from '../../utils/exportUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const PIE_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const hourlyData = [
  { hour: '08:00', revenue: 120 }, { hour: '09:00', revenue: 280 }, { hour: '10:00', revenue: 350 },
  { hour: '11:00', revenue: 290 }, { hour: '12:00', revenue: 480 }, { hour: '13:00', revenue: 520 },
  { hour: '14:00', revenue: 380 }, { hour: '15:00', revenue: 260 }, { hour: '16:00', revenue: 310 },
  { hour: '17:00', revenue: 420 }, { hour: '18:00', revenue: 390 }, { hour: '19:00', revenue: 180 },
];

const paymentData = [
  { method: 'Card', count: 145, amount: 3240, color: '#667eea' },
  { method: 'Cash', count: 89, amount: 1560, color: '#764ba2' },
  { method: 'Digital', count: 56, amount: 1120, color: '#f093fb' },
];

const kpis = [
  { title: 'Total Revenue', value: '$10,560', growth: 12.5, positive: true },
  { title: 'Total Orders', value: '282', growth: 8.2, positive: true },
  { title: 'Avg Order Value', value: '$37.45', growth: 4.1, positive: true },
  { title: 'Refund Rate', value: '2.3%', growth: 1.2, positive: false },
];

const topProductsColumns = [
  { title: '#', key: 'rank', render: (_: unknown, __: unknown, i: number) => <Text strong>{i + 1}</Text> },
  { title: 'Product', dataIndex: 'name', key: 'name' },
  { title: 'Units Sold', dataIndex: 'sold', key: 'sold', render: (v: number) => <Tag color="blue">{v}</Tag> },
  { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (v: number) => <Text strong>${v.toFixed(2)}</Text> },
];

export default function Reports() {
  const [period, setPeriod] = useState('week');

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    downloadPDF({
      filename: `reports-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Reports & Analytics',
      subtitle: `Period: ${period} · Generated ${new Date().toLocaleString()}`,
      headers: ['Metric', 'Date', 'Revenue', 'Orders'],
      rows: salesData.map((d) => [d.date, d.date, `$${d.revenue}`, d.orders]),
      summary: kpis.map((k) => ({ label: k.title, value: k.value })),
    });
  };

  const handleExportTopProductsPDF = () => {
    downloadPDF({
      filename: `top-products-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Top Products Report',
      headers: ['Rank', 'Product', 'Units Sold', 'Revenue'],
      rows: topProducts.map((p, i) => [i + 1, p.name, p.sold, `$${p.revenue}`]),
      summary: [
        { label: 'Total Units', value: String(topProducts.reduce((s, p) => s + p.sold, 0)) },
        { label: 'Total Revenue', value: `$${topProducts.reduce((s, p) => s + p.revenue, 0).toFixed(2)}` },
      ],
    });
  };

  const handleExportExcel = () => {
    // Export multiple sheets via aoa approach: we'll combine into one
    downloadExcel({
      filename: `reports-${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Revenue Data',
      headers: ['Date', 'Revenue ($)', 'Orders'],
      rows: salesData.map((d) => [d.date, d.revenue, d.orders]),
      colWidths: [14, 14, 10],
    });
  };

  const handleExportTopProductsExcel = () => {
    downloadExcel({
      filename: `top-products-${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Top Products',
      headers: ['Rank', 'Product', 'Units Sold', 'Revenue ($)'],
      rows: topProducts.map((p, i) => [i + 1, p.name, p.sold, p.revenue]),
      colWidths: [8, 28, 14, 14],
    });
  };

  const fullExportMenu = {
    items: [
      {
        key: 'revenue_pdf', icon: <FilePdfOutlined style={{ color: '#e53935' }} />,
        label: 'Revenue Report — PDF', onClick: handleExportPDF,
      },
      {
        key: 'revenue_excel', icon: <FileExcelOutlined style={{ color: '#1d6f42' }} />,
        label: 'Revenue Data — Excel', onClick: handleExportExcel,
      },
      { type: 'divider' as const },
      {
        key: 'products_pdf', icon: <FilePdfOutlined style={{ color: '#e53935' }} />,
        label: 'Top Products — PDF', onClick: handleExportTopProductsPDF,
      },
      {
        key: 'products_excel', icon: <FileExcelOutlined style={{ color: '#1d6f42' }} />,
        label: 'Top Products — Excel', onClick: handleExportTopProductsExcel,
      },
    ],
  };

  const tableExportMenu = {
    items: [
      { key: 'pdf', icon: <FilePdfOutlined style={{ color: '#e53935' }} />, label: 'Export as PDF', onClick: handleExportTopProductsPDF },
      { key: 'excel', icon: <FileExcelOutlined style={{ color: '#1d6f42' }} />, label: 'Export as Excel', onClick: handleExportTopProductsExcel },
    ],
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Reports & Analytics</Title>
          <Text type="secondary">Business performance insights</Text>
        </div>
        <Space wrap size={8}>
          <Select value={period} onChange={setPeriod} style={{ width: 130 }}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
            ]} />
          <RangePicker style={{ maxWidth: '100%' }} />
          <Dropdown menu={fullExportMenu} trigger={['click']}>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>
              Export <span style={{ fontSize: 11, opacity: 0.7 }}>▾</span>
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <Col xs={12} lg={6} key={kpi.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>{kpi.title}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={{ fontSize: 26, fontWeight: 700 }}>{kpi.value}</Text>
                <Tag color={kpi.positive ? 'green' : 'red'}>
                  <ArrowUpOutlined style={{ transform: !kpi.positive ? 'rotate(180deg)' : undefined }} />
                  {kpi.growth}%
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Revenue & Category */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Space><BarChartOutlined />Revenue Overview</Space>} bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2.5} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Revenue by Category" bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categorySales} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={75}>
                  {categorySales.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
            {categorySales.slice(0, 4).map((c, i) => (
              <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Space size={8}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i] }} />
                  <Text style={{ fontSize: 12 }}>{c.category}</Text>
                </Space>
                <Text strong style={{ fontSize: 12 }}>${c.revenue}</Text>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Hourly & Payment */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Hourly Sales (Today)" bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((_, i) => (
                    <Cell key={i} fill={i === 5 || i === 6 ? '#764ba2' : '#667eea'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Payment Methods" bordered={false} style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={paymentData} layout="vertical" barSize={16}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="method" tick={{ fontSize: 12 }} width={50} />
                <Tooltip formatter={(v) => [`$${v}`, 'Amount']} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {paymentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 12 }}>
              {paymentData.map((p) => (
                <div key={p.method} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Space size={8}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
                    <Text style={{ fontSize: 12 }}>{p.method}</Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>{p.count} orders · ${p.amount}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Products Table */}
      <Card
        title={<Space><DollarOutlined />Top Performing Products</Space>}
        bordered={false}
        style={{ borderRadius: 12 }}
        extra={
          <Dropdown menu={tableExportMenu} trigger={['click']}>
            <Button type="link" icon={<DownloadOutlined />}>Export ▾</Button>
          </Dropdown>
        }
      >
        <Table dataSource={topProducts} columns={topProductsColumns} rowKey="name" pagination={false} size="middle" />
      </Card>
    </div>
  );
}
