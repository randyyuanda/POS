import { useState } from 'react';
import {
  Card, Table, Tag, Space, Typography, Button, Input, Select, DatePicker,
  Modal, Descriptions, List, Avatar, Row, Col, Statistic, Dropdown,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, ShoppingOutlined,
  CheckCircleOutlined, ClockCircleOutlined, StopOutlined,
  FilePdfOutlined, FileExcelOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { recentOrders } from '../../data/mockData';
import type { Order } from '../../types';
import { downloadPDF, downloadExcel } from '../../utils/exportUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  completed: { color: 'green', icon: <CheckCircleOutlined /> },
  pending: { color: 'gold', icon: <ClockCircleOutlined /> },
  refunded: { color: 'blue', icon: <StopOutlined /> },
  cancelled: { color: 'red', icon: <StopOutlined /> },
};

const paymentLabel: Record<string, { color: string; label: string }> = {
  card: { color: 'purple', label: '💳 Card' },
  cash: { color: 'green', label: '💵 Cash' },
  digital: { color: 'blue', label: '📱 Digital' },
};

const allOrders: Order[] = [
  ...recentOrders,
  ...recentOrders.map((o, i) => ({
    ...o, id: `${o.id}-${i}`,
    orderNumber: `ORD-2024-${(6 + i).toString().padStart(3, '0')}`,
    createdAt: `2026-04-13T${(8 + i).toString().padStart(2, '0')}:00:00`,
    status: (i % 4 === 0 ? 'refunded' : i % 3 === 0 ? 'cancelled' : 'completed') as Order['status'],
  })),
];

