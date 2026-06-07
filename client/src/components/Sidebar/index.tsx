import React from 'react';
import { Card, List, Tag, Avatar, Typography, Space, message } from 'antd';
import { FireOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

// Mock data
const popularTags = [
  { id: '1', name: 'ReactJS', count: 128 },
  { id: '2', name: 'Toán cao cấp', count: 85 },
  { id: '3', name: 'Lập trình C++', count: 64 },
  { id: '4', name: 'Cấu trúc dữ liệu', count: 52 },
  { id: '5', name: 'Machine Learning', count: 41 },
];

const topContributors = [
  { id: '1', name: 'Nguyễn Văn A', points: 1540, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: '2', name: 'Trần Thị B', points: 1230, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: '3', name: 'Lê Hoàng C', points: 985, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude' },
  { id: '4', name: 'Phạm Minh D', points: 840, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  { id: '5', name: 'Vũ Đức E', points: 720, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eden' },
];

const Sidebar: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Widget: Tags phổ biến */}
      <Card 
        title={
          <Space>
            <FireOutlined style={{ color: '#fa8c16' }} />
            <Text strong>Thẻ phổ biến</Text>
          </Space>
        }
        styles={{ body: { padding: '12px 20px' }, header: { padding: '0 20px', minHeight: '48px' } }}
        style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={popularTags}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0', border: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Link to={`/tags/${item.id}`}>
                  <Tag color="blue" style={{ cursor: 'pointer' }}>{item.name}</Tag>
                </Link>
                <Text type="secondary" style={{ fontSize: '12px' }}>x {item.count}</Text>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Widget: Bảng xếp hạng */}
      <Card 
        title={
          <Space>
            <TrophyOutlined style={{ color: '#fadb14' }} />
            <Text strong>Đóng góp nhiều nhất</Text>
          </Space>
        }
        styles={{ body: { padding: '12px 20px' }, header: { padding: '0 20px', minHeight: '48px' } }}
        style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={topContributors}
          renderItem={(item, index) => (
            <List.Item style={{ padding: '12px 0', borderBottom: index === topContributors.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                title={<Link to={`/user/${item.id}`} style={{ color: '#1d1d1d', fontWeight: 500 }}>{item.name}</Link>}
                description={<Text type="secondary" style={{ fontSize: '12px' }}>{item.points} điểm</Text>}
              />
            </List.Item>
          )}
        />
      </Card>

    </div>
  );
};

export default Sidebar;
