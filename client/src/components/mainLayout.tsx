import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Dropdown } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { MessageOutlined, LoginOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  const checkUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
    
    // Listen to storage event (triggered by other pages or manual dispatch)
    window.addEventListener('storage', checkUser);
    
    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Notify app of changes
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const menuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 999, 
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
          selectedKeys={[]}
          items={[
            { key: 'home', label: <Link to="/">Trang chủ</Link> },
            { key: 'tags', label: <Link to="/tags">Thẻ môn học</Link> },
          ]}
          style={{ flex: 1, minWidth: 0, marginLeft: '32px' }}
        />

        {/* Dynamic Auth Actions */}
        {user ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background 0.2s',
              backgroundColor: 'rgba(255,255,255,0.08)'
            }}>
              <img 
                src={user.avatar} 
                alt={user.name} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff' }} 
              />
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }} className="user-name-header">
                {user.name}
              </span>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
            <Button type="default" style={{ color: '#fff', backgroundColor: 'transparent', borderColor: '#d9d9d9' }} onClick={() => navigate('/register')}>
              Đăng ký
            </Button>
          </Space>
        )}
      </Header>

      {/* Main Content Area */}
      <Content style={{ padding: '24px 50px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <div style={{ minHeight: '70vh' }}>
          <Outlet />
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