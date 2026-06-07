import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Typography, message, Select, Modal, Input, Spin, Avatar } from 'antd';
import { LockOutlined, UnlockOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const { Title, Text } = Typography;
const { confirm } = Modal;
import { API_BASE } from '../../../config/api';

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  admin:     { label: 'Quản trị viên', color: 'red' },
  moderator: { label: 'Kiểm duyệt viên', color: 'purple' },
  lecturer:  { label: 'Giảng viên', color: 'blue' },
  student:   { label: 'Sinh viên', color: 'default' },
};

const UsersTab: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/users?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error: any) {
      message.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string, userName: string) => {
    if (user?.role !== 'admin') {
      message.error('Chỉ Admin mới có quyền thay đổi vai trò');
      return;
    }
    confirm({
      title: 'Xác nhận thay đổi vai trò',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn muốn đổi vai trò của "${userName}" thành "${ROLE_MAP[newRole]?.label}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.put(`${API_BASE}/users/${userId}/role`, { role: newRole }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success(`Đã cập nhật vai trò cho ${userName}`);
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Lỗi khi cập nhật vai trò');
        }
      }
    });
  };

  const handleToggleActive = async (userId: string, userName: string, isActive: boolean) => {
    confirm({
      title: isActive ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?',
      icon: <ExclamationCircleOutlined />,
      content: isActive
        ? `Bạn có chắc muốn khóa tài khoản "${userName}"?`
        : `Bạn có muốn mở khóa tài khoản "${userName}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: isActive },
      onOk: async () => {
        try {
          await axios.put(`${API_BASE}/users/${userId}/toggle-active`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success(isActive ? `Đã khóa ${userName}` : `Đã mở khóa ${userName}`);
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Lỗi');
        }
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchText.toLowerCase()) || 
                        u.email?.toLowerCase().includes(searchText.toLowerCase()) || 
                        u.studentId?.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const columns = [
    {
      title: 'Tên & Liên hệ',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (name: string, record: any) => (
        <Space align="center" size="middle">
          <Avatar 
            src={record.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`} 
            size={48} 
            style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ fontSize: '14px', marginBottom: '2px' }}>{name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 180,
      render: (role: string, record: any) => {
        if (user?.role === 'admin' && record._id !== user?.id) {
          return (
            <Select
              value={role}
              size="small"
              style={{ width: 140 }}
              onChange={(val) => handleChangeRole(record._id, val, record.name)}
              options={[
                { value: 'student', label: '🎓 Sinh viên' },
                { value: 'lecturer', label: '👨‍🏫 Giảng viên' },
                { value: 'moderator', label: '🛡️ Kiểm duyệt' },
                { value: 'admin', label: '👑 Quản trị viên' },
              ]}
            />
          );
        }
        const cfg = ROLE_MAP[role] || ROLE_MAP.student;
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      }
    },
    {
      title: 'Khoa',
      dataIndex: 'faculty',
      key: 'faculty',
      width: 220,
      ellipsis: true,
      render: (f: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{f || '—'}</Text>
    },
    {
      title: 'Tương tác',
      key: 'interaction',
      width: 140,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0} style={{ fontSize: 13 }}>
          <Text type="secondary">Hỏi: <Text strong style={{ color: '#1890ff' }}>{record.postedQuestionsCount || 0}</Text></Text>
          <Text type="secondary">Đáp: <Text strong style={{ color: '#52c41a' }}>{record.postedAnswersCount || 0}</Text></Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (active: boolean) => active ? <Tag color="success">Hoạt động</Tag> : <Tag color="error">Đã khóa</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => {
        if (record._id === user?.id) return <Text type="secondary">Bạn</Text>;
        return (
          <Button
            size="small"
            danger={record.isActive}
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleActive(record._id, record.name, record.isActive)}
          >
            {record.isActive ? 'Khóa' : 'Mở khóa'}
          </Button>
        );
      }
    },
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Quản lý Người Dùng</Title>} 
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm tên, email, mssv..."
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
        <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 150 }}>
          <Select.Option value="all">Tất cả vai trò</Select.Option>
          <Select.Option value="student">Sinh viên</Select.Option>
          <Select.Option value="lecturer">Giảng viên</Select.Option>
          <Select.Option value="moderator">Kiểm duyệt</Select.Option>
          <Select.Option value="admin">Quản trị viên</Select.Option>
        </Select>
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }}>
          <Select.Option value="all">Tất cả trạng thái</Select.Option>
          <Select.Option value="active">Hoạt động</Select.Option>
          <Select.Option value="inactive">Đã khóa</Select.Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          rowKey="_id" 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`
          }} 
          scroll={{ x: 1000 }} 
          size="middle"
        />
      )}
    </Card>
  );
};

export default UsersTab;
