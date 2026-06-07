import React from 'react';
import { Layout, Menu, Button, Space, Typography, Dropdown, Avatar, Spin, message } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { MessageOutlined, UserOutlined, LoginOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!');
    navigate('/');
  };

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile_info',
      label: (
        <div style={{ padding: '4px 8px', minWidth: '160px' }}>
          <div style={{ fontWeight: 'bold', color: '#1d1d1d' }}>{user?.name}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
            {user?.role === 'student' ? 'Sinh viên' : user?.role === 'teacher' ? 'Giảng viên' : 'Quản trị viên'}
            {user?.faculty ? ` • ${user?.faculty}` : ''}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <Spin size="large" />
        <Text type="secondary">Đang kết nối hệ thống...</Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#001529',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={4} style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
            PTIT Q&A Forum
          </Title>
        </div>

        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          items={[
            { key: 'home', label: <Link to="/">Trang chủ</Link> },
            { key: 'tags', label: <Link to="/tags">Thẻ môn học</Link> },
          ]}
          style={{ flex: 1, minWidth: 0, marginLeft: '32px' }}
        />

        <Space>
          {user ? (
            <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: 'pointer', color: '#fff' }}>
                <Avatar 
                  style={{ backgroundColor: '#1890ff' }} 
                  icon={<UserOutlined />}
                />
                <Text style={{ color: '#fff', maxWidth: '120px' }} ellipsis>
                  {user.name}
                </Text>
                <DownOutlined style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }} />
              </Space>
            </Dropdown>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </Space>
      </Header>

      {/* Main Content Area */}
      <Content style={{ padding: '24px 50px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <div style={{ minHeight: '70vh' }}>
          <Outlet /> {/* Nơi các trang con như Home, Login, Detail sẽ hiển thị */}
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', color: '#8c8c8c', backgroundColor: '#f0f2f5' }}>
        PTIT Student Q&A Forum ©{new Date().getFullYear()} - Cấu trúc phát triển bởi Nhóm 13
      </Footer>
    </Layout>
  );
};

export default MainLayout;