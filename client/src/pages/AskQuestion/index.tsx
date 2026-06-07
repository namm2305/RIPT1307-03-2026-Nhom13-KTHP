import React, { useState, useEffect } from 'react';
import { Card, Input, Select, Button, Typography, Form, message, Space, Alert, Divider, Row, Col } from 'antd';
import { SendOutlined, BulbOutlined, EditOutlined, TagOutlined, InfoCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
const API_BASE = 'http://localhost:5050/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AskQuestion: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tagRes = await axios.get(`${API_BASE}/tags`);
        if (tagRes.data.success) setTags(tagRes.data.tags);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu phụ:', error);
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values: any) => {
    const { title, content, tags } = values;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập để đặt câu hỏi!');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: content,
          tags: tags
        })
      });

      const data = await res.json();
      if (data.success) {
        message.success('Đăng câu hỏi thành công!');
        setTimeout(() => navigate('/'), 1500);
      } else {
        message.error(data.message || 'Có lỗi xảy ra!');
        setLoading(false);
      }
    } catch (error) {
      message.error('Lỗi kết nối server!');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          width: 50, height: 50, borderRadius: 12, 
          background: 'linear-gradient(135deg, #1890ff, #722ed1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: '#fff', fontSize: 24, boxShadow: '0 4px 12px rgba(24,144,255,0.3)' 
        }}>
          <EditOutlined />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1d1d1d' }}>Tạo câu hỏi mới</Title>
          <Text type="secondary" style={{ fontSize: '15px' }}>
            Chia sẻ vấn đề của bạn để cộng đồng cùng thảo luận và hỗ trợ
          </Text>
        </div>
      </div>

      <Row gutter={24}>
        <Col span={24}>
          <Alert
            message="Mẹo để có câu trả lời tốt"
            description={
              <ul style={{ margin: 0, paddingLeft: 20, color: '#595959' }}>
                <li>Mô tả rõ ràng vấn đề bạn đang gặp phải.</li>
                <li>Đính kèm đoạn code hoặc ảnh chụp màn hình (nếu có).</li>
                <li>Chọn đúng môn học và thẻ (tags) để chuyên gia dễ dàng tìm thấy câu hỏi của bạn.</li>
                <li>Giữ thái độ tôn trọng và lịch sự với mọi người.</li>
              </ul>
            }
            type="info"
            showIcon
            icon={<BulbOutlined />}
            style={{ marginBottom: 24, borderRadius: 12, border: '1px solid #91d5ff', backgroundColor: '#e6f7ff' }}
          />

          <Card 
            style={{ 
              borderRadius: '16px', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)', 
              border: '1px solid #f0f0f0' 
            }}
            styles={{ body: { padding: '32px' } }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                name="title"
                label={
                  <Space>
                    <Text strong style={{ fontSize: 15 }}>Tiêu đề câu hỏi</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>(*)</Text>
                  </Space>
                }
                extra="Ngắn gọn, đi thẳng vào vấn đề. Ví dụ: 'Làm thế nào để kết nối MongoDB với Express?'"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề câu hỏi!' },
                  { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' }
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Nhập tiêu đề câu hỏi của bạn..." 
                  style={{ borderRadius: 8, padding: '10px 16px' }}
                />
              </Form.Item>

              <Form.Item
                name="tags"
                label={
                  <Space>
                    <TagOutlined style={{ color: '#722ed1' }} />
                    <Text strong style={{ fontSize: 15 }}>Thẻ (Tags)</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>(*)</Text>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng thêm ít nhất 1 thẻ!' },
                  { type: 'array', max: 5, message: 'Chỉ được chọn tối đa 5 thẻ!' }
                ]}
              >
                <Select
                  mode="tags"
                  size="large"
                  placeholder="Chọn hoặc nhập thẻ mới"
                  style={{ width: '100%' }}
                  tokenSeparators={[',']}
                >
                  {tags.map(tag => (
                    <Select.Option key={tag._id} value={tag.name}>{tag.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider style={{ margin: '12px 0 24px 0' }} />

              <Form.Item
                name="content"
                label={
                  <Space>
                    <Text strong style={{ fontSize: 15 }}>Nội dung chi tiết</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>(*)</Text>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập nội dung câu hỏi!' },
                  { min: 20, message: 'Nội dung câu hỏi phải có ít nhất 20 ký tự!' }
                ]}
                extra={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    <Text type="secondary">Mô tả chi tiết những gì bạn đang gặp khó khăn.</Text>
                  </div>
                }
              >
                <TextArea 
                  rows={10}
                  placeholder="Viết chi tiết câu hỏi ở đây..."
                  style={{ borderRadius: 8, padding: '12px 16px', fontSize: 15 }}
                />
              </Form.Item>

              <div style={{ marginTop: '40px', display: 'flex', gap: 16 }}>
                <Button 
                  type="primary" 
                  size="large" 
                  htmlType="submit" 
                  icon={<SendOutlined />} 
                  loading={loading}
                  style={{ 
                    borderRadius: 8, 
                    padding: '0 32px', 
                    height: 44,
                    background: 'linear-gradient(90deg, #1890ff, #096dd9)',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  Đăng câu hỏi
                </Button>
                <Button 
                  size="large" 
                  onClick={() => navigate(-1)}
                  style={{ borderRadius: 8, height: 44, padding: '0 24px' }}
                >
                  Hủy bỏ
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AskQuestion;
