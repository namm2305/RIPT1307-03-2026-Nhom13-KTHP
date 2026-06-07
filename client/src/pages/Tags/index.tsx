import React, { useState, useMemo } from 'react';
import { Card, Typography, Input, Row, Col, Button, Space, Tag, Badge, Divider } from 'antd';
import { SearchOutlined, FireFilled, RiseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import tagsData from '../../mocks/tagsData.json';

const { Title, Text, Paragraph } = Typography;

const Tags: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'newest'>('popular');
  const navigate = useNavigate();

  const filteredTags = useMemo(() => {
    let result = tagsData.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'popular') {
      result = result.sort((a, b) => b.count - a.count);
    } else if (sortBy === 'name') {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [searchTerm, sortBy]);

  // Group by category
  const groupedTags = useMemo(() => {
    const groups: { [key: string]: typeof tagsData } = {};
    filteredTags.forEach(tag => {
      const cat = tag.category || 'Khác';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tag);
    });
    return groups;
  }, [filteredTags]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Thẻ môn học (Tags)</Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Thẻ (tag) là một từ khóa hoặc nhãn giúp phân loại câu hỏi của bạn với các câu hỏi tương tự khác. 
          Sử dụng thẻ đúng cách giúp cộng đồng dễ dàng tìm thấy và hỗ trợ bạn.
        </Text>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <Input
          placeholder="Tìm kiếm thẻ môn học..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          size="large"
          style={{ maxWidth: '350px', borderRadius: '8px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Space>
          <Button 
            icon={<FireFilled style={{ color: sortBy === 'popular' ? '#fa8c16' : undefined }} />} 
            type={sortBy === 'popular' ? 'primary' : 'default'}
            onClick={() => setSortBy('popular')}
          >
            Phổ biến
          </Button>
          <Button 
            type={sortBy === 'name' ? 'primary' : 'default'}
            onClick={() => setSortBy('name')}
          >
            Tên (A-Z)
          </Button>
          <Button 
            type={sortBy === 'newest' ? 'primary' : 'default'}
            onClick={() => setSortBy('newest')}
          >
            Mới nhất
          </Button>
        </Space>
      </div>

      {Object.keys(groupedTags).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#8c8c8c' }}>
          <Title level={4} type="secondary">Không tìm thấy thẻ nào phù hợp với "{searchTerm}"</Title>
        </div>
      ) : (
        Object.keys(groupedTags).map(category => (
          <div key={category} style={{ marginBottom: '40px' }}>
            <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>
              <Title level={4} style={{ margin: 0, color: '#1d1d1d' }}>{category}</Title>
            </Divider>
            
            <Row gutter={[16, 16]}>
              {groupedTags[category].map((tag) => (
                <Col xs={24} sm={12} md={8} lg={6} key={tag.id}>
                  <Badge.Ribbon 
                    text="Trending" 
                    color="red" 
                    style={{ display: tag.trending ? 'block' : 'none' }}
                  >
                    <Card 
                      hoverable
                      onClick={() => navigate(`/tags/${tag.id}`)}
                      style={{ height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                      styles={{ body: { padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' } }}
                    >
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Tag color="geekblue" style={{ fontSize: '14px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                          {tag.name}
                        </Tag>
                        {tag.trending && <RiseOutlined style={{ color: '#f5222d', fontSize: '18px' }} />}
                      </div>
                      
                      <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#595959', flex: 1, fontSize: '14px', lineHeight: '1.6' }}>
                        {tag.description}
                      </Paragraph>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f5f5f5' }}>
                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
                          {tag.count} câu hỏi
                        </Text>
                        <Button 
                          size="small" 
                          type="primary" 
                          ghost 
                          shape="round"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                          }}
                        >
                          Theo dõi
                        </Button>
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              ))}
            </Row>
          </div>
        ))
      )}
    </div>
  );
};

export default Tags;
