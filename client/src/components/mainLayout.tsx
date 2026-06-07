import React from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { MessageOutlined, LoginOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

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

        {/* Nút Đăng nhập - placeholder, chưa có chức năng. Sẽ hoạt động khi ghép nhánh login */}
        <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
          Đăng nhập
        </Button>
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