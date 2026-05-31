import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 'bold', marginRight: '40px', fontSize: '18px' }}>
          DevForum
        </div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
          <Menu.Item key="1"><Link to="/">Trang chủ</Link></Menu.Item>
        </Menu>
      </Header>
      
      <Content style={{ padding: '24px 50px', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: '24px', minHeight: '80vh', borderRadius: '8px' }}>
          {/* Vùng trống rỗng để các page khác hiển thị ở đây */}
          <Outlet />
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        DevForum ©2026 - Nền tảng hỏi đáp dành cho Lập trình viên
      </Footer>
    </Layout>
  );
};

export default MainLayout;