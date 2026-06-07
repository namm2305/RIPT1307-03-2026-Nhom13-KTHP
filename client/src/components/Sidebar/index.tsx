import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Avatar, Typography, Space, Spin } from 'antd';
import { FireOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Text } = Typography;
const API_BASE = 'http://localhost:5050/api';

const Sidebar: React.FC = () => {
  const [popularTags, setPopularTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(`${API_BASE}/questions/tags`);
        if (res.data.success) {
          setPopularTags(res.data.tags.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching popular tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
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
        {loadingTags ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}><Spin size="small" /></div>
        ) : popularTags.length === 0 ? (
          <Text type="secondary">Chưa có thẻ nào.</Text>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={popularTags}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Link to={`/tags/${item.name}`}>
                    <Tag color="blue" style={{ cursor: 'pointer' }}>{item.name}</Tag>
                  </Link>
                  <Text type="secondary" style={{ fontSize: '12px' }}>x {item.count}</Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

    </div>
  );
};

export default Sidebar;
