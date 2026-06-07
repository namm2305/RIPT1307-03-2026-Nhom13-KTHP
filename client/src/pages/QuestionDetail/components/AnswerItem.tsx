import React from 'react';
import { Card, Space, Avatar, Typography, Tag, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, ClockCircleOutlined, CheckCircleFilled, VerifiedOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { Button } from 'antd';
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
        isAccepted?: boolean;
        isVerifiedByLecturer?: boolean;
        createdAt: string;
    };
    comments: Comment[];
    index: number;
    currentUserId: string | null;
    currentUserRole?: string;
    questionAuthorId?: string;
    onVote: (commentId: string, type: 'up' | 'down') => void;
    onAddReply: (content: string, parentCommentId?: string) => void;
    onVoteReply: (commentId: string, type: 'up' | 'down') => void;
    onAccept?: (answerId: string) => void;
    onVerify?: (answerId: string) => void;
    onDelete?: (answerId: string) => void;
}

const AnswerItem: React.FC<AnswerItemProps> = ({
    answer,
    comments,
    index,
    currentUserId,
    currentUserRole,
    questionAuthorId,
    onVote,
    onAddReply,
    onVoteReply,
    onAccept,
    onVerify,
    onDelete
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

    const isAnswerOwner = currentUserId === answer.author._id;
    const isQuestionOwner = currentUserId === questionAuthorId;
    const canVerify = ['admin', 'lecturer'].includes(currentUserRole || '');
    const canDelete = isAnswerOwner || ['admin', 'moderator', 'lecturer'].includes(currentUserRole || '');

    return (
        <Card style={{ 
            borderRadius: '8px', 
            border: answer.isAccepted ? '1px solid #52c41a' : answer.isVerifiedByLecturer ? '1px solid #1890ff' : undefined,
            background: answer.isAccepted ? '#f6ffed' : answer.isVerifiedByLecturer ? '#e6f7ff' : undefined
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <Space size="small">
                    <Link to={`/user/${answer.author._id}`}>
                        <Avatar src={answer.author.avatar} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                    </Link>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to={`/user/${answer.author._id}`}>
                                <Text strong style={{ color: '#262626' }}>{answer.author.name}</Text>
                            </Link>
                            {answer.author.role && (
                                <Tag
                                    color={answer.author.role === 'lecturer' ? 'gold' : answer.author.role === 'admin' ? 'red' : answer.author.role === 'moderator' ? 'purple' : 'blue'}
                                >
                                    {answer.author.role === 'lecturer' ? 'Giảng viên' : answer.author.role === 'admin' ? 'Quản trị viên' : answer.author.role === 'moderator' ? 'Kiểm duyệt viên' : 'Sinh viên'}
                                </Tag>
                            )}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            <ClockCircleOutlined /> {formatDate(answer.createdAt)}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                            {answer.isAccepted && (
                                <Tag icon={<CheckCircleFilled />} color="success">
                                    Đã chấp nhận
                                </Tag>
                            )}
                            {answer.isVerifiedByLecturer && (
                                <Tag icon={<VerifiedOutlined />} color="processing">
                                    Giảng viên xác thực
                                </Tag>
                            )}
                        </div>
                    </div>
                </Space>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <VoteButton
                        likes={likes}
                        dislikes={dislikes}
                        userVote={getUserVote()}
                        onVote={(type) => onVote(answer._id, type)}
                        size="small"
                        horizontal={true}
                    />
                    <Space size="small">

                        {!answer.isVerifiedByLecturer && canVerify && (
                            <Button size="small" type="primary" ghost icon={<VerifiedOutlined />} onClick={() => onVerify?.(answer._id)}>
                                Xác thực
                            </Button>
                        )}
                        {canDelete && (
                            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete?.(answer._id)} />
                        )}
                    </Space>
                </div>
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
