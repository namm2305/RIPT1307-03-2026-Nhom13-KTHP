import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import QuestionContent from './components/QuestionContent';
import AnswerList from './components/AnswerList';
import AnswerForm from './components/AnswerForm';
import CommentSection from './components/CommentSection';
import mockQuestions from '../../mocks/mockQuestions.json';

const API_URL = 'http://localhost:5000/api';

const mockComments = [
    {
        _id: 'c1',
        content: 'Bạn thử kiểm tra lại SSH key đã cấu hình đúng chưa nhé. Vào Settings > SSH Keys trên GitHub để xem.',
        author: { _id: 'u2', name: 'Trần Thị B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' },
        votes: 5,
        voters: [],
        parentComment: null,
        createdAt: '2026-05-20T11:00:00.000Z'
    },
    {
        _id: 'c2',
        content: 'Ngoài SSH key, bạn cũng nên kiểm tra xem có đang dùng đúng tài khoản Git không bằng lệnh: git config user.email',
        author: { _id: 'u3', name: 'Lê Hoàng C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C' },
        votes: 3,
        voters: [],
        parentComment: null,
        createdAt: '2026-05-20T12:30:00.000Z'
    },
    {
        _id: 'c3',
        content: 'Cảm ơn bạn, mình đã thử và fix được rồi!',
        author: { _id: 'u1', name: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
        votes: 1,
        voters: [],
        parentComment: 'c1',
        createdAt: '2026-05-20T14:00:00.000Z'
    }
];

const convertMockToQuestion = (mock: any) => ({
    _id: mock.id,
    title: mock.title,
    content: mock.content,
    tags: mock.tags,
    author: {
        _id: 'mock-user',
        name: mock.author,
        avatar: mock.avatar,
        role: 'student'
    },
    votes: 0,
    voters: [],
    viewCount: mock.views,
    createdAt: mock.createdAt
});

const QuestionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [question, setQuestion] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    const [currentUserId, setCurrentUserId] = useState<string | null>(localStorage.getItem('userId'));
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    useEffect(() => {
        const performAutoLogin = async () => {
            if (!token) {
                try {
                    const res = await axios.post(`${API_URL}/auth/login`, {
                        email: 'nguyenvana@ptit.edu.vn',
                        password: '123456'
                    });
                    const newToken = res.data.token;
                    const newUserId = res.data.user.id;
                    localStorage.setItem('token', newToken);
                    localStorage.setItem('userId', newUserId);
                    localStorage.setItem('userName', res.data.user.name);
                    setToken(newToken);
                    setCurrentUserId(newUserId);
                } catch (error) {
                    console.error('Không thể tự động đăng nhập tài khoản test:', error);
                    setCurrentUserId('guest');
                }
            }
        };
        performAutoLogin();
    }, [token]);

    const fetchQuestion = async () => {
        try {
            const res = await axios.get(`${API_URL}/questions/${id}`);
            setQuestion(res.data.data);
        } catch (error) {
            const mock = mockQuestions.find((q: any) => q.id === id);
            if (mock) {
                setQuestion(convertMockToQuestion(mock));
            } else {
                setQuestion(null);
            }
        }
    };

    const fetchComments = async () => {
        try {
            const res = await axios.get(`${API_URL}/questions/${id}/comments`);
            setComments(res.data.data);
        } catch (error) {
            setComments(mockComments);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchQuestion(), fetchComments()]);
            setLoading(false);
        };
        loadData();
    }, [id]);

        const handleVoteQuestion = async (type: 'up' | 'down') => {
        if (!token) {
            if (question) {
                const mockUserId = 'guest';
                let newVoters = [...(question.voters || [])];
                const existingVoteIndex = newVoters.findIndex((v: any) => v.user === mockUserId);
                
                if (existingVoteIndex !== -1) {
                    const existingVote = newVoters[existingVoteIndex];
                    if (existingVote.type === type) {
                        newVoters.splice(existingVoteIndex, 1);
                    } else {
                        existingVote.type = type;
                    }
                } else {
                    newVoters.push({ user: mockUserId, type });
                }
                setQuestion({ ...question, voters: newVoters });
            }
            return;
        }
        try {
            const res = await axios.put(`${API_URL}/questions/${id}/vote`, { type }, authHeader);
            setQuestion((prev: any) => ({
                ...prev,
                votes: res.data.data.votes,
                voters: res.data.data.voters
            }));
        } catch (error) {
            message.error('Lỗi khi vote');
        }
    };

    const handleAddComment = async (content: string, parentCommentId?: string) => {
        if (!token) {
            const newComment = {
                _id: `c-${Date.now()}`,
                content,
                author: { _id: 'guest', name: 'Khách', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest' },
                votes: 0,
                voters: [],
                parentComment: parentCommentId || null,
                createdAt: new Date().toISOString()
            };
            setComments(prev => [...prev, newComment]);
            message.success('Đã gửi bình luận (demo)');
            return;
        }
        try {
            await axios.post(
                `${API_URL}/questions/${id}/comments`,
                { content, parentComment: parentCommentId || null },
                authHeader
            );
            message.success('Đã gửi bình luận');
            fetchComments();
        } catch (error) {
            message.error('Lỗi khi gửi bình luận');
        }
    };

    const handleAddAnswer = async (content: string) => {
        if (!token) {
            const newAnswer = {
                _id: `a-${Date.now()}`,
                content,
                author: { _id: 'guest', name: 'Khách', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest' },
                votes: 0,
                voters: [],
                parentComment: null,
                createdAt: new Date().toISOString()
            };
            setComments(prev => [...prev, newAnswer]);
            message.success('Đã gửi câu trả lời (demo)');
            return;
        }
        try {
            await axios.post(
                `${API_URL}/questions/${id}/comments`,
                { content, parentComment: null },
                authHeader
            );
            message.success('Đã gửi câu trả lời');
            fetchComments();
        } catch (error) {
            message.error('Lỗi khi gửi câu trả lời');
        }
    };

    const handleVoteComment = async (commentId: string, type: 'up' | 'down') => {
        if (!token) {
            setComments(prev => prev.map(c => {
                if (c._id === commentId) {
                    const mockUserId = 'guest';
                    let newVoters = [...(c.voters || [])];
                    const existingVoteIndex = newVoters.findIndex((v: any) => v.user === mockUserId);
                    
                    if (existingVoteIndex !== -1) {
                        const existingVote = newVoters[existingVoteIndex];
                        if (existingVote.type === type) {
                            newVoters.splice(existingVoteIndex, 1);
                        } else {
                            existingVote.type = type;
                        }
                    } else {
                        newVoters.push({ user: mockUserId, type });
                    }
                    return { ...c, voters: newVoters };
                }
                return c;
            }));
            return;
        }
        try {
            await axios.put(
                `${API_URL}/questions/${id}/comments/${commentId}/vote`,
                { type },
                authHeader
            );
            fetchComments();
        } catch (error) {
            message.error('Lỗi khi vote');
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
                onVote={handleVoteQuestion}
            />

            <Divider />

            <AnswerList
                answers={answers}
                comments={replies}
                currentUserId={currentUserId}
                onVoteAnswer={handleVoteComment}
                onAddReply={(answerId, content, parentId) => handleAddComment(content, parentId || answerId)}
                onVoteReply={handleVoteComment}
            />

            <AnswerForm onSubmit={handleAddAnswer} />
        </div>
    );
};

export default QuestionDetail;
