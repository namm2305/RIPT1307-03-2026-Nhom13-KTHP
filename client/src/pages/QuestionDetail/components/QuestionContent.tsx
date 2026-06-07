import React from 'react';
import { Card, Tag, Space, Typography, Avatar, Divider, Button } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, ClockCircleOutlined, EyeOutlined, DeleteOutlined, PushpinOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
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
    currentUserRole?: string;
    onVote: (type: 'up' | 'down') => void;
    onDelete?: () => void;
    onToggleClose?: (isClosed: boolean) => void;
    onTogglePin?: (isPinned: boolean) => void;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ 
    question, currentUserId, currentUserRole, onVote, onDelete, onToggleClose, onTogglePin 
}) => {
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Title level={3} style={{ marginTop: 0, marginBottom: '16px' }}>
                    {question.isPinned && <PushpinOutlined style={{ color: '#eb2f96', marginRight: 8 }} />}
                    {question.title}
                </Title>
                <Space>
                    {(currentUserRole === 'admin' || currentUserRole === 'moderator' || currentUserRole === 'lecturer') && (
                        <Button 
                            size="small" 
                            type="dashed"
                            icon={question.isPinned ? <PushpinOutlined /> : <PushpinOutlined />}
                            onClick={() => onTogglePin?.(!question.isPinned)}
                        >
                            {question.isPinned ? 'Bỏ ghim' : 'Ghim'}
                        </Button>
                    )}
                    {(currentUserId === question.author._id || currentUserRole === 'admin' || currentUserRole === 'moderator' || currentUserRole === 'lecturer') && (
                        <Button 
                            size="small" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => onDelete?.()}
                        >
                            Xóa
                        </Button>
                    )}
                </Space>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <Space size="small">
                    <Link to={`/user/${question.author._id}`}>
                        <Avatar src={question.author.avatar} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to={`/user/${question.author._id}`}>
                                <Text strong style={{ fontSize: '15px', color: '#262626' }} className="hover-link">{question.author.name}</Text>
                            </Link>
                            {question.author.role && (
                                <Tag color={question.author.role === 'lecturer' ? 'gold' : question.author.role === 'admin' ? 'red' : question.author.role === 'moderator' ? 'purple' : 'blue'}>
                                    {question.author.role === 'lecturer' ? 'Giảng viên' : question.author.role === 'admin' ? 'Quản trị viên' : question.author.role === 'moderator' ? 'Kiểm duyệt viên' : 'Sinh viên'}
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
