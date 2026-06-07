import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Typography, message, Modal, Input, Spin, Space, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { confirm } = Modal;
import { API_BASE } from '../../../config/api';

const TagsTab: React.FC = () => {
  const token = localStorage.getItem('token');
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/tags`);
      if (res.data.success) {
        setTags(res.data.tags);
      }
    } catch (error) {
      message.error('Lỗi tải danh sách thẻ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingTag(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'Xóa thẻ này?',
      content: `Thẻ "${name}" sẽ bị xóa khỏi hệ thống.`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/tags/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Đã xóa thẻ');
          fetchTags();
        } catch (error) {
          message.error('Lỗi khi xóa');
        }
      }
    });
  };

  const handleSave = async (values: any) => {
    try {
      if (editingTag) {
        await axios.put(`${API_BASE}/tags/${editingTag._id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Đã cập nhật thẻ');
      } else {
        await axios.post(`${API_BASE}/tags`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Đã thêm thẻ mới');
      }
      setIsModalVisible(false);
      fetchTags();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Lỗi lưu dữ liệu');
    }
  };

  const columns = [
    {
      title: 'Tên Thẻ',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => <Tag color={record.color || 'blue'}>{name}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => <Tag color={color}>{color || 'blue'}</Tag>
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
      title={<Title level={4} style={{ margin: 0 }}>Quản lý Thẻ (Tags)</Title>} 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>}
      style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <Table columns={columns} dataSource={tags} rowKey="_id" pagination={{ pageSize: 10 }} scroll={{ x: 600 }} />
      )}

      <Modal
        title={editingTag ? 'Sửa thẻ' : 'Thêm thẻ mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Tên thẻ" rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}>
            <Input placeholder="VD: ReactJS" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="color" label="Màu sắc (Tùy chọn, vd: blue, red, green, gold)" initialValue="blue">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TagsTab;
