import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Space, Typography, Dropdown, Badge, List, Avatar } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { MessageOutlined, UserOutlined, LoginOutlined, BellOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const API_BASE = 'http://localhost:5050/api';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['home'];
    if (path.startsWith('/tags')) return ['tags'];
    if (path.startsWith('/admin')) return ['admin'];
    return [];
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleReadNotification = async (id: string, link: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      if (link) navigate(link);
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc');
    }
  };

  const handleReadAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi');
    }
  };

  const menuItems = [
    { key: 'home', label: <Link to="/">Trang chủ</Link> },
    { key: 'tags', label: <Link to="/tags">Thẻ môn học</Link> },
  ];

  if (user && ['admin', 'lecturer'].includes(user.role)) {
    menuItems.push({ key: 'admin', label: <Link to="/admin">Quản lý</Link> });
  }

  const notificationMenu = (
    <div style={{ width: 350, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && <Button type="link" size="small" onClick={handleReadAll}>Đánh dấu đã đọc tất cả</Button>}
      </div>
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        style={{ maxHeight: 400, overflowY: 'auto' }}
        renderItem={item => (
          <List.Item 
            style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: item.isRead ? '#fff' : '#e6f7ff' }}
            onClick={() => handleReadNotification(item._id, item.link)}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.sender?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=Sys`} />}
              title={<Text strong={!item.isRead}>{item.message}</Text>}
              description={new Date(item.createdAt).toLocaleString('vi-VN')}
            />
          </List.Item>
        )}
      />
      {notifications.length === 0 && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#8c8c8c' }}>Không có thông báo mới</div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ 
        position: 'sticky', top: 0, zIndex: 10, width: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#001529', padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={() => navigate('/')}>
          <MessageOutlined style={{ fontSize: '24px', color: '#1890ff', cursor: 'pointer' }} />
          <Title level={4} style={{ color: '#fff', margin: 0, cursor: 'pointer', fontSize: '18px' }}>
            PTIT Q&A Forum
          </Title>
        </div>

        <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKey()} items={menuItems} style={{ flex: 1, minWidth: 0, marginLeft: '32px' }} />

        <Space size="large">
          {user ? (
            <Space size="large">
              <Dropdown dropdownRender={() => notificationMenu} trigger={['click']} placement="bottomRight">
                <Badge count={unreadCount} overflowCount={99} style={{ cursor: 'pointer' }}>
                  <BellOutlined style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }} />
                </Badge>
              </Dropdown>
              <Button type="text" style={{ color: '#fff' }} onClick={() => navigate('/profile')}>
                <UserOutlined /> {user.name}
              </Button>
              <Button type="default" onClick={() => { logout(); navigate('/'); }}>
                Đăng xuất
              </Button>
            </Space>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        <div style={{ minHeight: '70vh' }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', color: '#8c8c8c', backgroundColor: '#f0f2f5' }}>
        PTIT Student Q&A Forum ©{new Date().getFullYear()} - Cấu trúc phát triển bởi Nhóm 13
      </Footer>
    </Layout>
  );
};

export default MainLayout;