import React from 'react';
import { Layout, Menu, Button, Typography, Space } from 'antd';
import { MessageOutlined, LoginOutlined, UserAddOutlined, HomeOutlined } from '@ant-design/icons';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {
  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
          <MessageOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '10px' }} />
          <Title level={4} style={{ margin: 0 }}>Student Q&A Forum</Title>
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['home']} style={{ flex: 1, borderBottom: 'none', marginLeft: '20px' }}>
          <Menu.Item key="home" icon={<HomeOutlined />}>Trang chủ</Menu.Item>
          <Menu.Item key="questions">Câu hỏi</Menu.Item>
          <Menu.Item key="tags">Thẻ</Menu.Item>
        </Menu>
        <Space>
          <Button icon={<LoginOutlined />}>Đăng nhập</Button>
          <Button type="primary" icon={<UserAddOutlined />}>Đăng ký</Button>
        </Space>
      </Header>
      
      <Content style={{ padding: '24px 50px' }}>
        <div className="site-layout-content" style={{ background: '#fff', padding: '24px', minHeight: '280px', borderRadius: '8px' }}>
          <Title level={2}>Chào mừng đến với Diễn đàn Hỏi Đáp Sinh viên</Title>
          <p>Nơi sinh viên và giảng viên có thể đặt câu hỏi, thảo luận và chia sẻ kiến thức.</p>
          
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
             <Title level={3}>Dự án đang được setup...</Title>
             <p></p>
          </div>
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center' }}>
        Nhóm 13
      </Footer>
    </Layout>
  );
};

export default App;
