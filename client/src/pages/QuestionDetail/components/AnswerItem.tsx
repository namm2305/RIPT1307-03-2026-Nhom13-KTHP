import React from 'react';
import { Card, Space, Avatar, Typography, Tag, Divider } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import VoteButton from './VoteButton';
import CommentSection from './CommentSection';

const { Text, Paragraph } = Typography;

interface Comment {
    _id: string;
    content: string;
    author: { _id: string; name: string; avatar?: string };
    votes: number;
    voters: { user: string; type: 'up' | 'down' }[];
    parentComment: string | null;
    createdAt: string;
}

interface AnswerItemProps {
    answer: {
        _id: string;
        content: string;
        author: { _id: string; name: string; avatar?: string; role?: string };
        votes: number;
        voters: { user: string; type: 'up' | 'down' }[];
        createdAt: string;
    };
    comments: Comment[];
    index: number;
    currentUserId: string | null;
    onVote: (commentId: string, type: 'up' | 'down') => void;
    onAddReply: (content: string, parentCommentId?: string) => void;
    onVoteReply: (commentId: string, type: 'up' | 'down') => void;
}

const AnswerItem: React.FC<AnswerItemProps> = ({
    answer,
    comments,
    index,
    currentUserId,
    onVote,
    onAddReply,
    onVoteReply
}) => {
    const getUserVote = (): 'up' | 'down' | null => {
        if (!currentUserId) return null;
        const vote = answer.voters?.find(v => v.user === currentUserId);
        return vote ? vote.type : null;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const likes = answer.voters?.filter(v => v.type === 'up').length || 0;
    const dislikes = answer.voters?.filter(v => v.type === 'down').length || 0;

    return (
        <Card style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <Space size="small">
                    <Avatar src={answer.author.avatar} icon={<UserOutlined />} />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong>{answer.author.name}</Text>
                            {answer.author.role && (
                                <Tag
                                    color={answer.author.role === 'teacher' ? 'gold' : 'blue'}
                                >
                                    {answer.author.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                                </Tag>
                            )}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <ClockCircleOutlined /> {formatDate(answer.createdAt)}
                        </Text>
                    </div>
                </Space>

                <VoteButton
                    likes={likes}
                    dislikes={dislikes}
                    userVote={getUserVote()}
                    onVote={(type) => onVote(answer._id, type)}
                    size="small"
                    horizontal={true}
                />
            </div>

            <div style={{ paddingLeft: '40px' }}>
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {answer.content}
                </Paragraph>

                <Divider style={{ margin: '12px 0' }} />

                <CommentSection
                    comments={comments}
                    currentUserId={currentUserId}
                    onAddComment={onAddReply}
                    onVoteComment={onVoteReply}
                />
            </div>
        </Card>
    );
};

export default AnswerItem;
