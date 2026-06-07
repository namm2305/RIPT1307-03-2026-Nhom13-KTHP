import React, { useState, useMemo, useEffect } from 'react';
import { List, Card, Tabs, Tag, Space, Typography, Button, Row, Col } from 'antd';
import { EyeOutlined, MessageOutlined, ClockCircleOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import mockQuestions from '../mocks/mockQuestions.json';
import tagsData from '../mocks/tagsData.json';
import Sidebar from '../components/Sidebar';

const { Text, Paragraph, Title } = Typography;

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  tags: string[];
  views: number;
  answersCount: number;
  createdAt: string;
}

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const pageSize = 3; // Số câu hỏi trên một trang
  const navigate = useNavigate();

  useEffect(() => {
    const existingData = localStorage.getItem('questions');
    if (existingData) {
      setQuestions(JSON.parse(existingData));
    } else {
      setQuestions(mockQuestions as Question[]);
    }
  }, []);

  const filteredQuestions = useMemo(() => {
    const questionsCopy = [...questions];
    
    if (activeTab === 'latest') {
      return questionsCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (activeTab === 'unanswered') {
      return questionsCopy.filter(q => q.answersCount === 0);
    }
    if (activeTab === 'popular') {
      return questionsCopy.sort((a, b) => b.views - a.views);
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

  return (
    <Row gutter={24}>
      {/* Cột trái (Nội dung chính) */}
      <Col xs={24} lg={18}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Banner chào mừng & Nút Đặt câu hỏi nhanh */}
          <Card style={{ background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>Chào mừng bạn đến với Diễn đàn Học tập PTIT</Title>
                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>Nơi trao đổi, thảo luận và giải đáp mọi thắc mắc về các môn học chuyên ngành.</Text>
              </div>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/ask')} style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }}>
                Đặt câu hỏi
              </Button>
            </div>
          </Card>

          {/* Tabs Bộ lọc chính */}
          <Card styles={{ body: { padding: '0 24px' } }}>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              size="large"
              items={tabItems}
            />
          </Card>

          {/* Danh sách Câu hỏi */}
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
                  style={{ width: '100%', borderRadius: '8px' }}
                  styles={{ body: { padding: '20px 24px' } }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <img src={item.avatar} alt={item.author} style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e6f7ff' }} />
                    
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: '0 0 8px 0', color: '#1d1d1d' }}>
                        <a href={`/question/${item.id}`} style={{ color: 'inherit' }}>{item.title}</a>
                      </Title>
                      
                      <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#595959', marginBottom: '12px' }}>
                        {item.content}
                      </Paragraph>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <Space size={[0, 4]} wrap>
                          {item.tags.map(tag => {
                            const foundTag = tagsData.find(t => t.name === tag);
                            return (
                              <Tag 
                                color="blue" 
                                key={tag} 
                                style={{ cursor: 'pointer' }} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  navigate(foundTag ? `/tags/${foundTag.id}` : `/tags`); 
                                }}
                              >
                                {tag}
                              </Tag>
                            );
                          })}
                        </Space>
                        
                        <Space size="large" style={{ color: '#8c8c8c', fontSize: '13px' }}>
                          <Space size="small">
                            <UserOutlined />
                            <Text type="secondary">{item.author}</Text>
                          </Space>
                          <Space size="small">
                            <ClockCircleOutlined />
                            <span>{formatDate(item.createdAt)}</span>
                          </Space>
                          <Space size="small">
                            <EyeOutlined />
                            <span>{item.views} lượt xem</span>
                          </Space>
                          <Space size="small" style={{ color: item.answersCount > 0 ? '#52c41a' : '#8c8c8c' }}>
                            <MessageOutlined />
                            <span style={{ fontWeight: item.answersCount > 0 ? 'bold' : 'normal' }}>
                              {item.answersCount} trả lời
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
      </Col>

      {/* Cột phải (Sidebar) */}
      <Col xs={24} lg={6}>
        <Sidebar />
      </Col>
    </Row>
  );
};

export default Home;