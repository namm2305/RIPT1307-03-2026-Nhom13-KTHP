import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Tag } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;
import { API_BASE } from '../../../config/api';

const ActivityLogTab: React.FC = () => {
  const token = localStorage.getItem('token');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (error) {
        console.error('Lỗi tải nhật ký:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => user ? (
        <Space>
            <img src={user.avatar} alt="avatar" style={{width: 24, height: 24, borderRadius: '50%'}} onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`; }} />
            <Text strong>{user.name}</Text>
            <Text type="secondary">({user.role})</Text>
        </Space>
      ) : 'Hệ thống'
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="blue">{action}</Tag>
    },
    {
      title: 'Chi tiết (IP)',
      dataIndex: 'details',
      key: 'details'
    }
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Nhật ký hoạt động</Title>} 
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Table columns={columns} dataSource={logs} rowKey="_id" pagination={{ pageSize: 15 }} />
      )}
    </Card>
  );
};

import { Space } from 'antd';

export default ActivityLogTab;
