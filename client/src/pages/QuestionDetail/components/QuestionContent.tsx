import React from 'react';
import { Card, Tag, Space, Typography, Avatar, Divider } from 'antd';
import { UserOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import VoteButton from './VoteButton';

const { Title, Paragraph, Text } = Typography;

interface QuestionContentProps {
    question: {
        _id: string;
        title: string;
        content: string;
        tags: string[];
        author: { _id: string; name: string; avatar?: string; role?: string; faculty?: string };
        votes: number;
        voters: { user: string; type: 'up' | 'down' }[];
        viewCount: number;
        createdAt: string;
    };
    currentUserId: string | null;
    onVote: (type: 'up' | 'down') => void;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ question, currentUserId, onVote }) => {
    const getUserVote = (): 'up' | 'down' | null => {
        if (!currentUserId) return null;
        const vote = question.voters?.find(v => v.user === currentUserId);
        return vote ? vote.type : null;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const likes = question.voters?.filter(v => v.type === 'up').length || 0;
    const dislikes = question.voters?.filter(v => v.type === 'down').length || 0;

    return (
        <Card style={{ borderRadius: '8px' }}>
            <Title level={3} style={{ marginTop: 0, marginBottom: '16px' }}>
                {question.title}
            </Title>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <Space size="small">
                    <Avatar src={question.author.avatar} icon={<UserOutlined />} />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong style={{ fontSize: '15px' }}>{question.author.name}</Text>
                            {question.author.role && (
                                <Tag color={question.author.role === 'teacher' ? 'gold' : 'blue'}>
                                    {question.author.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                                </Tag>
                            )}
                        </div>
                        <Space size="middle" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            <span><ClockCircleOutlined /> {formatDate(question.createdAt)}</span>
                            <span><EyeOutlined /> {question.viewCount} lượt xem</span>
                        </Space>
                    </div>
                </Space>

                <VoteButton
                    likes={likes}
                    dislikes={dislikes}
                    userVote={getUserVote()}
                    onVote={onVote}
                    size="default"
                    horizontal={true}
                />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {question.content}
            </Paragraph>

            <Space size={[4, 8]} wrap style={{ marginTop: '12px' }}>
                {question.tags.map(tag => (
                    <Tag color="blue" key={tag}>{tag}</Tag>
                ))}
            </Space>
        </Card>
    );
};

export default QuestionContent;
