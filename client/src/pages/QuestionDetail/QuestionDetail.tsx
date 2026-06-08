import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Modal, Input } from 'antd';

const { confirm } = Modal;
import QuestionContent from './components/QuestionContent';
import AnswerList from './components/AnswerList';
import AnswerForm from './components/AnswerForm';

import { API_BASE as API_URL } from '../../config/api';

const QuestionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [question, setQuestion] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    const currentUserId = user?.id || null;
    const token = localStorage.getItem('token');

    const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const fetchQuestion = async () => {
        try {
            const res = await axios.get(`${API_URL}/questions/${id}`);
            const q = res.data.question;
            setQuestion(q);
            
            const allComments: any[] = [];
            if (q.answers) {
                q.answers.forEach((ans: any) => {
                    allComments.push(ans);
                    if (ans.replies) {
                        allComments.push(...ans.replies);
                    }
                });
            }
            setComments(allComments);
        } catch (error) {
            console.error(error);
            setQuestion(null);
            message.error('Lỗi khi tải câu hỏi');
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        const loadData = async () => {
            setLoading(true);
            await fetchQuestion();
            setLoading(false);
        };
        loadData();
    }, [id]);

    const handleVoteQuestion = async (type: 'up' | 'down') => {
        if (!token) {
            message.error('Vui lòng đăng nhập để bình chọn!');
            return;
        }
        try {
            await axios.put(`${API_URL}/questions/${id}/vote`, { type }, authHeader);
            fetchQuestion();
        } catch (error) {
            message.error('Lỗi khi bình chọn câu hỏi');
        }
    };

    const handleAddComment = async (content: string, parentCommentId?: string) => {
        if (!token) {
            message.error('Vui lòng đăng nhập để bình luận!');
            return;
        }
        try {
            await axios.post(
                `${API_URL}/questions/${id}/answers`,
                { content, parentComment: parentCommentId || null },
                authHeader
            );
            message.success('Đã gửi bình luận');
            fetchQuestion();
        } catch (error) {
            message.error('Lỗi khi gửi bình luận');
        }
    };

    const handleAddAnswer = async (content: string) => {
        if (!token) {
            message.error('Vui lòng đăng nhập để trả lời!');
            return;
        }
        try {
            await axios.post(
                `${API_URL}/questions/${id}/answers`,
                { content, parentComment: null },
                authHeader
            );
            message.success('Đã gửi câu trả lời');
            fetchQuestion();
        } catch (error) {
            message.error('Lỗi khi gửi câu trả lời');
        }
    };

    const handleVoteComment = async (commentId: string, type: 'up' | 'down') => {
        if (!token) {
            message.error('Vui lòng đăng nhập để bình chọn!');
            return;
        }
        try {
            await axios.put(`${API_URL}/questions/${id}/answers/${commentId}/vote`, { type }, authHeader);
            fetchQuestion();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi bình chọn bình luận');
        }
    };

    const handleAcceptAnswer = async (answerId: string) => {
        if (!token) return;
        try {
            await axios.put(`${API_URL}/questions/${id}/answers/${answerId}/accept`, {}, authHeader);
            message.success('Đã chấp nhận câu trả lời');
            fetchQuestion();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi chấp nhận câu trả lời');
        }
    };

    const handleVerifyAnswer = async (answerId: string) => {
        if (!token) return;
        try {
            await axios.put(`${API_URL}/questions/${id}/answers/${answerId}/verify`, {}, authHeader);
            message.success('Đã xác thực học thuật');
            fetchQuestion();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi xác thực');
        }
    };

    const handleDeleteAnswer = (answerId: string) => {
        let reason = '';
        confirm({
            title: 'Bạn có chắc muốn xoá câu trả lời này?',
            content: (
                <div style={{ marginTop: 16 }}>
                    <p>Vui lòng nhập lý do xoá (bắt buộc):</p>
                    <Input.TextArea 
                        rows={3} 
                        onChange={(e) => { reason = e.target.value; }} 
                        placeholder="Ví dụ: Nội dung vi phạm nội quy, câu hỏi rác..."
                    />
                </div>
            ),
            onOk: async () => {
                if (!reason.trim()) {
                    message.error('Vui lòng nhập lý do xoá');
                    return Promise.reject();
                }
                try {
                    await axios.delete(`${API_URL}/questions/${id}/answers/${answerId}`, {
                        ...authHeader,
                        data: { reason }
                    });
                    message.success('Đã xoá câu trả lời');
                    fetchQuestion();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Chưa hỗ trợ hoặc lỗi xoá');
                }
            }
        });
    };

    const handleDeleteQuestion = () => {
        let reason = '';
        confirm({
            title: 'Bạn có chắc muốn xoá câu hỏi này?',
            content: (
                <div style={{ marginTop: 16 }}>
                    <p>Vui lòng nhập lý do xoá (bắt buộc):</p>
                    <Input.TextArea 
                        rows={3} 
                        onChange={(e) => { reason = e.target.value; }} 
                        placeholder="Ví dụ: Nội dung vi phạm nội quy, câu hỏi rác..."
                    />
                </div>
            ),
            onOk: async () => {
                if (!reason.trim()) {
                    message.error('Vui lòng nhập lý do xoá');
                    return Promise.reject();
                }
                try {
                    await axios.delete(`${API_URL}/questions/${id}`, { ...authHeader, data: { reason } });
                    message.success('Đã xoá câu hỏi');
                    navigate('/');
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Lỗi xoá câu hỏi');
                }
            }
        });
    };

    const handleTogglePinQuestion = async (isPinned: boolean) => {
        try {
            await axios.put(`${API_URL}/questions/${id}`, { isPinned }, authHeader);
            message.success(isPinned ? 'Đã ghim câu hỏi' : 'Đã bỏ ghim');
            fetchQuestion();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi ghim câu hỏi');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!question) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <h2>Không tìm thấy câu hỏi</h2>
                <Button type="primary" onClick={() => navigate('/')}>Quay về trang chủ</Button>
            </div>
        );
    }

    const answers = comments.filter(c => !c.parentComment);
    const replies = comments.filter(c => c.parentComment !== null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
                style={{ alignSelf: 'flex-start', padding: 0 }}
            >
                Quay lại danh sách
            </Button>

            <QuestionContent
                question={question}
                currentUserId={currentUserId}
                currentUserRole={user?.role}
                onVote={handleVoteQuestion}
                onDelete={handleDeleteQuestion}
                onTogglePin={handleTogglePinQuestion}
            />

            <Divider />

            <AnswerList
                answers={answers}
                comments={replies}
                currentUserId={currentUserId}
                currentUserRole={user?.role}
                questionAuthorId={question.author._id || question.author}
                onVoteAnswer={handleVoteComment}
                onAddReply={(answerId, content, parentId) => handleAddComment(content, parentId || answerId)}
                onVoteReply={handleVoteComment}
                onAccept={handleAcceptAnswer}
                onVerify={handleVerifyAnswer}
                onDelete={handleDeleteAnswer}
            />

            {question.isClosed ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 8 }}>
                    <Text type="danger" strong>Câu hỏi này đã bị khoá. Không thể gửi thêm câu trả lời.</Text>
                    {question.closedReason && (
                        <div style={{ marginTop: '10px' }}>
                            <Text type="secondary">Lý do khoá: {question.closedReason}</Text>
                        </div>
                    )}
                </div>
            ) : (
                <AnswerForm onSubmit={handleAddAnswer} />
            )}
        </div>
    );
};

export default QuestionDetail;
