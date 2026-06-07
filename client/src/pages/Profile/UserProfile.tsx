import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Tag, Space, Typography, Button, Input, message, Spin, Modal } from 'antd';
import {
  MailOutlined, BookOutlined, ClockCircleOutlined, TrophyOutlined,
  EditOutlined, CheckOutlined, CloseOutlined, EyeOutlined,
  MessageOutlined, LikeOutlined, CalendarOutlined, SafetyCertificateOutlined,
  QuestionCircleOutlined, StarOutlined, LockOutlined, LogoutOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import mockUser from '../../mocks/mockUser.json';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const API_BASE = 'http://localhost:5050/api';

// ── Màu & nhãn role ───────────────────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  admin:      { color: '#fff',    bg: '#f5222d', label: 'Quản trị viên',    icon: <SafetyCertificateOutlined /> },
  moderator:  { color: '#fff',    bg: '#722ed1', label: 'Kiểm duyệt viên',  icon: <SafetyCertificateOutlined /> },
  lecturer:   { color: '#fff',    bg: '#1890ff', label: 'Giảng viên',       icon: <IdcardOutlined /> },
  student:    { color: '#262626', bg: '#e6f7ff', label: 'Sinh viên',        icon: <IdcardOutlined /> },
};

interface Question {
  id: string; title: string; content: string; tags: string[];
  views: number; answersCount: number; createdAt: string;
}
interface Answer {
  id: string; questionId: string; questionTitle: string;
  content: string; votes: number; isAccepted: boolean; createdAt: string;
}
interface UserProfileData {
  id: string; name: string; email: string; avatar: string; bio: string;
  role: string; roleDisplay?: string; faculty: string; studentId?: string;
  joinDate: string; reputation: number;
  postedQuestions?: Question[]; postedAnswers?: Answer[];
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedFaculty, setEditedFaculty] = useState('');
  const [editedStudentId, setEditedStudentId] = useState('');
  const [saving, setSaving] = useState(false);

  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('questions');

  // ── Tải dữ liệu ──────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    const loadFromStorage = (data: UserProfileData) => {
      const merged: UserProfileData = {
        ...data,
        postedQuestions: (mockUser.postedQuestions as Question[]),
        postedAnswers: (mockUser.postedAnswers as Answer[]),
      };
      setUser(merged);
      setEditedName(data.name);
      setEditedBio(data.bio || '');
      setEditedFaculty(data.faculty || '');
      setEditedStudentId(data.studentId || '');
    };

    const fetchFromAPI = async (token: string) => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        const apiUser: UserProfileData = {
          ...data.user,
          postedQuestions: (mockUser.postedQuestions as Question[]),
          postedAnswers: (mockUser.postedAnswers as Answer[]),
        };
        setUser(apiUser);
        setEditedName(apiUser.name);
        setEditedBio(apiUser.bio || '');
        setEditedFaculty(apiUser.faculty || '');
        setEditedStudentId(apiUser.studentId || '');
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        if (stored) loadFromStorage(JSON.parse(stored));
        else navigate('/login');
      }
    };

    if (token) {
      fetchFromAPI(token).finally(() => setLoading(false));
    } else if (stored) {
      loadFromStorage(JSON.parse(stored));
      setLoading(false);
    } else {
      // Demo: dùng mockUser
      const mockSession: UserProfileData = {
        id: mockUser.id, name: mockUser.name, email: mockUser.email,
        avatar: mockUser.avatar, bio: mockUser.bio, role: 'student',
        roleDisplay: 'Sinh viên', faculty: mockUser.faculty,
        studentId: 'B21DCCN001', joinDate: mockUser.joinDate,
        reputation: mockUser.reputation,
        postedQuestions: (mockUser.postedQuestions as Question[]),
        postedAnswers: (mockUser.postedAnswers as Answer[]),
      };
      localStorage.setItem('user', JSON.stringify(mockSession));
      setUser(mockSession);
      setEditedName(mockSession.name);
      setEditedBio(mockSession.bio);
      setEditedFaculty(mockSession.faculty);
      setLoading(false);
    }
  }, [navigate]);

  // ── Lưu hồ sơ ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editedName.trim()) { message.error('Tên hiển thị không được bỏ trống'); return; }
    if (!user) return;
    setSaving(true);

    const token = localStorage.getItem('token');
    const updated = { ...user, name: editedName.trim(), bio: editedBio, faculty: editedFaculty, studentId: editedStudentId };

    try {
      if (token) {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: editedName.trim(), bio: editedBio, faculty: editedFaculty, studentId: editedStudentId }),
        });
        const data = await res.json();
        if (res.ok) Object.assign(updated, data.user);
      }
    } catch { /* offline: lưu local */ }

    setUser({ ...updated, postedQuestions: user.postedQuestions, postedAnswers: user.postedAnswers });
    const { postedQuestions: _q, postedAnswers: _a, ...sessionUser } = updated;
    localStorage.setItem('user', JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('storage'));
    setIsEditing(false);
    setSaving(false);
    message.success('Đã cập nhật hồ sơ!');
  };

  // ── Đổi mật khẩu ─────────────────────────────────────────────
  const handleChangePwd = async () => {
    if (!curPwd || !newPwd || !confirmPwd) { message.error('Vui lòng điền đầy đủ'); return; }
    if (newPwd.length < 6) { message.error('Mật khẩu mới ít nhất 6 ký tự'); return; }
    if (newPwd !== confirmPwd) { message.error('Mật khẩu xác nhận không khớp'); return; }

    const token = localStorage.getItem('token');
    if (!token) { message.warning('Chức năng đổi mật khẩu yêu cầu đăng nhập qua API'); return; }

    setPwdLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      message.success('Đổi mật khẩu thành công!');
      setChangePwdVisible(false);
      setCurPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: unknown) {
      message.error((err as Error).message || 'Đổi mật khẩu thất bại');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
  };

  // ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign:'center', padding:'80px 0' }}>
      <Spin size="large" /><br/>
      <Text type="secondary" style={{ marginTop:16, display:'block' }}>Đang tải hồ sơ...</Text>
    </div>
  );
  if (!user) return null;

  const role = user.role || 'student';
  const roleCfg = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  // ── Stats bar ─────────────────────────────────────────────────
  const stats = [
    { icon: <QuestionCircleOutlined style={{ color:'#1890ff' }} />, value: user.postedQuestions?.length ?? 0, label: 'Câu hỏi' },
    { icon: <MessageOutlined style={{ color:'#52c41a' }} />,       value: user.postedAnswers?.length ?? 0,   label: 'Câu trả lời' },
    { icon: <StarOutlined style={{ color:'#fadb14' }} />,          value: user.postedAnswers?.filter(a => a.isAccepted).length ?? 0, label: 'Được chấp nhận' },
    { icon: <TrophyOutlined style={{ color:'#f5222d' }} />,        value: user.reputation,                  label: 'Điểm uy tín' },
  ];

  // ── Tab items ─────────────────────────────────────────────────
  const tabItems = [
    {
      key: 'questions',
      label: <span><BookOutlined /> Câu hỏi đã đăng ({user.postedQuestions?.length ?? 0})</span>,
      children: (
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:12 }}>
          {user.postedQuestions && user.postedQuestions.length > 0 ? user.postedQuestions.map(q => (
            <Card key={q.id} hoverable styles={{ body:{ padding:'18px 20px' } }}
              style={{ borderRadius:10, border:'1px solid #f0f0f0', transition:'box-shadow 0.2s' }}>
              <Title level={5} style={{ margin:'0 0 6px 0' }}>
                <a href={`/question/${q.id}`} style={{ color:'#1890ff' }}>{q.title}</a>
              </Title>
              <Paragraph ellipsis={{ rows:2 }} style={{ color:'#595959', marginBottom:10, fontSize:13.5 }}>
                {q.content}
              </Paragraph>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                <Space size={[0, 4]} wrap>
                  {q.tags.map(tag => <Tag color="purple" key={tag}>{tag}</Tag>)}
                </Space>
                <Space size="large" style={{ color:'#8c8c8c', fontSize:12.5 }}>
                  <Space size="small"><ClockCircleOutlined /><span>{formatDate(q.createdAt)}</span></Space>
                  <Space size="small"><EyeOutlined /><span>{q.views} lượt xem</span></Space>
                  <Space size="small" style={{ color: q.answersCount > 0 ? '#52c41a' : '#8c8c8c' }}>
                    <MessageOutlined /><span>{q.answersCount} trả lời</span>
                  </Space>
                </Space>
              </div>
            </Card>
          )) : (
            <div style={{ textAlign:'center', padding:'50px 0', color:'#8c8c8c' }}>
              <QuestionCircleOutlined style={{ fontSize:36, marginBottom:12, opacity:0.4 }} /><br/>
              Bạn chưa đăng câu hỏi nào.
            </div>
          )}
        </div>
      )
    },
    {
      key: 'answers',
      label: <span><MessageOutlined /> Câu trả lời ({user.postedAnswers?.length ?? 0})</span>,
      children: (
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:12 }}>
          {user.postedAnswers && user.postedAnswers.length > 0 ? user.postedAnswers.map(ans => (
            <Card key={ans.id} hoverable styles={{ body:{ padding:'18px 20px' } }}
              style={{ borderRadius:10, border:'1px solid #f0f0f0' }}>
              <div style={{ borderLeft:'3px solid #1890ff', paddingLeft:12, marginBottom:10 }}>
                <Text type="secondary" style={{ fontSize:12 }}>Trả lời cho:</Text>
                <div style={{ fontWeight:600, fontSize:14, marginTop:2 }}>
                  <a href={`/question/${ans.questionId}`} style={{ color:'#262626' }}>{ans.questionTitle}</a>
                </div>
              </div>
              <Paragraph style={{ color:'#595959', margin:'0 0 10px 0', background:'#fafafa', padding:'9px 13px', borderRadius:6, fontSize:13.5 }}>
                {ans.content}
              </Paragraph>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Space size="middle" style={{ color:'#8c8c8c', fontSize:12.5 }}>
                  <Space size="small"><ClockCircleOutlined /><span>{formatDate(ans.createdAt)}</span></Space>
                  <Space size="small"><LikeOutlined /><span>{ans.votes} lượt thích</span></Space>
                </Space>
                {ans.isAccepted && <Tag color="success" icon={<CheckOutlined />}>Được chấp nhận</Tag>}
              </div>
            </Card>
          )) : (
            <div style={{ textAlign:'center', padding:'50px 0', color:'#8c8c8c' }}>
              <MessageOutlined style={{ fontSize:36, marginBottom:12, opacity:0.4 }} /><br/>
              Bạn chưa đăng câu trả lời nào.
            </div>
          )}
        </div>
      )
    }
  ];

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:1000, margin:'0 auto' }}>

      {/* ── Profile Card ─────────────────────────────────────── */}
      <Card styles={{ body:{ padding:0 } }}
        style={{ borderRadius:16, border:'none', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', overflow:'hidden' }}>

        {/* Rainbow top strip */}
        <div style={{ height:7, background:'linear-gradient(to right,#1890ff,#722ed1,#f5222d,#fadb14)' }} />

        <div style={{ padding:'28px 32px' }}>
          <div style={{ display:'flex', gap:28, alignItems:'flex-start', flexWrap:'wrap' }}>

            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <img src={user.avatar} alt={user.name}
                style={{ width:110, height:110, borderRadius:'50%', border:'4px solid #fff',
                  boxShadow:'0 4px 16px rgba(0,0,0,0.15)', background:'#e6f7ff' }}
              />
              <span style={{ position:'absolute', bottom:6, right:6, width:18, height:18, borderRadius:'50%',
                background:'#52c41a', border:'3px solid #fff' }} />
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:260 }}>
              {isEditing ? (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={styles.editLabel}>Tên hiển thị</label>
                    <Input value={editedName} onChange={e => setEditedName(e.target.value)} maxLength={60} style={{ borderRadius:7 }} />
                  </div>
                  <div>
                    <label style={styles.editLabel}>Giới thiệu bản thân</label>
                    <TextArea value={editedBio} onChange={e => setEditedBio(e.target.value)}
                      rows={3} maxLength={300} placeholder="Giới thiệu ngắn gọn..." style={{ borderRadius:7 }} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={styles.editLabel}>Khoa / Đơn vị</label>
                      <Input value={editedFaculty} onChange={e => setEditedFaculty(e.target.value)} style={{ borderRadius:7 }} />
                    </div>
                    <div>
                      <label style={styles.editLabel}>{role === 'lecturer' ? 'Mã giảng viên' : 'Mã sinh viên'}</label>
                      <Input value={editedStudentId} onChange={e => setEditedStudentId(e.target.value)} style={{ borderRadius:7 }} />
                    </div>
                  </div>
                  <Space>
                    <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} loading={saving} style={{ borderRadius:7 }}>Lưu</Button>
                    <Button icon={<CloseOutlined />} onClick={() => { setIsEditing(false); setEditedName(user.name); setEditedBio(user.bio || ''); }}
                      style={{ borderRadius:7 }}>Hủy</Button>
                  </Space>
                </div>
              ) : (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                        <Title level={3} style={{ margin:0 }}>{user.name}</Title>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px',
                          borderRadius:20, fontSize:12, fontWeight:600,
                          background: roleCfg.bg, color: roleCfg.color }}>
                          {roleCfg.icon} {roleCfg.label}
                        </span>
                      </div>
                      <Text type="secondary" style={{ display:'flex', alignItems:'center', gap:6, fontSize:14 }}>
                        <MailOutlined /> {user.email}
                      </Text>
                    </div>
                    <Space>
                      <Button type="dashed" icon={<EditOutlined />} onClick={() => setIsEditing(true)} style={{ borderRadius:7 }}>Chỉnh sửa</Button>
                      <Button icon={<LockOutlined />} onClick={() => setChangePwdVisible(true)} style={{ borderRadius:7 }}>Đổi mật khẩu</Button>
                      <Button icon={<LogoutOutlined />} danger onClick={handleLogout} style={{ borderRadius:7 }}>Đăng xuất</Button>
                    </Space>
                  </div>

                  {/* Bio */}
                  <div style={{ margin:'14px 0', padding:'10px 14px', background:'rgba(24,144,255,0.03)',
                    borderRadius:8, borderLeft:'3px solid #1890ff' }}>
                    <Paragraph style={{ margin:0, fontStyle: user.bio ? 'normal' : 'italic',
                      color: user.bio ? '#262626' : '#bfbfbf', lineHeight:1.65, fontSize:13.5 }}>
                      {user.bio || 'Chưa cập nhật giới thiệu tiểu sử.'}
                    </Paragraph>
                  </div>

                  {/* Info row */}
                  <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                    <Space style={{ color:'#595959', fontSize:13 }}><BookOutlined style={{ color:'#722ed1' }} /><span>{user.faculty}</span></Space>
                    {user.studentId && <Space style={{ color:'#595959', fontSize:13 }}><IdcardOutlined style={{ color:'#1890ff' }} /><span>{user.studentId}</span></Space>}
                    <Space style={{ color:'#595959', fontSize:13 }}><CalendarOutlined style={{ color:'#fa8c16' }} /><span>Tham gia: <b>{formatDate(user.joinDate)}</b></span></Space>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats bar ──────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #f0f0f0' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding:'16px 0', textAlign:'center', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:700, color:'#262626', lineHeight:1 }}>{s.value.toLocaleString()}</div>
              <div style={{ fontSize:12, color:'#8c8c8c', marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Activity Tabs Card ────────────────────────────────── */}
      <Card style={{ borderRadius:16, boxShadow:'0 4px 20px rgba(0,0,0,0.04)', border:'none' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" items={tabItems} style={{ marginTop:-8 }} />
      </Card>

      {/* ── Đổi mật khẩu Modal ───────────────────────────────── */}
      <Modal
        title={<span><LockOutlined style={{ marginRight:8, color:'#1890ff' }} />Đổi mật khẩu</span>}
        open={changePwdVisible}
        onOk={handleChangePwd}
        onCancel={() => { setChangePwdVisible(false); setCurPwd(''); setNewPwd(''); setConfirmPwd(''); }}
        okText="Xác nhận đổi"
        cancelText="Hủy"
        confirmLoading={pwdLoading}
        style={{ borderRadius:14 }}
      >
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:16 }}>
          <div>
            <label style={styles.editLabel}>Mật khẩu hiện tại</label>
            <Input.Password value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="Nhập mật khẩu hiện tại..." style={{ borderRadius:7 }} />
          </div>
          <div>
            <label style={styles.editLabel}>Mật khẩu mới</label>
            <Input.Password value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Ít nhất 6 ký tự..." style={{ borderRadius:7 }} />
          </div>
          <div>
            <label style={styles.editLabel}>Xác nhận mật khẩu mới</label>
            <Input.Password value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Nhập lại mật khẩu mới..." style={{ borderRadius:7 }} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  editLabel: { fontSize: 13, fontWeight: 500, color: '#595959', display: 'block', marginBottom: 5 } as React.CSSProperties,
};

export default UserProfile;
