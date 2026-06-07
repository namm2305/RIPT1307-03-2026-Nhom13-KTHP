import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Typography, message, Modal, Input, Spin, Space, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { confirm } = Modal;
const API_BASE = 'http://localhost:5050/api';

const SubjectsTab: React.FC = () => {
  const token = localStorage.getItem('token');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/subjects/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSubjects(res.data.subjects);
      }
    } catch (error) {
      message.error('Lỗi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingSubject(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'Xóa môn học này?',
      content: `Môn học "${name}" sẽ bị xóa.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/subjects/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Đã xóa môn học');
          fetchSubjects();
        } catch (error) {
          message.error('Lỗi khi xóa');
        }
      }
    });
  };

  const handleSave = async (values: any) => {
    try {
      if (editingSubject) {
        await axios.put(`${API_BASE}/subjects/${editingSubject._id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Đã cập nhật môn học');
      } else {
        await axios.post(`${API_BASE}/subjects`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Đã thêm môn học mới');
      }
      setIsModalVisible(false);
      fetchSubjects();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const columns = [
    {
      title: 'Mã môn',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => isActive ? <Tag color="success">Đang mở</Tag> : <Tag color="error">Đóng</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id, record.name)} />
        </Space>
      )
    }
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Quản lý Môn Học</Title>} 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Table columns={columns} dataSource={subjects} rowKey="_id" pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
      )}

      <Modal
        title={editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="code" label="Mã môn học" rules={[{ required: true, message: 'Vui lòng nhập mã môn học' }]}>
            <Input placeholder="VD: INT1437" />
          </Form.Item>
          <Form.Item name="name" label="Tên môn học" rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}>
            <Input placeholder="VD: Lập trình Web" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái mở/đóng" valuePropName="checked" initialValue={true}>
             <Input type="checkbox" style={{ width: 20 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SubjectsTab;
