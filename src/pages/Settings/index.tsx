import { useState } from 'react';
import {
  Row, Col, Card, Typography, Form, Input, InputNumber, Switch, Select,
  Button, Divider, Avatar, Upload, Space, Tabs, message, Tag,
} from 'antd';
import {
  SettingOutlined, ShopOutlined, DollarOutlined, PrinterOutlined,
  UserOutlined, BellOutlined, SecurityScanOutlined, UploadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    message.success('Settings saved successfully');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabItems = [
    {
      key: 'store',
      label: <Space><ShopOutlined />Store</Space>,
      children: (
        <Form layout="vertical">
          <Row gutter={24}>
            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
              <Avatar
                size={100}
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: 40, marginBottom: 12 }}
              >
                S
              </Avatar>
              <div>
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />} size="small">Change Logo</Button>
                </Upload>
              </div>
            </Col>
            <Col xs={24} sm={16}>
              <Form.Item label="Store Name" initialValue="SwiftPOS Demo Store">
                <Input />
              </Form.Item>
              <Form.Item label="Store Email" initialValue="store@swiftpos.com">
                <Input />
              </Form.Item>
              <Form.Item label="Phone" initialValue="+1-555-0100">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Address">
                <Input.TextArea rows={2} defaultValue="123 Commerce St, New York, NY 10001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Business Hours">
                <Input.TextArea rows={2} defaultValue="Mon–Fri: 8AM–9PM&#10;Sat–Sun: 9AM–6PM" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Timezone">
                <Select defaultValue="America/New_York" options={[
                  { value: 'America/New_York', label: 'Eastern Time (ET)' },
                  { value: 'America/Chicago', label: 'Central Time (CT)' },
                  { value: 'America/Denver', label: 'Mountain Time (MT)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Currency">
                <Select defaultValue="USD" options={[
                  { value: 'USD', label: '🇺🇸 USD - US Dollar' },
                  { value: 'EUR', label: '🇪🇺 EUR - Euro' },
                  { value: 'GBP', label: '🇬🇧 GBP - British Pound' },
                  { value: 'JPY', label: '🇯🇵 JPY - Japanese Yen' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'tax',
      label: <Space><DollarOutlined />Tax & Pricing</Space>,
      children: (
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Default Tax Rate (%)">
                <InputNumber defaultValue={10} min={0} max={100} suffix="%" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Tax Name">
                <Input defaultValue="Sales Tax" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Price Display">
                <Select defaultValue="include" options={[
                  { value: 'include', label: 'Include Tax in Price' },
                  { value: 'exclude', label: 'Add Tax at Checkout' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Discount Limit (%)">
                <InputNumber defaultValue={20} min={0} max={100} suffix="%" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Title level={5}>Quick Discount Presets</Title>
          <Space wrap>
            {[5, 10, 15, 20, 25].map(p => (
              <Tag key={p} closable color="blue">{p}%</Tag>
            ))}
            <Button size="small" type="dashed">+ Add</Button>
          </Space>
        </Form>
      ),
    },
    {
      key: 'receipt',
      label: <Space><PrinterOutlined />Receipt</Space>,
      children: (
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Receipt Header">
                <Input.TextArea rows={2} defaultValue="Thank you for your purchase!" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Receipt Footer">
                <Input.TextArea rows={2} defaultValue="Please come again. Have a great day!" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Paper Size">
                <Select defaultValue="80mm" options={[
                  { value: '58mm', label: '58mm' },
                  { value: '80mm', label: '80mm (Standard)' },
                  { value: 'A4', label: 'A4' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Printer Name">
                <Input defaultValue="POS-Printer-01" />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          {[
            { label: 'Auto-print receipt after payment', defaultChecked: true },
            { label: 'Print logo on receipt', defaultChecked: true },
            { label: 'Show tax breakdown', defaultChecked: true },
            { label: 'Include barcode on receipt', defaultChecked: false },
            { label: 'Email receipt option', defaultChecked: false },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text>{item.label}</Text>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </Form>
      ),
    },
    {
      key: 'users',
      label: <Space><UserOutlined />Users</Space>,
      children: (
        <div>
          {[
            { name: 'John Doe', role: 'Manager', email: 'john@store.com', active: true },
            { name: 'Sarah Miller', role: 'Cashier', email: 'sarah@store.com', active: true },
            { name: 'Mike Johnson', role: 'Cashier', email: 'mike@store.com', active: false },
          ].map(user => (
            <div key={user.email} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid #f5f5f5',
            }}>
              <Space>
                <Avatar style={{ background: '#667eea' }}>{user.name[0]}</Avatar>
                <div>
                  <Text strong style={{ display: 'block' }}>{user.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
                </div>
              </Space>
              <Space>
                <Tag color={user.role === 'Manager' ? 'purple' : 'blue'}>{user.role}</Tag>
                <Tag color={user.active ? 'green' : 'default'}>{user.active ? 'Active' : 'Inactive'}</Tag>
                <Button size="small" type="text" icon={<SettingOutlined />} />
              </Space>
            </div>
          ))}
          <Button
            type="dashed" block style={{ marginTop: 16, borderRadius: 8 }}
            icon={<UserOutlined />}
          >
            Add New User
          </Button>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: <Space><BellOutlined />Notifications</Space>,
      children: (
        <Form layout="vertical">
          <Title level={5} style={{ marginBottom: 16 }}>Alert Settings</Title>
          {[
            { label: 'Low stock alerts', desc: 'Get notified when stock falls below threshold', defaultChecked: true },
            { label: 'Daily sales summary', desc: 'Receive end-of-day revenue report', defaultChecked: true },
            { label: 'New order notification', desc: 'Alert for each new order placed', defaultChecked: false },
            { label: 'Refund notifications', desc: 'Alert when a refund is processed', defaultChecked: true },
            { label: 'System updates', desc: 'Notify about system maintenance and updates', defaultChecked: false },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid #f5f5f5',
            }}>
              <div>
                <Text strong style={{ display: 'block' }}>{item.label}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
          <Divider />
          <Form.Item label="Low Stock Threshold">
            <InputNumber defaultValue={10} min={1} style={{ width: 120 }} suffix="units" />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'security',
      label: <Space><SecurityScanOutlined />Security</Space>,
      children: (
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Current Password">
                <Input.Password placeholder="Enter current password" />
              </Form.Item>
              <Form.Item label="New Password">
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
              <Form.Item label="Confirm Password">
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
              <Button type="primary" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                Update Password
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Title level={5}>Security Options</Title>
              {[
                { label: 'Two-factor authentication', defaultChecked: false },
                { label: 'Auto-logout after inactivity (30 min)', defaultChecked: true },
                { label: 'Require PIN for refunds', defaultChecked: true },
                { label: 'Require manager approval for discounts > 15%', defaultChecked: false },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 13 }}>{item.label}</Text>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </Col>
          </Row>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Settings</Title>
        <Text type="secondary">Configure your POS system</Text>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs
          items={tabItems}
          tabPosition="left"
          style={{ minHeight: 500 }}
        />
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button style={{ borderRadius: 8 }}>Reset to Defaults</Button>
          <Button
            type="primary"
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none', borderRadius: 8, minWidth: 120,
            }}
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
