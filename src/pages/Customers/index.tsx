import { useState } from 'react';
import {
  Card, Table, Button, Input, Space, Typography, Modal, Form, Avatar,
  Row, Col, Statistic, Tag, Descriptions, message, Popconfirm, Dropdown,
} from 'antd';
import {
  UserOutlined, SearchOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, TrophyOutlined, ShoppingOutlined,
  FilePdfOutlined, FileExcelOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { customers as initialCustomers } from '../../data/mockData';
import type { Customer } from '../../types';
import { downloadPDF, downloadExcel } from '../../utils/exportUtils';

const { Title, Text } = Typography;
const AVATAR_COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#f5a623', '#7ed321'];

const getTier = (spent: number) => {
  if (spent >= 800) return { label: 'Gold', color: 'gold' };
  if (spent >= 400) return { label: 'Silver', color: 'cyan' };
  return { label: 'Bronze', color: 'default' };
};

export default function Customers() {
  const [data, setData] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const filtered = data.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalRevenue = data.reduce((s, c) => s + c.totalSpent, 0);
  const vipCustomers = data.filter((c) => c.totalSpent >= 800).length;

  const handleEdit = (c: Customer) => { setEditing(c); form.setFieldsValue(c); setModal(true); };
  const handleAdd = () => { setEditing(null); form.resetFields(); setModal(true); };
  const handleSave = async () => {
    const values = await form.validateFields();
    if (editing) {
      setData((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...values } : c));
      message.success('Customer updated');
    } else {
      setData((prev) => [...prev, {
        ...values, id: Date.now().toString(),
        totalOrders: 0, totalSpent: 0,
        joinedAt: new Date().toISOString().split('T')[0],
      }]);
      message.success('Customer added');
    }
    setModal(false);
  };
  const handleDelete = (id: string) => { setData((prev) => prev.filter((c) => c.id !== id)); message.success('Customer deleted'); };

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    downloadPDF({
      filename: `customers-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Customer Report',
      subtitle: `${filtered.length} customers · Generated ${new Date().toLocaleString()}`,
      headers: ['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Tier', 'Member Since'],
      rows: filtered.map((c) => {
        const tier = getTier(c.totalSpent);
        return [
          c.name, c.email, c.phone, c.totalOrders,
          `$${c.totalSpent.toFixed(2)}`, tier.label,
          new Date(c.joinedAt).toLocaleDateString(),
        ];
      }),
      summary: [
        { label: 'Total Customers', value: String(data.length) },
        { label: 'VIP (Gold)', value: String(vipCustomers) },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}` },
        { label: 'Avg Spent', value: `$${(totalRevenue / data.length).toFixed(2)}` },
      ],
    });
  };

  const handleExportExcel = () => {
    downloadExcel({
      filename: `customers-${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: 'Customers',
      headers: ['Name', 'Email', 'Phone', 'Address', 'Total Orders', 'Total Spent', 'Tier', 'Member Since'],
      rows: filtered.map((c) => [
        c.name, c.email, c.phone, c.address ?? '',
        c.totalOrders, `$${c.totalSpent.toFixed(2)}`,
        getTier(c.totalSpent).label,
        new Date(c.joinedAt).toLocaleDateString(),
      ]),
      colWidths: [20, 24, 16, 24, 12, 14, 10, 14],
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
      title: 'Customer', key: 'customer',
      render: (_: unknown, r: Customer) => {
        const colorIdx = parseInt(r.id) % AVATAR_COLORS.length;
        return (
          <Space>
            <Avatar style={{ background: AVATAR_COLORS[colorIdx], fontSize: 14 }} size={40}>{r.name[0]}</Avatar>
            <div>
              <Text strong style={{ display: 'block' }}>{r.name}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{r.email}</Text>
            </div>
          </Space>
        );
      },
    },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: 'Orders', dataIndex: 'totalOrders', key: 'totalOrders',
      render: (v: number) => <Tag color="blue">{v} orders</Tag>,
      sorter: (a: Customer, b: Customer) => a.totalOrders - b.totalOrders,
    },
    {
      title: 'Total Spent', dataIndex: 'totalSpent', key: 'totalSpent',
      render: (v: number) => <Text strong style={{ color: v > 500 ? '#52c41a' : 'inherit' }}>${v.toFixed(2)}</Text>,
      sorter: (a: Customer, b: Customer) => a.totalSpent - b.totalSpent,
    },
    {
      title: 'Since', dataIndex: 'joinedAt', key: 'joinedAt',
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{new Date(v).toLocaleDateString()}</Text>,
    },
    {
      title: 'Tier', key: 'tier',
      render: (_: unknown, r: Customer) => {
        const tier = getTier(r.totalSpent);
        return <Tag color={tier.color}><TrophyOutlined /> {tier.label}</Tag>;
      },
    },
    {
      title: 'Actions', key: 'actions',
      render: (_: unknown, r: Customer) => (
        <Space>
          <Button type="text" icon={<UserOutlined />} onClick={() => { setViewing(r); setDetailModal(true); }} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm title="Delete customer?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }} okText="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Customers</Title>
        <Text type="secondary">Manage your customer database</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Customers', value: data.length, color: '#667eea', icon: <UserOutlined /> },
          { title: 'VIP (Gold)', value: vipCustomers, color: '#fa8c16', icon: <TrophyOutlined /> },
          { title: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, color: '#52c41a', icon: <ShoppingOutlined /> },
          { title: 'Avg Spent', value: `$${(totalRevenue / data.length).toFixed(2)}`, color: '#764ba2', icon: <ShoppingOutlined /> },
        ].map((stat) => (
          <Col xs={12} lg={6} key={stat.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic title={stat.title} value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ fontSize: 22, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined />} placeholder="Search by name, email or phone..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', minWidth: 180, maxWidth: 380 }} />
          <Space wrap style={{ marginLeft: 'auto' }}>
            <Dropdown menu={exportMenuItems} trigger={['click']}>
              <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>
                Export <span style={{ fontSize: 11, opacity: 0.7 }}>▾</span>
              </Button>
            </Dropdown>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: 8 }}>
              Add Customer
            </Button>
          </Space>
        </div>

        <Table dataSource={filtered} columns={columns} rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 800 }} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={modal} onCancel={() => setModal(false)} onOk={handleSave}
        title={editing ? 'Edit Customer' : 'Add Customer'}
        okText={editing ? 'Save Changes' : 'Add Customer'}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } }}
        style={{ maxWidth: '95vw' }}
        centered>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal} onCancel={() => setDetailModal(false)} footer={null} title="Customer Profile" centered width={480} style={{ maxWidth: '95vw' }}>
        {viewing && (
          <div>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Avatar size={80} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: 32 }}>
                {viewing.name[0]}
              </Avatar>
              <Title level={4} style={{ margin: '12px 0 4px' }}>{viewing.name}</Title>
              <Tag color={getTier(viewing.totalSpent).color}>
                <TrophyOutlined /> {getTier(viewing.totalSpent).label} Member
              </Tag>
            </div>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="Email">{viewing.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{viewing.phone}</Descriptions.Item>
              <Descriptions.Item label="Address">{viewing.address ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Total Orders">{viewing.totalOrders}</Descriptions.Item>
              <Descriptions.Item label="Total Spent">${viewing.totalSpent.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Member Since">{new Date(viewing.joinedAt).toLocaleDateString()}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