export default function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = allOrders.filter((o) => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const completedOrders = allOrders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0);

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    downloadPDF({
      filename: `orders-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Orders Report',
      subtitle: `${filtered.length} orders · Generated ${new Date().toLocaleString()}`,
      headers: ['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Cashier', 'Date'],
      rows: filtered.map((o) => [
        o.orderNumber,
        o.customer?.name ?? 'Walk-in',
        o.items.reduce((s, i) => s + i.quantity, 0),
        `$${o.total.toFixed(2)}`,
        o.paymentMethod,
        o.status.toUpperCase(),
        o.cashier,
        new Date(o.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      ]),
      summary: [
        { label: 'Total Orders', value: String(allOrders.length) },
        { label: 'Completed', value: String(completedOrders.length) },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
        { label: 'Avg Order', value: `$${completedOrders.length > 0 ? (totalRevenue / completedOrders.length).toFixed(2) : '0'}` },
      ],
    });
  };

  const handleExportExcel = () => {
    downloadExcel({
      filename: `orders-${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Orders',
      headers: ['Order #', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment', 'Status', 'Cashier', 'Date/Time'],
      rows: filtered.map((o) => [
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
      ]),
      colWidths: [14, 18, 7, 10, 10, 8, 10, 10, 12, 14, 22],
    });
  };

  const exportMenuItems = {
    items: [
      { key: 'pdf', icon: <FilePdfOutlined style={{ color: '#e53935' }} />, label: 'Export as PDF', onClick: handleExportPDF },
      { key: 'excel', icon: <FileExcelOutlined style={{ color: '#1d6f42' }} />, label: 'Export as Excel (.xlsx)', onClick: handleExportExcel },
    ],
  };

  const columns = [
    {
      title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber',
      render: (v: string) => <Text strong style={{ color: '#667eea' }}>{v}</Text>,
    },
    {
      title: 'Customer', key: 'customer',
      render: (_: unknown, r: Order) => (
        <Space>
          <Avatar size={28} style={{ background: '#667eea', fontSize: 12 }}>{(r.customer?.name ?? 'G')[0]}</Avatar>
          <Text style={{ fontSize: 13 }}>{r.customer?.name ?? 'Guest'}</Text>
        </Space>
      ),
    },
    {
      title: 'Items', key: 'items',
      render: (_: unknown, r: Order) => <Text>{r.items.reduce((a, i) => a + i.quantity, 0)} items</Text>,
    },
    {
      title: 'Total', dataIndex: 'total', key: 'total',
      render: (v: number) => <Text strong>${v.toFixed(2)}</Text>,
      sorter: (a: Order, b: Order) => a.total - b.total,
    },
    {
      title: 'Payment', dataIndex: 'paymentMethod', key: 'paymentMethod',
      render: (v: string) => {
        const p = paymentLabel[v];
        return <Tag color={p.color}>{p.label}</Tag>;
      },
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (v: string) => {
        const s = statusConfig[v];
        return <Tag icon={s.icon} color={s.color}>{v.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Cashier', dataIndex: 'cashier', key: 'cashier',
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Date/Time', dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
      ),
    },
    {
      title: '', key: 'actions',
      render: (_: unknown, r: Order) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedOrder(r)} />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Orders</Title>
        <Text type="secondary">View and manage all orders</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Orders', value: allOrders.length, color: '#667eea', icon: <ShoppingOutlined /> },
          { title: 'Completed', value: completedOrders.length, color: '#52c41a', icon: <CheckCircleOutlined /> },
          { title: 'Pending', value: allOrders.filter((o) => o.status === 'pending').length, color: '#fa8c16', icon: <ClockCircleOutlined /> },
          { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: '#764ba2', icon: <ShoppingOutlined /> },
        ].map((stat) => (
          <Col xs={12} lg={6} key={stat.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title={stat.title} value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ fontSize: 22, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined />} placeholder="Search by order # or customer..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 180px', minWidth: 160, maxWidth: 320 }} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ flex: '1 1 130px', minWidth: 130, maxWidth: 180 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'cancelled', label: 'Cancelled' },
            ]} />
          <RangePicker style={{ flex: '1 1 220px', minWidth: 200 }} />

          {/* Export dropdown */}
          <Dropdown menu={exportMenuItems} trigger={['click']}>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>
              Export <span style={{ fontSize: 11, opacity: 0.7 }}>▾</span>
            </Button>
          </Dropdown>
        </div>

        <Table
          dataSource={filtered} columns={columns} rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} orders` }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        open={!!selectedOrder} onCancel={() => setSelectedOrder(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedOrder(null)}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
            Close
          </Button>,
        ]}
        title={
          <Space>
            <Text strong>Order Details</Text>
            {selectedOrder && <Tag color={statusConfig[selectedOrder.status].color}>{selectedOrder.status.toUpperCase()}</Tag>}
          </Space>
        }
        width={560} style={{ maxWidth: '95vw' }} centered
      >
        {selectedOrder && (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Order #">{selectedOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="Cashier">{selectedOrder.cashier}</Descriptions.Item>
              <Descriptions.Item label="Customer">{selectedOrder.customer?.name ?? 'Guest'}</Descriptions.Item>
              <Descriptions.Item label="Payment">
                <Tag color={paymentLabel[selectedOrder.paymentMethod].color}>
                  {paymentLabel[selectedOrder.paymentMethod].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date" span={2}>{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
            <List
              dataSource={selectedOrder.items}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.product.image} shape="square" size={40} style={{ borderRadius: 6 }} />}
                    title={<Text style={{ fontSize: 13 }}>{item.product.name}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>×{item.quantity} @ ${item.product.price.toFixed(2)}</Text>}
                  />
                  <Text strong>${(item.product.price * item.quantity).toFixed(2)}</Text>
                </List.Item>
              )}
            />
            <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, marginTop: 8 }}>
              {[['Subtotal', `$${selectedOrder.subtotal.toFixed(2)}`], ['Tax', `$${selectedOrder.tax.toFixed(2)}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">{l}</Text><Text>{v}</Text>
                </div>
              ))}
              {selectedOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Discount</Text>
                  <Text style={{ color: '#ff4d4f' }}>-${selectedOrder.discount.toFixed(2)}</Text>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
                <Text strong>Total</Text>
                <Text strong style={{ fontSize: 16, color: '#667eea' }}>${selectedOrder.total.toFixed(2)}</Text>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
