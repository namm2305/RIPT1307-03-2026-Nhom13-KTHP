import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Typography, message, Modal, Input, Spin, Space } from 'antd';
import { SearchOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { confirm } = Modal;
import { API_BASE } from '../../../config/api';

const QuestionsTab: React.FC = () => {
  const token = localStorage.getItem('token');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/questions?search=${searchText}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setQuestions(res.data.questions);
      }
    } catch (error) {
      message.error('Lỗi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [searchText]);

  const handleDelete = (id: string, title: string) => {
    let reason = '';
    confirm({
      title: 'Xóa câu hỏi này?',
      content: (
        <div style={{ marginTop: 16 }}>
          <p>Câu hỏi "{title}" và tất cả bình luận sẽ bị xóa vĩnh viễn.</p>
          <p>Vui lòng nhập lý do xoá (bắt buộc):</p>
          <Input.TextArea 
            rows={3} 
            onChange={(e) => { reason = e.target.value; }} 
            placeholder="Ví dụ: Nội dung vi phạm nội quy, câu hỏi rác..."
          />
        </div>
      ),
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!reason.trim()) {
          message.error('Vui lòng nhập lý do xoá');
          return Promise.reject();
        }
        try {
          await axios.delete(`${API_BASE}/admin/questions/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { reason }
          });
          message.success('Đã xóa câu hỏi');
          fetchQuestions();
        } catch (error) {
          message.error('Lỗi khi xóa');
        }
      }
    });
  };



  const handleToggleSolve = async (id: string) => {
    try {
      await axios.put(`${API_BASE}/admin/questions/${id}/toggle-solve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Đã thay đổi trạng thái giải quyết');
      fetchQuestions();
    } catch (error) {
      message.error('Lỗi');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: any) => (
        <div>
          <a href={`/question/${record._id}`} target="_blank" rel="noreferrer"><Text strong style={{ color: '#1890ff' }}>{title}</Text></a>
          <div style={{ marginTop: 4 }}>
            {record.subject && <Tag color="blue">{record.subject.name}</Tag>}
            {record.tags?.map((t: string) => <Tag key={t}>{t}</Tag>)}
          </div>
        </div>
      )
    },
    {
      title: 'Người đăng',
      dataIndex: 'author',
      key: 'author',
      render: (author: any) => author?.name || 'Vô danh'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Tương tác',
      key: 'stats',
      render: (_: any, record: any) => (
        <div style={{ fontSize: 13 }}>
          <div>Views: {record.viewCount}</div>
          <div>Votes: {record.votes}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          {record.isSolved ? <Tag color="success">Đã giải quyết</Tag> : <Tag color="warning">Chưa giải quyết</Tag>}
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            size="small" 
            type={record.isSolved ? 'default' : 'primary'} 
            ghost={record.isSolved}
            icon={<CheckCircleOutlined />} 
            onClick={() => handleToggleSolve(record._id)}
          >
            {record.isSolved ? 'Bỏ Solve' : 'Solve'}
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id, record.title)} />
        </Space>
      )
    }
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Quản lý Câu Hỏi</Title>} 
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm tiêu đề câu hỏi..."
          style={{ width: 300 }}
          onSearch={value => setSearchText(value)}
          allowClear
        />
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Table columns={columns} dataSource={questions} rowKey="_id" pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />
      )}
    </Card>
  );
};

export default QuestionsTab;
