import React, { useState, useEffect } from 'react';
import { List, Space, Tag, Tabs, Typography } from 'antd';
import { EyeOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import mockQuestionsData from '../mocks/mockQuestions.json';

const { Title } = Typography;

interface Question {
  id: string;
  title: string;
  tags: string[];
  views: number;
  answersCount: number;
  createdAt: string;
}

const Home: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<string>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  useEffect(() => {
    let sortedData = [...mockQuestionsData];

    if (activeTab === 'latest') {
      sortedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'unanswered') {
      sortedData = sortedData.filter(q => q.answersCount === 0);
    } else if (activeTab === 'most-views') {
      sortedData.sort((a, b) => b.views - a.views);
    }

    setQuestions(sortedData);
    setCurrentPage(1);
  }, [activeTab]);

  const tabItems = [
    { key: 'latest', label: 'Mới nhất' },
    { key: 'unanswered', label: 'Chưa trả lời' },
    { key: 'most-views', label: 'Nhiều lượt xem' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>Danh sách câu hỏi</Title>
      </div>

      <Tabs 
        activeKey={activeTab} 
        items={tabItems} 
        onChange={(key) => setActiveTab(key)} 
        style={{ marginBottom: 16 }}
      />

      <List
        itemLayout="vertical"
        size="large"
        dataSource={questions}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          onChange: (page) => setCurrentPage(page),
          total: questions.length,
          position: 'bottom',
          align: 'center',
        }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Space key="views"><EyeOutlined /> {item.views} lượt xem</Space>,
              <Space key="answers"><MessageOutlined /> {item.answersCount} trả lời</Space>,
              <Space key="time"><ClockCircleOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Space>,
            ]}
          >
            <List.Item.Meta
              title={
                <a href={`/question/${item.id}`} style={{ fontSize: 18, color: '#1a0dab' }}>
                  {item.title}
                </a>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  {item.tags.map(tag => (
                    <Tag color="blue" key={tag}>{tag}</Tag>
                  ))}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Home;