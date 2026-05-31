import React from 'react';
import { Typography, Empty } from 'antd';
import AnswerItem from './AnswerItem';

const { Title } = Typography;

interface Comment {
    _id: string;
    content: string;
    author: { _id: string; name: string; avatar?: string };
    votes: number;
    voters: { user: string; type: 'up' | 'down' }[];
    parentComment: string | null;
    createdAt: string;
}

interface Answer {
    _id: string;
    content: string;
    author: { _id: string; name: string; avatar?: string; role?: string };
    votes: number;
    voters: { user: string; type: 'up' | 'down' }[];
    createdAt: string;
}

interface AnswerListProps {
    answers: Answer[];
    comments: Comment[];
    currentUserId: string | null;
    onVoteAnswer: (commentId: string, type: 'up' | 'down') => void;
    onAddReply: (answerId: string, content: string, parentCommentId?: string) => void;
    onVoteReply: (commentId: string, type: 'up' | 'down') => void;
}

const AnswerList: React.FC<AnswerListProps> = ({
    answers,
    comments,
    currentUserId,
    onVoteAnswer,
    onAddReply,
    onVoteReply
}) => {
    const getAnswerReplies = (answerId: string) => {
        return comments.filter(c => c.parentComment === answerId || 
            comments.some(parent => parent._id === c.parentComment && parent.parentComment === null));
    };

    return (
        <div>
            <Title level={4} style={{ marginBottom: '16px' }}>
                {answers.length} Câu trả lời
            </Title>

            {answers.length === 0 ? (
                <Empty description="Chưa có câu trả lời nào. Hãy là người đầu tiên!" />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {answers.map((answer, index) => (
                        <AnswerItem
                            key={answer._id}
                            answer={answer}
                            comments={getAnswerReplies(answer._id)}
                            index={index}
                            currentUserId={currentUserId}
                            onVote={onVoteAnswer}
                            onAddReply={(content, parentId) => onAddReply(answer._id, content, parentId)}
                            onVoteReply={onVoteReply}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnswerList;
