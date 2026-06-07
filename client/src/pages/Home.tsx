import React from 'react';
import { Typography, Button, Row, Col, Card, Statistic, Space, Divider } from 'antd';
import { 
  BookOutlined, 
  TagsOutlined, 
  UserOutlined, 
  ArrowRightOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. Hero Section - Chào mừng */}
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        padding: '48px',
        borderRadius: '12px',
        color: '#fff',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)'
      }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Title level={1} style={{ color: '#fff', margin: 0, fontSize: '32px', fontWeight: 600 }}>
              Hệ Thống Quản Lý Thẻ Môn Học
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: '12px', fontSize: '16px' }}>
              Nền tảng hỗ trợ sinh viên quản lý thông tin, phân loại danh mục môn học và tối ưu hóa lộ trình học tập một cách trực quan, hiệu quả.
            </Paragraph>
            <Space size="middle" style={{ marginTop: '16px' }}>
              <Button 
                type="default" 
                size="large" 
                icon={<ThunderboltOutlined />} 
                onClick={() => navigate('/tags')}
                style={{ borderRadius: '6px', fontWeight: '500' }}
              >
                Khám phá ngay
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 2. Stats Section - Số liệu thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '8px' }}>
            <Statistic
              title={<Text type="secondary">Tổng số môn học</Text>}
              value={12}
              prefix={<BookOutlined style={{ color: '#1890ff', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '8px' }}>
            <Statistic
              title={<Text type="secondary">Thẻ (Tags) đã tạo</Text>}
              value={48}
              prefix={<TagsOutlined style={{ color: '#52c41a', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: '8px' }}>
            <Statistic
              title={<Text type="secondary">Thành viên nhóm</Text>}
              value={5}
              prefix={<UserOutlined style={{ color: '#faad14', marginRight: '8px' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: '32px 0' }} />

      {/* 3. Quick Actions - Lối tắt tính năng */}
      <Title level={3} style={{ marginBottom: '20px', fontWeight: 600 }}>Thao tác nhanh</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card 
            hoverable 
            style={{ borderRadius: '8px', borderLeft: '4px solid #1890ff' }}
            onClick={() => navigate('/tags')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignVertical: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>Quản lý thẻ môn học</Title>
                <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
                  Xem danh sách, chỉnh sửa hoặc thêm mới các thẻ phân loại.
                </Paragraph>
              </div>
              <ArrowRightOutlined style={{ fontSize: '18px', color: '#1890ff', alignSelf: 'center' }} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12}>
          <Card 
            hoverable 
            style={{ borderRadius: '8px', borderLeft: '4px solid #722ed1' }}
            onClick={() => navigate('/login')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignVertical: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>Tài khoản cá nhân</Title>
                <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
                  Đăng nhập hệ thống để đồng bộ cấu hình và dữ liệu của bạn.
                </Paragraph>
              </div>
              <ArrowRightOutlined style={{ fontSize: '18px', color: '#722ed1', alignSelf: 'center' }} />
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Home;