import React, { useState } from 'react';
import { Card, Input, Select, Button, Typography, Form, message, Space } from 'antd';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import { SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import mockQuestions from '../../mocks/mockQuestions.json';

const { Title, Text } = Typography;

const AskQuestion: React.FC = () => {
  const [content, setContent] = useState<string | undefined>('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useAuth();

  const onFinish = (values: any) => {
    if (!content || content.trim().length < 20) {
      message.error('Nội dung câu hỏi phải có ít nhất 20 ký tự!');
      return;
    }

    const newQuestion = {
      id: Date.now().toString(),
      title: values.title,
      content: content,
      author: user ? user.name : 'Người dùng ẩn danh',
      avatar: user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      tags: values.tags,
      views: 0,
      answersCount: 0,
      createdAt: new Date().toISOString()
    };

    const existingData = localStorage.getItem('questions');
    let questionsList = existingData ? JSON.parse(existingData) : mockQuestions;
    
    questionsList = [newQuestion, ...questionsList];
    localStorage.setItem('questions', JSON.stringify(questionsList));

    message.success('Đăng câu hỏi thành công!');
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Đặt câu hỏi</Title>
        <Text type="secondary">
          Hãy đưa ra câu hỏi thật cụ thể và chi tiết để cộng đồng có thể dễ dàng hỗ trợ bạn.
        </Text>
      </div>

      <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          {/* Tiêu đề */}
          <Form.Item
            name="title"
            label={<Text strong>Tiêu đề câu hỏi</Text>}
            extra="Ngắn gọn, đi thẳng vào vấn đề. Ví dụ: 'Cách giải phương trình vi phân tuyến tính cấp 1?'"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề câu hỏi!' },
              { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' }
            ]}
          >
            <Input size="large" placeholder="Nhập tiêu đề câu hỏi của bạn..." />
          </Form.Item>

          {/* Nội dung */}
          <Form.Item
            label={<Text strong>Nội dung chi tiết</Text>}
            required
            extra="Mô tả chi tiết những gì bạn đang gặp khó khăn. Bạn có thể sử dụng Markdown để chèn code, ảnh hoặc in đậm."
          >
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={setContent}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
                height={400}
                textareaProps={{
                  placeholder: "Viết chi tiết câu hỏi ở đây. Có thể dùng markdown..."
                }}
              />
            </div>
          </Form.Item>

          {/* Thẻ (Tags) */}
          <Form.Item
            name="tags"
            label={<Text strong>Thẻ (Tags)</Text>}
            extra="Thêm tối đa 5 thẻ liên quan đến câu hỏi. Ấn Enter để thêm thẻ mới."
            rules={[
              { required: true, message: 'Vui lòng thêm ít nhất 1 thẻ!' },
              { type: 'array', max: 5, message: 'Chỉ được chọn tối đa 5 thẻ!' }
            ]}
          >
            <Select
              mode="tags"
              size="large"
              placeholder="Ví dụ: Giải tích 1, ReactJS, OOP, C++..."
              style={{ width: '100%' }}
              tokenSeparators={[',']}
              options={[
                { value: 'Giải tích 1', label: 'Giải tích 1' },
                { value: 'ReactJS', label: 'ReactJS' },
                { value: 'Lập trình C++', label: 'Lập trình C++' },
                { value: 'Toán rời rạc', label: 'Toán rời rạc' },
              ]}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Space>
              <Button type="primary" size="large" htmlType="submit" icon={<SendOutlined />} style={{ background: '#1890ff' }}>
                Đăng câu hỏi
              </Button>
              <Button size="large" onClick={() => navigate(-1)}>
                Hủy bỏ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AskQuestion;
