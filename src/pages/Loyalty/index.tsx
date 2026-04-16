import { useState, useMemo } from 'react';
import {
  Row, Col, Card, Table, Tag, Space, Typography, Button, Input, Select,
  Modal, Form, InputNumber, Switch, Drawer, Divider, Popconfirm, message,
  Tabs, Progress, Avatar, Badge, DatePicker, Tooltip,
} from 'antd';
import {
  TagOutlined, UserOutlined, TrophyOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, SearchOutlined, CopyOutlined, CheckCircleOutlined,
  WalletOutlined, StarOutlined, ArrowUpOutlined, ClockCircleOutlined,
  HistoryOutlined, PlusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { customers } from '../../data/mockData';
import { useLoyalty } from '../../contexts/LoyaltyContext';
import type { Voucher, LoyaltyAccount, MembershipTier } from '../../types';

const { Title, Text } = Typography;

// ─── Tier Styling ─────────────────────────────────────────────────────────────
const TIER_TAG_COLOR: Record<string, string> = {
  bronze: 'orange', silver: 'default', gold: 'gold', platinum: 'purple',
};

function TierBadge({ tierId, tiers }: { tierId: string; tiers: MembershipTier[] }) {
  const tier = tiers.find((t) => t.id === tierId);
  if (!tier) return null;
  return (
    <Tag color={TIER_TAG_COLOR[tierId]} style={{ fontWeight: 600, fontSize: 11 }}>
      {tier.emoji} {tier.name}
    </Tag>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { accounts, transactions, vouchers, tiers } = useLoyalty();

  const totalMembers = accounts.length;
  const totalPoints = accounts.reduce((s, a) => s + a.points, 0);
  const activeVouchers = vouchers.filter((v) => v.isActive && new Date(v.expiryDate) >= new Date()).length;
  const totalWallet = accounts.reduce((s, a) => s + a.walletBalance, 0);
  const totalVoucherUsage = vouchers.reduce((s, v) => s + v.usedCount, 0);

  const tierCounts = tiers.map((t) => ({
    ...t,
    count: accounts.filter((a) => a.tierId === t.id).length,
  }));

  const topMembers = [...accounts]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((a) => ({
      ...a,
      customer: customers.find((c) => c.id === a.customerId),
      tier: tiers.find((t) => t.id === a.tierId),
    }));

  const recentTx = transactions.slice(0, 10).map((tx) => ({
    ...tx,
    customer: customers.find((c) => c.id === tx.customerId),
  }));

  const txTypeColor: Record<string, string> = {
    earned: 'green', redeemed: 'orange', topup: 'blue', adjusted: 'purple', expired: 'red',
  };
  const txTypeIcon: Record<string, React.ReactNode> = {
    earned: <ArrowUpOutlined />, redeemed: <StarOutlined />,
    topup: <WalletOutlined />, adjusted: <EditOutlined />, expired: <ClockCircleOutlined />,
  };

  return (
    <div>
      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { title: 'Total Members', value: totalMembers, icon: <UserOutlined />, color: '#667eea', suffix: '' },
          { title: 'Redeemable Points', value: totalPoints.toLocaleString(), icon: <StarOutlined />, color: '#d4a017', suffix: ' pts' },
          { title: 'Active Vouchers', value: activeVouchers, icon: <TagOutlined />, color: '#52c41a', suffix: '' },
          { title: 'Total Wallet Balance', value: `$${totalWallet.toFixed(2)}`, icon: <WalletOutlined />, color: '#764ba2', suffix: '' },
        ].map((k) => (
          <Col xs={12} lg={6} key={k.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{k.title}</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: k.color }}>{k.value}</div>
                  <Text type="secondary" style={{ fontSize: 11 }}>voucher uses: {totalVoucherUsage}</Text>
                </div>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${k.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: k.color, fontSize: 20 }}>{k.icon}</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Tier Distribution */}
        <Col xs={24} lg={10}>
          <Card title={<Space><TrophyOutlined />Tier Distribution</Space>} bordered={false} style={{ borderRadius: 12 }}>
            {tierCounts.map((t) => (
              <div key={t.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Space size={6}>
                    <span style={{ fontSize: 16 }}>{t.emoji}</span>
                    <Text strong style={{ fontSize: 13 }}>{t.name}</Text>
                    <Tag color={TIER_TAG_COLOR[t.id]} style={{ fontSize: 10 }}>{t.count} members</Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {totalMembers > 0 ? Math.round((t.count / totalMembers) * 100) : 0}%
                  </Text>
                </div>
                <Progress
                  percent={totalMembers > 0 ? Math.round((t.count / totalMembers) * 100) : 0}
                  showInfo={false} size="small"
                  strokeColor={t.color}
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* Top Members */}
        <Col xs={24} lg={14}>
          <Card title={<Space><TrophyOutlined />Top Members by Points</Space>} bordered={false} style={{ borderRadius: 12 }}>
            {topMembers.map((m, i) => (
              <div key={m.customerId} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: i < topMembers.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}>
                <Text strong style={{ width: 18, fontSize: 13, color: i < 3 ? '#d4a017' : '#8c8c8c' }}>#{i + 1}</Text>
                <Avatar style={{ background: '#667eea', flexShrink: 0 }} size={32}>{m.customer?.name[0]}</Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 12, display: 'block' }} ellipsis>{m.customer?.name ?? '—'}</Text>
                  <TierBadge tierId={m.tierId} tiers={tiers} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Text strong style={{ color: '#d4a017', display: 'block' }}>{m.points.toLocaleString()} pts</Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>${m.walletBalance.toFixed(2)} wallet</Text>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title={<Space><HistoryOutlined />Recent Activity</Space>} bordered={false} style={{ borderRadius: 12, marginTop: 16 }}>
        <Table
          dataSource={recentTx}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 600 }}
          columns={[
            {
              title: 'Member', key: 'member',
              render: (_, r: typeof recentTx[0]) => (
                <Space>
                  <Avatar size={26} style={{ background: '#667eea', fontSize: 11 }}>{r.customer?.name?.[0] ?? '?'}</Avatar>
                  <Text style={{ fontSize: 12 }}>{r.customer?.name ?? r.customerName}</Text>
                </Space>
              ),
            },
            {
              title: 'Type', dataIndex: 'type', key: 'type',
              render: (v: string) => (
                <Tag icon={txTypeIcon[v]} color={txTypeColor[v]} style={{ fontSize: 10 }}>
                  {v.toUpperCase()}
                </Tag>
              ),
            },
            {
              title: 'Points', dataIndex: 'points', key: 'points',
              render: (v: number, r: typeof recentTx[0]) => (
                <Space size={4}>
                  {v !== 0 && <Text style={{ color: v > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
                    {v > 0 ? '+' : ''}{v} pts
                  </Text>}
                  {r.walletAmount != null && r.walletAmount !== 0 && (
                    <Text style={{ color: r.walletAmount > 0 ? '#1677ff' : '#ff4d4f', fontSize: 11 }}>
                      {r.walletAmount > 0 ? '+' : ''}${r.walletAmount.toFixed(2)}
                    </Text>
                  )}
                </Space>
              ),
            },
            { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
            {
              title: 'Time', dataIndex: 'createdAt', key: 'createdAt',
              render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>,
            },
          ]}
        />
      </Card>
    </div>
  );
}

// ─── Vouchers Tab ─────────────────────────────────────────────────────────────
function VouchersTab() {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher } = useLoyalty();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form] = Form.useForm();

  const filtered = useMemo(() => vouchers.filter((v) => {
    const matchSearch = v.code.includes(search.toUpperCase()) || v.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || v.type === typeFilter;
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'active' && v.isActive && new Date(v.expiryDate) >= new Date())
      || (statusFilter === 'inactive' && (!v.isActive || new Date(v.expiryDate) < new Date()))
      || (statusFilter === 'expired' && new Date(v.expiryDate) < new Date());
    return matchSearch && matchType && matchStatus;
  }), [vouchers, search, typeFilter, statusFilter]);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (v: Voucher) => {
    setEditing(v);
    form.setFieldsValue({ ...v, startDate: dayjs(v.startDate), expiryDate: dayjs(v.expiryDate) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const data = {
      ...values,
      code: values.code.toUpperCase().replace(/\s/g, ''),
      startDate: values.startDate?.format('YYYY-MM-DD') ?? new Date().toISOString().slice(0, 10),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD') ?? '',
      maxDiscount: values.maxDiscount || null,
      usageLimit: values.usageLimit || 0,
      perCustomerLimit: values.perCustomerLimit || 0,
    };
    if (editing) {
      updateVoucher(editing.id, data);
      message.success('Voucher updated');
    } else {
      addVoucher(data);
      message.success('Voucher created');
    }
    setModalOpen(false);
  };

  const isExpired = (v: Voucher) => new Date(v.expiryDate) < new Date();
  const isExhausted = (v: Voucher) => v.usageLimit > 0 && v.usedCount >= v.usageLimit;

  const getStatusTag = (v: Voucher) => {
    if (isExpired(v)) return <Tag color="red">Expired</Tag>;
    if (isExhausted(v)) return <Tag color="orange">Exhausted</Tag>;
    if (!v.isActive) return <Tag color="default">Inactive</Tag>;
    return <Tag color="green">Active</Tag>;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => message.success(`Copied: ${code}`));
  };

  const activeCount = vouchers.filter((v) => v.isActive && !isExpired(v)).length;
  const expiredCount = vouchers.filter((v) => isExpired(v)).length;
  const totalUsed = vouchers.reduce((s, v) => s + v.usedCount, 0);

  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Active', value: activeCount, color: '#52c41a' },
          { label: 'Expired', value: expiredCount, color: '#ff4d4f' },
          { label: 'Total Redeemed', value: totalUsed, color: '#667eea' },
        ].map((s) => (
          <Col xs={8} key={s.label}>
            <Card bordered={false} style={{ borderRadius: 10, textAlign: 'center' }} styles={{ body: { padding: '12px 8px' } }}>
              <Text style={{ fontSize: 24, fontWeight: 700, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{s.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined />} placeholder="Search code or name..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 160px', minWidth: 140, maxWidth: 280 }} />
          <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 130 }}
            options={[{ value: 'all', label: 'All Types' }, { value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }}
            options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'expired', label: 'Expired' }]} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: 8 }}>
            Create Voucher
          </Button>
        </div>

        <Table dataSource={filtered} rowKey="id" size="small" scroll={{ x: 900 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          columns={[
            {
              title: 'Code', key: 'code',
              render: (_, v: Voucher) => (
                <Space size={4}>
                  <Text strong style={{ fontFamily: 'monospace', color: '#667eea', fontSize: 13 }}>{v.code}</Text>
                  <Tooltip title="Copy code">
                    <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyCode(v.code)} style={{ padding: 2 }} />
                  </Tooltip>
                </Space>
              ),
            },
            { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
            {
              title: 'Discount', key: 'discount',
              render: (_, v: Voucher) => (
                <Tag color={v.type === 'percentage' ? 'blue' : 'green'}>
                  {v.type === 'percentage' ? `${v.value}% off` : `$${v.value} off`}
                  {v.maxDiscount ? ` (max $${v.maxDiscount})` : ''}
                </Tag>
              ),
            },
            {
              title: 'Min / Category', key: 'min',
              render: (_, v: Voucher) => (
                <div>
                  {v.minPurchase > 0 && <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Min: ${v.minPurchase}</Text>}
                  <Tag style={{ fontSize: 10 }}>{v.applicableCategory}</Tag>
                </div>
              ),
            },
            {
              title: 'Usage', key: 'usage',
              render: (_, v: Voucher) => (
                <div>
                  <Text style={{ fontSize: 12 }}>{v.usedCount}{v.usageLimit > 0 ? `/${v.usageLimit}` : ''}</Text>
                  {v.usageLimit > 0 && (
                    <Progress percent={Math.round((v.usedCount / v.usageLimit) * 100)} showInfo={false} size="small" strokeColor="#667eea" style={{ marginTop: 2 }} />
                  )}
                </div>
              ),
            },
            {
              title: 'Expiry', dataIndex: 'expiryDate', key: 'expiryDate',
              render: (v: string) => (
                <Text style={{ fontSize: 11, color: new Date(v) < new Date() ? '#ff4d4f' : 'inherit' }}>
                  {new Date(v).toLocaleDateString()}
                </Text>
              ),
            },
            { title: 'Status', key: 'status', render: (_, v: Voucher) => getStatusTag(v) },
            {
              title: 'Active', key: 'active',
              render: (_, v: Voucher) => (
                <Switch size="small" checked={v.isActive} onChange={(val) => updateVoucher(v.id, { isActive: val })} />
              ),
            },
            {
              title: '', key: 'actions',
              render: (_, v: Voucher) => (
                <Space size={2}>
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(v)} />
                  <Popconfirm title="Delete this voucher?" onConfirm={() => { deleteVoucher(v.id); message.success('Deleted'); }} okButtonProps={{ danger: true }} okText="Delete">
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave}
        title={editing ? 'Edit Voucher' : 'Create Voucher'}
        okText={editing ? 'Save Changes' : 'Create'}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } }}
        width={560} style={{ maxWidth: '95vw' }} centered>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="code" label="Voucher Code" rules={[{ required: true }]}
                extra="Uppercase letters & numbers only">
                <Input placeholder="e.g. SAVE20" style={{ textTransform: 'uppercase', fontFamily: 'monospace' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Display Name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Summer Sale 20%" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item name="type" label="Type" rules={[{ required: true }]} initialValue="percentage">
                <Select options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed ($)' }]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="value" label="Discount Value" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="maxDiscount" label="Max Discount ($)" extra="Leave 0 for no cap">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={8}>
              <Form.Item name="minPurchase" label="Min Purchase ($)" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="usageLimit" label="Total Uses Limit" extra="0 = unlimited" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="perCustomerLimit" label="Per Customer Limit" extra="0 = unlimited" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="expiryDate" label="Expiry Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="applicableCategory" label="Applicable Category" initialValue="All" rules={[{ required: true }]}>
                <Select options={['All', 'Food', 'Beverages', 'Snacks', 'Desserts', 'Electronics', 'Clothing'].map((c) => ({ value: c, label: c }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of this voucher..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────
function MembersTab() {
  const { accounts, transactions, tiers, adjustPoints, topUpWallet, forceSetTier } = useLoyalty();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<LoyaltyAccount | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adjustForm] = Form.useForm();
  const [topUpForm] = Form.useForm();
  const [adjustModal, setAdjustModal] = useState(false);
  const [topUpModal, setTopUpModal] = useState(false);

  const enriched = useMemo(() => accounts.map((a) => ({
    ...a,
    customer: customers.find((c) => c.id === a.customerId),
    tier: tiers.find((t) => t.id === a.tierId),
  })).filter((a) => {
    const matchSearch = a.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      a.customer?.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'all' || a.tierId === tierFilter;
    return matchSearch && matchTier;
  }), [accounts, tiers, search, tierFilter]);

  const openDetail = (a: typeof enriched[0]) => {
    setSelectedAccount(a);
    setDrawerOpen(true);
  };

  const memberTxs = useMemo(() =>
    selectedAccount
      ? transactions.filter((t) => t.customerId === selectedAccount.customerId).slice(0, 20)
      : []
    , [selectedAccount, transactions]);

  const selectedTier = selectedAccount ? tiers.find((t) => t.id === selectedAccount.tierId) : null;
  const nextTier = selectedAccount ? (() => {
    const sorted = [...tiers].sort((a, b) => a.minSpend - b.minSpend);
    const idx = sorted.findIndex((t) => t.id === selectedAccount.tierId);
    return idx < sorted.length - 1 ? sorted[idx + 1] : null;
  })() : null;
  const tierProgress = selectedAccount && nextTier
    ? Math.min(100, Math.round(((selectedAccount.lifetimeSpend - (selectedTier?.minSpend ?? 0)) / (nextTier.minSpend - (selectedTier?.minSpend ?? 0))) * 100))
    : 100;

  const txTypeColor: Record<string, string> = {
    earned: 'green', redeemed: 'orange', topup: 'blue', adjusted: 'purple', expired: 'red',
  };

  return (
    <div>
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input prefix={<SearchOutlined />} placeholder="Search member..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 160px', minWidth: 140, maxWidth: 300 }} />
          <Select value={tierFilter} onChange={setTierFilter} style={{ width: 140 }}
            options={[{ value: 'all', label: 'All Tiers' }, ...tiers.map((t) => ({ value: t.id, label: `${t.emoji} ${t.name}` }))]} />
        </div>

        <Table dataSource={enriched} rowKey="customerId" size="small" scroll={{ x: 700 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          columns={[
            {
              title: 'Member', key: 'member',
              render: (_, r: typeof enriched[0]) => (
                <Space>
                  <Avatar size={34} style={{ background: '#667eea', fontSize: 13 }}>{r.customer?.name[0] ?? '?'}</Avatar>
                  <div>
                    <Text strong style={{ fontSize: 12, display: 'block' }}>{r.customer?.name ?? '—'}</Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>{r.customer?.email}</Text>
                  </div>
                </Space>
              ),
            },
            { title: 'Tier', key: 'tier', render: (_, r: typeof enriched[0]) => <TierBadge tierId={r.tierId} tiers={tiers} /> },
            {
              title: 'Points', dataIndex: 'points', key: 'points',
              render: (v: number) => <Text strong style={{ color: '#d4a017' }}>{v.toLocaleString()} pts</Text>,
              sorter: (a, b) => a.points - b.points,
            },
            {
              title: 'Wallet', dataIndex: 'walletBalance', key: 'walletBalance',
              render: (v: number) => <Text style={{ color: '#667eea' }}>${v.toFixed(2)}</Text>,
              sorter: (a, b) => a.walletBalance - b.walletBalance,
            },
            {
              title: 'Lifetime Spend', dataIndex: 'lifetimeSpend', key: 'lifetimeSpend',
              render: (v: number) => <Text strong>${v.toFixed(2)}</Text>,
              sorter: (a, b) => a.lifetimeSpend - b.lifetimeSpend,
            },
            {
              title: 'Last Activity', dataIndex: 'lastActivity', key: 'lastActivity',
              render: (v: string) => <Text type="secondary" style={{ fontSize: 11 }}>{new Date(v).toLocaleDateString()}</Text>,
            },
            {
              title: '', key: 'actions',
              render: (_, r: typeof enriched[0]) => (
                <Button type="link" size="small" onClick={() => openDetail(r)}>View</Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Member Detail Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Member Profile"
        width={420} styles={{ body: { padding: '16px 20px' } }}>
        {selectedAccount && (
          <>
            {/* Profile Header */}
            <div style={{ textAlign: 'center', padding: '16px 0 20px', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
              <Avatar size={64} style={{ background: selectedTier?.color ?? '#667eea', fontSize: 26, marginBottom: 10 }}>
                {customers.find((c) => c.id === selectedAccount.customerId)?.name[0] ?? '?'}
              </Avatar>
              <Title level={5} style={{ margin: '6px 0 4px' }}>
                {customers.find((c) => c.id === selectedAccount.customerId)?.name}
              </Title>
              <TierBadge tierId={selectedAccount.tierId} tiers={tiers} />
              <div style={{ marginTop: 6 }}>
                <Select size="small" value={selectedAccount.tierId}
                  onChange={(val) => forceSetTier(selectedAccount.customerId, val)}
                  options={tiers.map((t) => ({ value: t.id, label: `${t.emoji} ${t.name}` }))}
                  style={{ width: 130 }} />
              </div>
            </div>

            {/* Stats */}
            <Row gutter={[10, 10]} style={{ marginBottom: 16 }}>
              {[
                { label: 'Points Balance', value: `${selectedAccount.points.toLocaleString()} pts`, color: '#d4a017' },
                { label: 'Wallet Balance', value: `$${selectedAccount.walletBalance.toFixed(2)}`, color: '#667eea' },
                { label: 'Lifetime Points', value: selectedAccount.lifetimePoints.toLocaleString(), color: '#52c41a' },
                { label: 'Lifetime Spend', value: `$${selectedAccount.lifetimeSpend.toFixed(2)}`, color: '#764ba2' },
              ].map((s) => (
                <Col span={12} key={s.label}>
                  <Card bordered={false} style={{ background: '#fafafa', borderRadius: 8 }} styles={{ body: { padding: '8px 12px' } }}>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>{s.label}</Text>
                    <Text strong style={{ fontSize: 14, color: s.color }}>{s.value}</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Tier Progress */}
            {nextTier && (
              <Card bordered={false} style={{ background: '#f9f0ff', borderRadius: 8, marginBottom: 16 }} styles={{ body: { padding: '10px 14px' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12 }}>Progress to {nextTier.emoji} {nextTier.name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ${selectedAccount.lifetimeSpend.toFixed(0)} / ${nextTier.minSpend}
                  </Text>
                </div>
                <Progress percent={tierProgress} strokeColor={nextTier.color} showInfo={false} size="small" />
                <Text type="secondary" style={{ fontSize: 10 }}>
                  ${Math.max(0, nextTier.minSpend - selectedAccount.lifetimeSpend).toFixed(2)} more to reach {nextTier.name}
                </Text>
              </Card>
            )}

            {/* Actions */}
            <Space style={{ marginBottom: 16, width: '100%' }}>
              <Button icon={<PlusCircleOutlined />} onClick={() => { adjustForm.resetFields(); setAdjustModal(true); }}
                style={{ borderRadius: 8 }}>Adjust Points</Button>
              <Button icon={<WalletOutlined />} type="primary" onClick={() => { topUpForm.resetFields(); setTopUpModal(true); }}
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: 8 }}>
                Top-up Wallet
              </Button>
            </Space>

            <Divider style={{ margin: '8px 0 12px' }} />
            <Text strong style={{ fontSize: 13 }}><HistoryOutlined /> Transaction History</Text>
            <div style={{ maxHeight: 280, overflowY: 'auto', marginTop: 10 }}>
              {memberTxs.length === 0 ? (
                <Text type="secondary" style={{ fontSize: 12 }}>No transactions yet</Text>
              ) : memberTxs.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Tag color={txTypeColor[tx.type]} style={{ fontSize: 9, marginRight: 6 }}>{tx.type.toUpperCase()}</Tag>
                    <Text style={{ fontSize: 11 }} ellipsis>{tx.description}</Text>
                    <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                      {new Date(tx.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    {tx.points !== 0 && (
                      <Text strong style={{ fontSize: 12, color: tx.points > 0 ? '#52c41a' : '#ff4d4f', display: 'block' }}>
                        {tx.points > 0 ? '+' : ''}{tx.points} pts
                      </Text>
                    )}
                    {tx.walletAmount != null && tx.walletAmount !== 0 && (
                      <Text style={{ fontSize: 11, color: tx.walletAmount > 0 ? '#1677ff' : '#ff4d4f' }}>
                        {tx.walletAmount > 0 ? '+' : ''}${Math.abs(tx.walletAmount).toFixed(2)}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Drawer>

      {/* Adjust Points Modal */}
      <Modal open={adjustModal} onCancel={() => setAdjustModal(false)} title="Adjust Points" centered
        onOk={async () => {
          const { delta, reason } = await adjustForm.validateFields();
          const cust = customers.find((c) => c.id === selectedAccount?.customerId);
          adjustPoints(selectedAccount!.customerId, cust?.name ?? '', delta, reason);
          message.success('Points adjusted');
          setAdjustModal(false);
        }}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } }}>
        <Form form={adjustForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="delta" label="Points to Add/Deduct" rules={[{ required: true }]}
            extra="Use negative number to deduct points">
            <InputNumber style={{ width: '100%' }} placeholder="e.g. 100 or -50" />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <Input placeholder="e.g. Bonus for customer appreciation" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Top-up Wallet Modal */}
      <Modal open={topUpModal} onCancel={() => setTopUpModal(false)} title="Top-up Wallet" centered
        onOk={async () => {
          const { amount } = await topUpForm.validateFields();
          topUpWallet(selectedAccount!.customerId, amount);
          message.success(`$${amount.toFixed(2)} added to wallet`);
          setTopUpModal(false);
        }}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } }}>
        <Form form={topUpForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Quick Amounts">
            <Space wrap>
              {[5, 10, 20, 50, 100].map((a) => (
                <Button key={a} size="small" onClick={() => topUpForm.setFieldValue('amount', a)}
                  style={{ borderRadius: 6 }}>${a}</Button>
              ))}
            </Space>
          </Form.Item>
          <Form.Item name="amount" label="Amount ($)" rules={[{ required: true }, { type: 'number', min: 1 }]}>
            <InputNumber prefix="$" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Tier Config Tab ──────────────────────────────────────────────────────────
function TiersTab() {
  const { tiers, updateTier } = useLoyalty();
  const [editing, setEditing] = useState<MembershipTier | null>(null);
  const [form] = Form.useForm();

  const openEdit = (t: MembershipTier) => {
    setEditing(t);
    form.setFieldsValue({ ...t, benefits: t.benefits.join('\n') });
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    updateTier(editing!.id, {
      ...values,
      benefits: (values.benefits as string).split('\n').map((s: string) => s.trim()).filter(Boolean),
    });
    message.success('Tier updated');
    setEditing(null);
  };

  return (
    <div>
      {/* Tier progression visual */}
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>Tier Progression</Text>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
          {tiers.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ textAlign: 'center', padding: '6px 12px', background: t.gradient, borderRadius: 8, minWidth: 80 }}>
                <div style={{ fontSize: 20 }}>{t.emoji}</div>
                <Text strong style={{ color: 'white', fontSize: 12 }}>{t.name}</Text>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10 }}>
                  {t.id === 'bronze' ? 'New member' : `$${t.minSpend}+`}
                </div>
              </div>
              {i < tiers.length - 1 && (
                <div style={{ width: 30, height: 2, background: 'linear-gradient(90deg, #d9d9d9, #d9d9d9)', margin: '0 2px' }}>
                  <div style={{ textAlign: 'center', fontSize: 16, marginTop: -11, color: '#d9d9d9' }}>›</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {tiers.map((t) => (
          <Col xs={24} sm={12} xl={6} key={t.id}>
            <Card bordered={false} style={{ borderRadius: 12, borderTop: `4px solid ${t.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <Space>
                  <span style={{ fontSize: 24 }}>{t.emoji}</span>
                  <div>
                    <Text strong style={{ fontSize: 15, color: t.color }}>{t.name}</Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                      {t.id === 'bronze' ? 'Starting tier' : `Spend $${t.minSpend}+`}
                    </Text>
                  </div>
                </Space>
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(t)} />
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Points multiplier</Text>
                  <Tag color="gold">{t.pointsMultiplier}×</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Auto-discount</Text>
                  <Tag color={t.discountRate > 0 ? 'green' : 'default'}>{t.discountRate}%</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Points rate</Text>
                  <Text style={{ fontSize: 11 }}>${(1 / t.pointsMultiplier).toFixed(2)} = 1pt</Text>
                </div>
              </div>

              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Benefits:</Text>
              {t.benefits.map((b) => (
                <div key={b} style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
                  <CheckCircleOutlined style={{ color: t.color, fontSize: 10, marginTop: 2, flexShrink: 0 }} />
                  <Text style={{ fontSize: 11 }}>{b}</Text>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Edit Tier Modal */}
      <Modal open={!!editing} onCancel={() => setEditing(null)} onOk={handleSave}
        title={`Edit ${editing?.name} Tier`}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } }}
        width={480} style={{ maxWidth: '95vw' }} centered>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="pointsMultiplier" label="Points Multiplier" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} max={10} step={0.25} precision={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="discountRate" label="Auto-Discount (%)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} max={50} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="minSpend" label="Min Lifetime Spend ($)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="benefits" label="Benefits (one per line)" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder="Earn 1x points per $1&#10;Access to member deals&#10;..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Main Loyalty Page ────────────────────────────────────────────────────────
export default function Loyalty() {
  const { vouchers, accounts } = useLoyalty();
  const activeVouchers = vouchers.filter((v) => v.isActive && new Date(v.expiryDate) >= new Date()).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Loyalty & Rewards</Title>
          <Text type="secondary">{accounts.length} members · {activeVouchers} active vouchers</Text>
        </div>
      </div>

      <Tabs
        defaultActiveKey="overview"
        type="card"
        items={[
          {
            key: 'overview',
            label: <Space size={4}><StarOutlined />Overview</Space>,
            children: <OverviewTab />,
          },
          {
            key: 'vouchers',
            label: (
              <Space size={4}>
                <TagOutlined />Vouchers
                <Badge count={activeVouchers} style={{ backgroundColor: '#667eea' }} />
              </Space>
            ),
            children: <VouchersTab />,
          },
          {
            key: 'members',
            label: (
              <Space size={4}>
                <UserOutlined />Members
                <Badge count={accounts.length} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            ),
            children: <MembersTab />,
          },
          {
            key: 'tiers',
            label: <Space size={4}><TrophyOutlined />Tier Config</Space>,
            children: <TiersTab />,
          },
        ]}
      />
    </div>
  );
}
