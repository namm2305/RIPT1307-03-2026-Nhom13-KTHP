import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, Select, Tabs, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const faculties = [
  'Công nghệ thông tin 1',
  'Công nghệ thông tin 2',
  'An toàn thông tin',
  'Viễn thông 1',
  'Viễn thông 2',
  'Điện tử 1',
  'Điện tử 2',
  'Đa phương tiện',
  'Quản trị kinh doanh',
  'Tài chính Kế toán',
  'Marketing'
];

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLoginSubmit = async (values: any) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err: any) {
      message.error(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (values: any) => {
    setLoading(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        faculty: values.faculty
      });
      message.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (err: any) {
      message.error(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: 'Đăng nhập',
      children: (
        <Form
          name="login_form"
          layout="vertical"
          onFinish={handleLoginSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email sinh viên / giảng viên"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
              placeholder="example@student.ptit.edu.vn" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              style={{ height: '45px', fontSize: '16px', fontWeight: 'bold' }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'register',
      label: 'Đăng ký tài khoản',
      children: (
        <Form
          name="register_form"
          layout="vertical"
          onFinish={handleRegisterSubmit}
          requiredMark={false}
          initialValues={{ role: 'student' }}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
              placeholder="Nguyễn Văn A" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} 
              placeholder="nguyenvana@gmail.com" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Bạn là:"
            rules={[{ required: true }]}
          >
            <Radio.Group optionType="button" buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
              <Radio.Button value="student" style={{ flex: 1, textAlign: 'center' }}>Sinh viên</Radio.Button>
              <Radio.Button value="teacher" style={{ flex: 1, textAlign: 'center' }}>Giảng viên</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="faculty"
            label="Khoa / Viện đào tạo"
            rules={[{ required: true, message: 'Vui lòng chọn Khoa/Viện đào tạo!' }]}
          >
            <Select
              placeholder="Chọn Khoa/Viện của bạn"
              size="large"
              suffixIcon={<BookOutlined />}
            >
              {faculties.map(fac => (
                <Option key={fac} value={fac}>{fac}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
              style={{ height: '45px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            >
              Đăng ký tài khoản
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
      minHeight: '65vh'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '480px', 
          borderRadius: '12px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}
        styles={{ body: { padding: '32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>Diễn đàn Học tập PTIT</Title>
          <Paragraph type="secondary" style={{ marginTop: '4px' }}>
            Kết nối, học tập và chia sẻ cùng cộng đồng sinh viên Học viện
          </Paragraph>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => {
            setActiveTab(key);
            form.resetFields();
          }}
          centered
          items={tabItems}
          style={{ marginBottom: '12px' }}
        />
      </Card>
    </div>
  );
};

export default Login;
