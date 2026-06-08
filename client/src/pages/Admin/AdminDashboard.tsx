import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, message, Layout, Menu } from 'antd';
import { 
  DashboardOutlined, TeamOutlined, QuestionCircleOutlined, 
  BookOutlined, TagsOutlined, FileTextOutlined, SafetyCertificateOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import QuestionsTab from './components/QuestionsTab';
import TagsTab from './components/TagsTab';
import ActivityLogTab from './components/ActivityLogTab';

const { Title, Text } = Typography;
const { Sider, Content } = Layout;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (!user) {
      message.warning('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      message.error('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const menuItems = [
    { key: 'overview', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: 'users', icon: <TeamOutlined />, label: 'Người dùng' },
    { key: 'questions', icon: <QuestionCircleOutlined />, label: 'Câu hỏi' },
    { key: 'tags', icon: <TagsOutlined />, label: 'Thẻ (Tags)' },
  ];

  if (user.role === 'admin') {
    menuItems.push({ key: 'logs', icon: <FileTextOutlined />, label: 'Nhật ký' });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'users': return <UsersTab />;
      case 'questions': return <QuestionsTab />;
      case 'tags': return <TagsTab />;
      case 'logs': return <ActivityLogTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)', background: '#f0f2f5' }}>
      <Sider 
        width={250} 
        theme="light" 
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          marginRight: '24px', 
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '24px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
            <SafetyCertificateOutlined style={{ marginRight: 8 }} />
            Quản Lý Hệ Thống
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
          items={menuItems}
          style={{ borderRight: 0, padding: '8px 0' }}
        />
      </Sider>
      
      <Layout style={{ background: 'transparent' }}>
        <Content style={{ margin: 0, minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
