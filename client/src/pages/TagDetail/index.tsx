import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, List, Space, Tag, Button, Row, Col, Tabs, Avatar, message, Spin } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, MessageOutlined, ClockCircleOutlined, UserOutlined, FireOutlined, TrophyOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

import { API_BASE } from '../../config/api';

interface Question {
  _id: string;
  title: string;
  content: string;
  author: { name: string, avatar: string };
  tags: string[];
  viewCount: number;
  answersCount: number;
  createdAt: string;
}

const TagDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tagInfo, setTagInfo] = useState<any>(null);
  const [relatedTags, setRelatedTags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('latest');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tagsRes = await axios.get(`${API_BASE}/questions/tags`);
        let searchTag = decodeURIComponent(id || '');
        if (tagsRes.data.success) {
          const allTags = tagsRes.data.tags;
          const decodedId = decodeURIComponent(id || '');
          const normalize = (str: string) => str ? str.normalize('NFC').trim().toLowerCase() : '';
          const normalizedId = normalize(decodedId);
          
          const currentTag = allTags.find((t: any) => 
            normalize(t.name) === normalizedId || 
            normalize(t.id) === normalizedId
          );

          if (currentTag) {
            setTagInfo(currentTag);
            setRelatedTags(allTags.filter((t: any) => t.name !== currentTag.name).slice(0, 5));
            searchTag = currentTag.name;
          }
        }

        const qRes = await axios.get(`${API_BASE}/questions?tag=${encodeURIComponent(searchTag)}&limit=100`);
        if (qRes.data.success) {
          setQuestions(qRes.data.questions);
        }
      } catch (error) {
        console.error('Error fetching tag data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const filteredQuestions = useMemo(() => {
    const qCopy = [...questions];
    if (activeTab === 'latest') {
      return qCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'unanswered') {
      return qCopy.filter(q => q.answersCount === 0);
    } else if (activeTab === 'popular') {
      return qCopy.sort((a, b) => b.viewCount - a.viewCount);
    }
    return qCopy;
  }, [questions, activeTab]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tagInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Title level={3}>Không tìm thấy thẻ môn học "{decodeURIComponent(id || '')}"</Title>
        <Button onClick={() => navigate('/tags')} type="primary">Quay lại danh sách thẻ</Button>
      </div>
    );
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      message.success(`Đã theo dõi thẻ ${tagInfo.name}`);
    } else {
      message.info(`Đã bỏ theo dõi thẻ ${tagInfo.name}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/tags')}
        style={{ padding: 0, width: 'fit-content', color: '#8c8c8c' }}
      >
        Quay lại Thẻ môn học
      </Button>

      <Row gutter={24}>
        <Col xs={24} lg={17}>
          <Card style={{ borderRadius: '12px', borderLeft: '4px solid #1890ff', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Space align="center" style={{ marginBottom: '8px' }}>
                  <Title level={2} style={{ margin: 0 }}>{tagInfo.name}</Title>
                  {tagInfo.count > 10 && <Tag color="red" icon={<FireOutlined />}>Trending</Tag>}
                </Space>
                <Paragraph style={{ color: '#595959', fontSize: '15px', maxWidth: '800px' }}>
                  {tagInfo.description}
                </Paragraph>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
              <Button 
                type={isFollowing ? 'default' : 'primary'} 
                icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
                onClick={handleFollow}
              >
                {isFollowing ? 'Đang theo dõi' : 'Theo dõi thẻ này'}
              </Button>
              <Button onClick={() => navigate('/ask')}>Đặt câu hỏi với thẻ này</Button>
            </div>
          </Card>

          <Card styles={{ body: { padding: '0 24px' } }} style={{ marginBottom: '20px' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              items={[
                { key: 'latest', label: 'Mới nhất' },
                { key: 'unanswered', label: 'Chưa trả lời' },
                { key: 'popular', label: 'Nhiều lượt xem' },
              ]}
            />
          </Card>

          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={filteredQuestions}
            locale={{ emptyText: 'Chưa có câu hỏi nào trong thẻ này.' }}
            pagination={{
              pageSize: 10,
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
                    <img src={item.author?.avatar} alt={item.author?.name} style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#e6f7ff' }} />
                    
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: '0 0 8px 0', color: '#1d1d1d' }}>
                        <a href={`/question/${item._id}`} style={{ color: 'inherit' }}>{item.title}</a>
                      </Title>
                      
                      <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#595959', marginBottom: '12px' }}>
                        {item.content}
                      </Paragraph>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <Space size={[0, 4]} wrap>
                          {item.tags.map(tag => (
                            <Tag color={tag === tagInfo.name ? "geekblue" : "default"} key={tag}>{tag}</Tag>
                          ))}
                        </Space>
                        
                        <Space size="large" style={{ color: '#8c8c8c', fontSize: '13px' }}>
                          <Space size="small">
                            <UserOutlined />
                            <Text type="secondary">{item.author?.name}</Text>
                          </Space>
                          <Space size="small">
                            <ClockCircleOutlined />
                            <span>{formatDate(item.createdAt)}</span>
                          </Space>
                          <Space size="small">
                            <EyeOutlined />
                            <span>{item.viewCount} lượt xem</span>
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
        </Col>

        <Col xs={24} lg={7}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="Thống kê" style={{ borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text type="secondary">Tổng số câu hỏi:</Text>
                <Text strong>{tagInfo.count}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Người theo dõi:</Text>
                <Text strong>{tagInfo.count * 3}</Text>
              </div>
            </Card>

            <Card title="Thẻ phổ biến khác" style={{ borderRadius: '8px' }}>
              <Space wrap>
                {relatedTags.map(t => (
                  <Tag 
                    color="default" 
                    key={t.name} 
                    style={{ cursor: 'pointer', marginBottom: '8px' }}
                    onClick={() => navigate(`/tags/${t.name}`)}
                  >
                    {t.name} ({t.count})
                  </Tag>
                ))}
              </Space>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TagDetail;
