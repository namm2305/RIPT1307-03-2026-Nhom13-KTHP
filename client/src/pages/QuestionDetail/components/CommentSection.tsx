import React, { useState } from 'react';
import { List, Button, Input, Typography, Space, Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import VoteButton from './VoteButton';

const { Text } = Typography;
const { TextArea } = Input;

interface Comment {
    _id: string;
    content: string;
    author: { _id: string; name: string; avatar?: string; role?: string };
    votes: number;
    voters: { user: string; type: 'up' | 'down' }[];
    parentComment: string | null;
    createdAt: string;
}

interface CommentSectionProps {
    comments: Comment[];
    currentUserId: string | null;
    onAddComment: (content: string, parentCommentId?: string) => void;
    onVoteComment: (commentId: string, type: 'up' | 'down') => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    currentUserId,
    onAddComment,
    onVoteComment
}) => {
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const rootComments = comments.filter(c => !c.parentComment);
    const getReplies = (parentId: string) => comments.filter(c => c.parentComment === parentId);

    const getUserVote = (comment: Comment): 'up' | 'down' | null => {
        if (!currentUserId) return null;
        const vote = comment.voters?.find(v => v.user === currentUserId);
        return vote ? vote.type : null;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment.trim());
        setNewComment('');
    };

    const handleReply = (parentId: string) => {
        if (!replyContent.trim()) return;
        onAddComment(replyContent.trim(), parentId);
        setReplyContent('');
        setReplyTo(null);
    };

    const renderComment = (comment: Comment, isReply = false) => {
        const likes = comment.voters?.filter(v => v.type === 'up').length || 0;
        const dislikes = comment.voters?.filter(v => v.type === 'down').length || 0;

        return (
            <div
                key={comment._id}
                style={{
                    padding: isReply ? '8px 0 8px 40px' : '12px 0',
                    borderBottom: isReply ? 'none' : '1px solid #f0f0f0'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <Space size="small">
                        <Link to={`/user/${comment.author._id}`}>
                            <Avatar size="small" src={comment.author.avatar} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Link to={`/user/${comment.author._id}`}>
                                <Text strong style={{ fontSize: '13px', color: '#262626' }}>{comment.author.name}</Text>
                            </Link>
                            {comment.author.role && (
                                <Tag color={comment.author.role === 'lecturer' ? 'gold' : comment.author.role === 'admin' ? 'red' : comment.author.role === 'moderator' ? 'purple' : 'blue'} style={{ fontSize: '10px', padding: '0 4px', lineHeight: '16px', margin: 0 }}>
                                    {comment.author.role === 'lecturer' ? 'Giảng viên' : comment.author.role === 'admin' ? 'Quản trị viên' : comment.author.role === 'moderator' ? 'Kiểm duyệt viên' : 'Sinh viên'}
                                </Tag>
                            )}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{formatDate(comment.createdAt)}</Text>
                    </Space>
                    <VoteButton
                        likes={likes}
                        dislikes={dislikes}
                        userVote={getUserVote(comment)}
                        onVote={(type) => onVoteComment(comment._id, type)}
                        size="small"
                        horizontal={true}
                    />
                </div>
                <div style={{ paddingLeft: '28px' }}>
                    <div style={{ color: '#333', fontSize: '14px', margin: '4px 0' }}>
                        {comment.content}
                    </div>
                    <Button
                        type="link"
                        size="small"
                        style={{ padding: 0, fontSize: '12px' }}
                        onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                    >
                        Trả lời
                    </Button>

                    {replyTo === comment._id && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <TextArea
                                autoSize={{ minRows: 1, maxRows: 5 }}
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                                placeholder="Viết phản hồi..."
                                style={{ flex: 1, resize: 'none' }}
                            />
                            <Button
                                type="primary"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => handleReply(comment._id)}
                            />
                        </div>
                    )}

                    {getReplies(comment._id).map(reply => renderComment(reply, true))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <Text strong style={{ fontSize: '15px' }}>
                Bình luận ({comments.length})
            </Text>

            <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                <TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    style={{ flex: 1, resize: 'none' }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    style={{ alignSelf: 'flex-end' }}
                >
                    Gửi
                </Button>
            </div>

            <div>{rootComments.map(c => renderComment(c))}</div>
        </div>
    );
};

export default CommentSection;
