import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Tag, Space, Modal, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
import { API_BASE } from '../../../config/api';

const ActivityLogTab: React.FC = () => {
  const token = localStorage.getItem('token');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentModal, setContentModal] = useState<{ visible: boolean; content: string; title: string }>({
    visible: false,
    content: '',
    title: ''
  });

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
      title: 'Người thực hiện',
      dataIndex: 'user',
      key: 'user',
      width: 180,
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
      title: 'Bài/Comment của',
      dataIndex: 'affectedUser',
      key: 'affectedUser',
      render: (affectedUser: any) => {
        if (!affectedUser) return '—';
        if (typeof affectedUser === 'string') return affectedUser;
        if (affectedUser.name) return affectedUser.name;
        if (affectedUser.email) return affectedUser.email;
        return '—';
      }
    },
    {
      title: 'Nội dung đã xóa',
      dataIndex: 'deletedContent',
      key: 'deletedContent',
      width: 120,
      render: (content: string, record: any) => content ? (
        <Tooltip title="Xem nội dung đã xóa">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => setContentModal({ 
              visible: true, 
              content, 
              title: record.action 
            })}
          >
            Xem
          </Button>
        </Tooltip>
      ) : <Text type="secondary">—</Text>
    },
    {
      title: 'Lý do xóa',
      dataIndex: 'details',
      key: 'details',
      render: (details: string) => {
        if (!details) return <Text type="secondary">—</Text>;
        const match = details.match(/Lý do:\s*(.+)/);
        return match ? match[1] : <Text type="secondary">—</Text>;
      }
    }
  ];

  return (
    <>
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

      <Modal
        title={contentModal.title}
        open={contentModal.visible}
        onCancel={() => setContentModal({ visible: false, content: '', title: '' })}
        footer={[
          <Button key="close" onClick={() => setContentModal({ visible: false, content: '', title: '' })}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        <div style={{ 
          maxHeight: 400, 
          overflow: 'auto', 
          padding: 16, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 8,
          border: '1px solid #d9d9d9'
        }}>
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {contentModal.content}
          </Paragraph>
        </div>
      </Modal>
    </>
  );
};

export default ActivityLogTab;
