import React from 'react';
import { Result, Button, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)',
      borderRadius: '16px',
      padding: '40px'
    }}>
      <Result
        status="404"
        title={<span style={{ fontSize: '72px', fontWeight: 900, color: '#1890ff', textShadow: '2px 2px 8px rgba(24,144,255,0.2)' }}>404</span>}
        subTitle={<span style={{ fontSize: '24px', color: '#595959' }}>Ối! Không tìm thấy trang này.</span>}
        extra={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', marginTop: '16px' }}>
            <Text type="secondary" style={{ maxWidth: '400px', fontSize: '16px' }}>
              Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không thể truy cập.
            </Text>
            <Button 
              type="primary" 
              size="large" 
              icon={<HomeOutlined />} 
              onClick={() => navigate('/')}
              style={{ 
                height: '48px', 
                padding: '0 32px', 
                fontSize: '16px',
                background: 'linear-gradient(90deg, #1890ff 0%, #722ed1 100%)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(24,144,255,0.39)'
              }}
            >
              Quay lại Trang chủ
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default NotFound;
