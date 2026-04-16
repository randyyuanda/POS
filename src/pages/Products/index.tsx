import { useState } from 'react';
import {
  Card, Table, Button, Input, Tag, Space, Typography, Modal, Form, InputNumber,
  Select, Popconfirm, message, Row, Col, Statistic, Avatar,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  AppstoreOutlined, WarningOutlined,
} from '@ant-design/icons';
import { products as initialProducts, categories } from '../../data/mockData';
import type { Product } from '../../types';

const { Title, Text } = Typography;

export default function Products() {
  const [data, setData] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const filtered = data.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleEdit = (product: Product) => {
    setEditing(product);
    form.setFieldsValue(product);
    setModal(true);
  };

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModal(true);
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(p => p.id !== id));
    message.success('Product deleted');
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editing) {
      setData(prev => prev.map(p => p.id === editing.id ? { ...p, ...values } : p));
      message.success('Product updated');
    } else {
      const newProduct: Product = {
        ...values,
        id: Date.now().toString(),
        image: `https://placehold.co/80x80/667eea/white?text=${values.name[0]}`,
      };
      setData(prev => [...prev, newProduct]);
      message.success('Product added');
    }
    setModal(false);
  };

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, r: Product) => (
        <Space>
          <Avatar src={r.image} shape="square" size={40} style={{ borderRadius: 6 }} />
          <div>
            <Text strong style={{ display: 'block', fontSize: 13 }}>{r.name}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>SKU: {r.sku}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => <Text strong>${v.toFixed(2)}</Text>,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (v: number) => (
        <Space>
          {v <= 10 ? <WarningOutlined style={{ color: '#ff4d4f' }} /> : null}
          <Tag color={v > 20 ? 'green' : v > 10 ? 'orange' : 'red'}>{v}</Tag>
        </Space>
      ),
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, r: Product) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Popconfirm
            title="Delete product?" description="This action cannot be undone."
            onConfirm={() => handleDelete(r.id)} okText="Delete" okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const lowStock = data.filter(p => p.stock <= 10).length;
  const totalValue = data.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Products</Title>
        <Text type="secondary">Manage your product catalog</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Products', value: data.length, icon: <AppstoreOutlined />, color: '#667eea' },
          { title: 'Low Stock Items', value: lowStock, icon: <WarningOutlined />, color: '#fa8c16' },
          { title: 'Inventory Value', value: `$${totalValue.toFixed(0)}`, icon: <AppstoreOutlined />, color: '#52c41a' },
          { title: 'Categories', value: categories.length - 1, icon: <AppstoreOutlined />, color: '#764ba2' },
        ].map(stat => (
          <Col xs={12} lg={6} key={stat.title}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                valueStyle={{ fontSize: 24, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search products or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 180px', minWidth: 160, maxWidth: 300 }}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ flex: '1 1 140px', minWidth: 130, maxWidth: 200 }}
            options={categories.map(c => ({ value: c, label: c }))}
          />
          <Button
            type="primary" icon={<PlusOutlined />} onClick={handleAdd}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: 8, marginLeft: 'auto' }}
          >
            Add Product
          </Button>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        open={modal}
        onCancel={() => setModal(false)}
        onOk={handleSave}
        title={editing ? 'Edit Product' : 'Add New Product'}
        okText={editing ? 'Save Changes' : 'Add Product'}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } }}
        width={500}
        style={{ maxWidth: '95vw' }}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col xs={24} sm={14}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} precision={2} prefix="$" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={categories.slice(1).map(c => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
