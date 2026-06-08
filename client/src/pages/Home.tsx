import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Row, Col, Card, Statistic, Space, Divider, List, Tabs, Tag } from 'antd';
import { 
  BookOutlined, 
  TagsOutlined, 
  UserOutlined, 
  ThunderboltOutlined,
  EyeOutlined, 
  MessageOutlined, 
  ClockCircleOutlined, 
  PlusOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  RocketOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE } from '../config/api';
import { useAuth } from '../context/AuthContext';

const { Title, Paragraph, Text } = Typography;

interface Question {
  _id: string;
  title: string;
  content: string;
  author: { name: string; avatar?: string } | string;
  tags: string[];
  viewCount?: number;
  views?: number;
  answersCount?: number;
  createdAt: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const pageSize = 5;

  useEffect(() => {
    if (!user) return;

    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/questions`);
        if (res.data && res.data.questions) {
          setQuestions(res.data.questions.map((q: any) => ({
            ...q,
            views: q.viewCount || 0,
            answersCount: q.answersCount || 0
          })));
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      }
    };

    fetchQuestions();
  }, [user]);

  const filteredQuestions = useMemo(() => {
    const questionsCopy = [...questions];
    
    if (activeTab === 'latest') {
      return questionsCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (activeTab === 'unanswered') {
      return questionsCopy.filter(q => (q.answersCount || 0) === 0);
    }
    if (activeTab === 'popular') {
      return questionsCopy.sort((a, b) => (b.views || b.viewCount || 0) - (a.views || a.viewCount || 0));
    }
    return questionsCopy;
  }, [activeTab, questions]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const tabItems = [
    { key: 'latest', label: 'Mới nhất' },
    { key: 'unanswered', label: 'Chưa trả lời' },
    { key: 'popular', label: 'Nhiều lượt xem' },
  ];

  if (!user) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)', paddingBottom: '60px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #001529 0%, #1890ff 100%)',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Title level={1} style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginBottom: '24px' }}>
            Cộng Đồng Hỏi Đáp Sinh Viên PTIT
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '20px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
            Nền tảng giúp sinh viên Học viện Công nghệ Bưu chính Viễn thông dễ dàng trao đổi kiến thức, giải đáp thắc mắc và chia sẻ tài liệu học tập.
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large" 
              style={{ height: '54px', padding: '0 40px', fontSize: '18px', borderRadius: '8px', background: '#faad14', borderColor: '#faad14', color: '#000', fontWeight: 'bold' }}
              onClick={() => navigate('/login')}
            >
              Tham Gia Ngay
            </Button>
            <Button 
              ghost 
              size="large" 
              style={{ height: '54px', padding: '0 40px', fontSize: '18px', borderRadius: '8px', borderWidth: '2px' }}
              onClick={() => navigate('/register')}
            >
              Tạo Tài Khoản
            </Button>
          </Space>
        </div>

        <div style={{ maxWidth: '1200px', margin: '-40px auto 0 auto', padding: '0 24px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                style={{ borderRadius: '16px', height: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none' }}
                styles={{ body: { padding: '40px 24px' } }}
              >
                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', background: '#e6f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketOutlined style={{ fontSize: '36px', color: '#1890ff' }} />
                </div>
                <Title level={3}>Hỏi Đáp Nhanh Chóng</Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                  Đăng câu hỏi và nhận câu trả lời từ hàng ngàn sinh viên, giảng viên PTIT trong thời gian ngắn nhất.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                style={{ borderRadius: '16px', height: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none' }}
                styles={{ body: { padding: '40px 24px' } }}
              >
                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', background: '#f6ffed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafetyCertificateOutlined style={{ fontSize: '36px', color: '#52c41a' }} />
                </div>
                <Title level={3}>Chất Lượng Đảm Bảo</Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                  Hệ thống bình chọn và xác thực từ chuyên gia giúp bạn luôn tìm được những câu trả lời chuẩn xác nhất.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card 
                hoverable
                style={{ borderRadius: '16px', height: '100%', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: 'none' }}
                styles={{ body: { padding: '40px 24px' } }}
              >
                <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', background: '#fff0f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TeamOutlined style={{ fontSize: '36px', color: '#eb2f96' }} />
                </div>
                <Title level={3}>Xây Dựng Cộng Đồng</Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                  Cùng nhau xây dựng môi trường học tập trực tuyến năng động, gắn kết sinh viên mọi khóa.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        padding: '48px',
        borderRadius: '12px',
        color: '#fff',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Title level={1} style={{ color: '#fff', margin: 0, fontSize: '32px', fontWeight: 600 }}>
            Hệ Thống Hỏi Đáp & Quản Lý Thẻ Môn Học
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: '12px', fontSize: '16px', maxWidth: '600px' }}>
            Nền tảng hỗ trợ sinh viên PTIT trao đổi, thảo luận, quản lý thông tin, phân loại danh mục môn học và tối ưu hóa lộ trình học tập một cách trực quan, hiệu quả.
          </Paragraph>
          <Space size="middle" style={{ marginTop: '16px' }}>
            <Button 
              size="large" 
              icon={<ThunderboltOutlined />} 
              onClick={() => navigate('/tags')}
              style={{ borderRadius: '6px', fontWeight: '500' }}
            >
              Khám phá Tags
            </Button>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/ask')}
              style={{ backgroundColor: '#f5222d', borderColor: '#f5222d', borderRadius: '6px', fontWeight: '500' }}
            >
              Đặt câu hỏi
            </Button>
          </Space>
        </div>
      </div>



      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3} style={{ margin: 0, fontWeight: 600 }}>Thảo luận gần đây</Title>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          size="middle"
          items={tabItems}
          style={{ marginBottom: 0 }}
        />
      </div>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredQuestions.length,
          onChange: (page) => setCurrentPage(page),
          align: 'center',
          style: { marginTop: '20px' }
        }}
        renderItem={(item: Question) => (
          <List.Item>
            <Card 
              hoverable 
              style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              styles={{ body: { padding: '20px 24px' } }}
              onClick={() => navigate(`/question/${item._id}`)}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <img 
                  src={item.author && typeof item.author === 'object' ? item.author.avatar : undefined} 
                  alt={item.author && typeof item.author === 'object' ? item.author.name : 'Unknown'} 
                  style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e6f7ff', objectFit: 'cover' }} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author && typeof item.author === 'object' ? item.author.name : 'Unknown'}`;
                  }}
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={5} style={{ margin: '0 0 8px 0', color: '#1890ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </Title>
                  
                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#595959', marginBottom: '12px' }}>
                    {item.content}
                  </Paragraph>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <Space size={[0, 8]} wrap>
                      {item.tags?.map(tag => (
                        <Tag color="blue" key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                    
                    <Space size="large" style={{ color: '#8c8c8c', fontSize: '13px' }} wrap>
                      <Space size="small">
                        <UserOutlined />
                        <Text type="secondary">{typeof item.author === 'object' ? item.author.name : item.author}</Text>
                      </Space>
                      <Space size="small">
                        <ClockCircleOutlined />
                        <span>{formatDate(item.createdAt)}</span>
                      </Space>
                      <Space size="small">
                        <EyeOutlined />
                        <span>{item.views} lượt xem</span>
                      </Space>
                      <Space size="small" style={{ color: (item.answersCount || 0) > 0 ? '#52c41a' : '#8c8c8c' }}>
                        <MessageOutlined />
                        <span style={{ fontWeight: (item.answersCount || 0) > 0 ? 'bold' : 'normal' }}>
                          {item.answersCount || 0} trả lời
                        </span>
                      </Space>
                    </Space>
                  </div>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Home;