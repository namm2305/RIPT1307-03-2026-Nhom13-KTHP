import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserOutlined, MailOutlined, LockOutlined, CheckOutlined, ExclamationCircleOutlined, ArrowRightOutlined, EyeOutlined, EyeInvisibleOutlined, BookOutlined, NumberOutlined } from '@ant-design/icons';

const FACULTIES = [
  'Khoa Công nghệ Thông tin 1',
  'Khoa Công nghệ Thông tin 2',
  'Khoa Viễn thông 1',
  'Khoa Viễn thông 2',
  'Khoa Kỹ thuật Điện tử 1',
  'Khoa Kỹ thuật Điện tử 2',
  'Khoa Cơ bản 1',
  'Khoa Cơ bản 2',
  'Khoa Quản trị Kinh doanh',
  'Khoa Tài chính Kế toán',
  'Khoa Quốc tế và Đào tạo Sau đại học',
  'Khoa khác',
];

const ROLES = [
  { value: 'student', label: '🎓 Sinh viên', desc: 'Đặt câu hỏi, trả lời, bình chọn' },
  { value: 'lecturer', label: '📚 Giảng viên', desc: 'Xác nhận câu trả lời, ghim câu hỏi' },
];

const API_BASE = 'http://localhost:5050/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [faculty, setFaculty] = useState(FACULTIES[0]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const [pwdReqs, setPwdReqs] = useState({ length: false, numberOrSpecial: false, caseSensitive: false });
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/profile');
  }, [navigate]);

  useEffect(() => {
    setPwdReqs({
      length: password.length >= 6,
      numberOrSpecial: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password),
      caseSensitive: /[a-z]/.test(password) && /[A-Z]/.test(password),
    });
  }, [password]);

  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: 'transparent' };
    let score = 0;
    if (pwdReqs.length) score++;
    if (pwdReqs.numberOrSpecial) score++;
    if (pwdReqs.caseSensitive) score++;
    switch (score) {
      case 1: return { score: 33, text: 'Yếu', color: '#ff4d4f' };
      case 2: return { score: 66, text: 'Trung bình', color: '#faad14' };
      case 3: return { score: 100, text: 'Mạnh', color: '#52c41a' };
      default: return { score: 15, text: 'Rất yếu', color: '#ff4d4f' };
    }
  };

  const validateName = (val: string) => {
    if (!val.trim()) { setNameError('Vui lòng nhập họ tên đầy đủ'); return false; }
    if (val.trim().length < 2) { setNameError('Họ tên phải chứa ít nhất 2 ký tự'); return false; }
    setNameError(''); return true;
  };
  const validateEmail = (val: string) => {
    if (!val) { setEmailError('Vui lòng nhập email'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(val)) { setEmailError('Email không hợp lệ'); return false; }
    setEmailError(''); return true;
  };
  const validatePassword = (val: string) => {
    if (!val) { setPasswordError('Vui lòng nhập mật khẩu'); return false; }
    if (val.length < 6) { setPasswordError('Mật khẩu phải từ 6 ký tự trở lên'); return false; }
    setPasswordError(''); return true;
  };
  const validateConfirmPassword = (val: string, pwdVal = password) => {
    if (!val) { setConfirmPasswordError('Vui lòng xác nhận mật khẩu'); return false; }
    if (val !== pwdVal) { setConfirmPasswordError('Mật khẩu xác nhận không trùng khớp'); return false; }
    setConfirmPasswordError(''); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const ok = [
      validateName(name),
      validateEmail(email),
      validatePassword(password),
      validateConfirmPassword(confirmPassword),
    ].every(Boolean);

    if (!ok) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, faculty, studentId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Đăng ký thất bại');
        return;
      }

      // Lưu token & user vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));

      setRegisterSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch {
      // Fallback nếu server chưa chạy: dùng mock
      const mockSession = {
        id: 'u-registered',
        name,
        email,
        role,
        roleDisplay: role === 'lecturer' ? 'Giảng viên' : 'Sinh viên',
        faculty,
        studentId,
        bio: 'Thành viên mới gia nhập diễn đàn Q&A của PTIT.',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        joinDate: new Date().toISOString(),
        reputation: 10,
      };
      localStorage.setItem('user', JSON.stringify(mockSession));
      window.dispatchEvent(new Event('storage'));
      setRegisterSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.45s ease-out both; }
        .spinner { animation: spin 0.8s linear infinite; }
        .shake { animation: shake 0.3s ease-in-out; }
        .slide-up { animation: slideUp 0.4s ease-out both; }
        .input-wrap:focus-within { border-color: #1890ff !important; box-shadow: 0 0 0 2px rgba(24,144,255,0.2) !important; }
        .input-err { border-color: #ff4d4f !important; box-shadow: 0 0 0 2px rgba(255,77,79,0.2) !important; }
        .role-card { cursor:pointer; border:2px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 14px; transition:all 0.2s; }
        .role-card:hover { border-color: rgba(24,144,255,0.5); background: rgba(24,144,255,0.06); }
        .role-card.selected { border-color: #1890ff; background: rgba(24,144,255,0.12); }
        select option { background: #1e1b4b; color: #fff; }
        .submit-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(24,144,255,0.4); }
        .submit-btn { transition: all 0.25s ease; width:100%; }
      `}} />

      <div style={styles.bgCircles}>
        <div style={{...styles.circle, width:'400px',height:'400px',background:'#1890ff',top:'-10%',left:'5%'}} />
        <div style={{...styles.circle, width:'450px',height:'450px',background:'#722ed1',bottom:'-10%',right:'5%'}} />
      </div>

      <div className="fade-in" style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}><span style={styles.logoText}>PTIT</span></div>
          <h2 style={styles.title}>Đăng Ký Tài Khoản</h2>
          <p style={styles.subtitle}>Tham gia cộng đồng học tập PTIT</p>
        </div>

        {registerSuccess ? (
          <div className="slide-up" style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Đăng ký thành công!</h3>
            <p style={styles.successText}>Đang chuyển đến trang hồ sơ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* Lựa chọn Role */}
            <div style={styles.group}>
              <label style={styles.label}>Bạn là</label>
              <div style={{ display:'flex', gap:'10px' }}>
                {ROLES.map(r => (
                  <div
                    key={r.value}
                    className={`role-card${role === r.value ? ' selected' : ''}`}
                    onClick={() => setRole(r.value as 'student' | 'lecturer')}
                    style={{ flex:1 }}
                  >
                    <div style={{ fontSize:'14px', fontWeight:600, color:'#fff', marginBottom:'3px' }}>{r.label}</div>
                    <div style={{ fontSize:'11.5px', color:'#94a3b8', lineHeight:'1.4' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Họ tên */}
            <div style={styles.group}>
              <label style={styles.label}>Họ và tên</label>
              <div className={`input-wrap${nameError ? ' input-err' : ''}`} style={styles.inputWrap}>
                <UserOutlined style={{ fontSize: 17, ...(nameError ? styles.iconErr : styles.icon) }} />
                <input
                  type="text" placeholder="Nhập họ và tên đầy đủ..."
                  value={name} onChange={e => { setName(e.target.value); validateName(e.target.value); }}
                  style={styles.input} disabled={isLoading}
                />
              </div>
              {nameError && <div className="shake" style={styles.err}><ExclamationCircleOutlined style={{ fontSize: 13 }} /><span>{nameError}</span></div>}
            </div>

            {/* Email */}
            <div style={styles.group}>
              <label style={styles.label}>Địa chỉ Email</label>
              <div className={`input-wrap${emailError ? ' input-err' : ''}`} style={styles.inputWrap}>
                <MailOutlined style={{ fontSize: 17, ...(emailError ? styles.iconErr : styles.icon) }} />
                <input
                  type="email" placeholder={role === 'lecturer' ? 'Nhập email giảng viên...' : 'Nhập email sinh viên...'}
                  value={email} onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); }}
                  style={styles.input} disabled={isLoading}
                />
              </div>
              {emailError && <div className="shake" style={styles.err}><ExclamationCircleOutlined style={{ fontSize: 13 }} /><span>{emailError}</span></div>}
            </div>

            {/* Mã sinh viên / Mã GV */}
            <div style={styles.group}>
              <label style={styles.label}>{role === 'lecturer' ? 'Mã giảng viên' : 'Mã sinh viên'} <span style={styles.optional}>(tuỳ chọn)</span></label>
              <div className="input-wrap" style={styles.inputWrap}>
                <NumberOutlined style={{ fontSize: 17, ...(styles.icon as any) }} />
                <input
                  type="text" placeholder={role === 'lecturer' ? 'VD: GV12345' : 'VD: B21DCCN123'}
                  value={studentId} onChange={e => setStudentId(e.target.value)}
                  style={styles.input} disabled={isLoading}
                />
              </div>
            </div>

            {/* Khoa */}
            <div style={styles.group}>
              <label style={styles.label}>Khoa / Đơn vị</label>
              <div className="input-wrap" style={styles.inputWrap}>
                <BookOutlined style={{ fontSize: 17, ...(styles.icon as any) }} />
                <select
                  value={faculty} onChange={e => setFaculty(e.target.value)}
                  style={{ ...styles.input, cursor:'pointer' }}
                  disabled={isLoading}
                >
                  {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* Mật khẩu */}
            <div style={styles.group}>
              <label style={styles.label}>Mật khẩu</label>
              <div className={`input-wrap${passwordError ? ' input-err' : ''}`} style={styles.inputWrap}>
                <LockOutlined style={{ fontSize: 17, ...(passwordError ? styles.iconErr : styles.icon) }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự..."
                  value={password} onChange={e => { setPassword(e.target.value); validatePassword(e.target.value); if(confirmPassword) validateConfirmPassword(confirmPassword, e.target.value); }}
                  style={styles.input} disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                  {showPassword ? <EyeInvisibleOutlined style={{ fontSize: 17 }} /> : <EyeOutlined style={{ fontSize: 17 }} />}
                </button>
              </div>
              {password && (
                <div className="slide-up" style={styles.strengthWrap}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11.5px', marginBottom:'5px' }}>
                    <span style={{ color:'#94a3b8' }}>Độ mạnh:</span>
                    <span style={{ fontWeight:600, color: strength.color }}>{strength.text}</span>
                  </div>
                  <div style={{ height:'3px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', overflow:'hidden', marginBottom:'7px' }}>
                    <div style={{ height:'100%', width:`${strength.score}%`, backgroundColor: strength.color, transition:'all 0.3s ease', borderRadius:'2px' }} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3px 8px' }}>
                    {[
                      [pwdReqs.length, 'Ít nhất 6 ký tự'],
                      [pwdReqs.caseSensitive, 'Chữ hoa & chữ thường'],
                      [pwdReqs.numberOrSpecial, 'Số hoặc ký tự đặc biệt'],
                    ].map(([ok, text]) => (
                      <span key={text as string} style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color: ok ? '#52c41a' : '#64748b' }}>
                        <CheckOutlined style={{ fontSize: 11 }} />{text as string}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {passwordError && !password && <div className="shake" style={styles.err}><ExclamationCircleOutlined style={{ fontSize: 13 }} /><span>{passwordError}</span></div>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div style={styles.group}>
              <label style={styles.label}>Xác nhận mật khẩu</label>
              <div className={`input-wrap${confirmPasswordError ? ' input-err' : ''}`} style={styles.inputWrap}>
                <LockOutlined style={{ fontSize: 17, ...(confirmPasswordError ? styles.iconErr : styles.icon) }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu..."
                  value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); validateConfirmPassword(e.target.value); }}
                  style={styles.input} disabled={isLoading}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn} tabIndex={-1}>
                  {showConfirmPassword ? <EyeInvisibleOutlined style={{ fontSize: 17 }} /> : <EyeOutlined style={{ fontSize: 17 }} />}
                </button>
              </div>
              {confirmPasswordError && <div className="shake" style={styles.err}><ExclamationCircleOutlined style={{ fontSize: 13 }} /><span>{confirmPasswordError}</span></div>}
            </div>

            {/* Server error */}
            {serverError && (
              <div style={{ ...styles.err, padding:'10px 14px', background:'rgba(255,77,79,0.1)', borderRadius:'8px', marginTop:'-4px' }}>
                <ExclamationCircleOutlined style={{ fontSize: 14 }} /><span>{serverError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              className="submit-btn"
              style={{ ...styles.submitBtn, opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop:'8px' }}
            >
              {isLoading ? (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'8px' }}>
                  <div className="spinner" style={{ width:'17px', height:'17px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff' }} />
                  <span>Đang tạo tài khoản...</span>
                </div>
              ) : (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px' }}>
                  <span>Đăng Ký Ngay</span><ArrowRightOutlined style={{ fontSize: 17 }} />
                </div>
              )}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <span>Đã có tài khoản? </span>
          <Link to="/login" style={styles.link}>Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display:'flex', justifyContent:'center', alignItems:'center',
    minHeight:'100vh', padding:'32px 20px',
    background:'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    position:'relative', overflow:'hidden',
    fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  bgCircles: { position:'absolute', width:'100%', height:'100%', top:0, left:0, zIndex:0 },
  circle: { position:'absolute', borderRadius:'50%', filter:'blur(80px)', opacity:0.14 },
  card: {
    position:'relative', zIndex:1, width:'100%', maxWidth:'500px',
    backgroundColor:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'18px', padding:'36px 40px',
    boxShadow:'0 8px 40px rgba(0,0,0,0.4)', backdropFilter:'blur(20px)',
    color:'#fff', display:'flex', flexDirection:'column', gap:'20px',
  },
  header: { textAlign:'center' },
  logo: {
    width:'60px', height:'60px', borderRadius:'15px',
    background:'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
    display:'flex', justifyContent:'center', alignItems:'center',
    margin:'0 auto 14px auto', boxShadow:'0 4px 15px rgba(24,144,255,0.3)',
  },
  logoText: { fontSize:'17px', fontWeight:'bold', letterSpacing:'1px', color:'#fff' },
  title: { fontSize:'22px', fontWeight:700, margin:'0 0 6px 0', background:'linear-gradient(to right,#fff,#e2e8f0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  subtitle: { fontSize:'13.5px', color:'#94a3b8', margin:0 },
  group: { display:'flex', flexDirection:'column', gap:'7px' },
  label: { fontSize:'13.5px', fontWeight:500, color:'#cbd5e1' },
  optional: { fontSize:'12px', color:'#64748b', fontWeight:400 },
  inputWrap: {
    display:'flex', alignItems:'center',
    background:'rgba(15,23,42,0.6)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'9px', padding:'0 13px', height:'44px', transition:'all 0.25s',
  },
  icon: { color:'#64748b', marginRight:'10px', flexShrink:0 },
  iconErr: { color:'#ff4d4f', marginRight:'10px', flexShrink:0 },
  input: { width:'100%', background:'none', border:'none', outline:'none', color:'#fff', fontSize:'14.5px', height:'100%' },
  eyeBtn: { background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:0, display:'flex', alignItems:'center', marginLeft:'8px' },
  err: { display:'flex', alignItems:'center', gap:'5px', color:'#ff4d4f', fontSize:'12.5px' },
  strengthWrap: { background:'rgba(15,23,42,0.35)', borderRadius:'7px', padding:'8px 12px', border:'1px solid rgba(255,255,255,0.05)' },
  submitBtn: {
    height:'46px', border:'none', borderRadius:'9px',
    background:'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
    color:'#fff', fontSize:'15.5px', fontWeight:600,
    boxShadow:'0 4px 15px rgba(24,144,255,0.2)',
  },
  successBox: { textAlign:'center', padding:'20px 10px' },
  successIcon: {
    width:'60px', height:'60px', borderRadius:'50%',
    background:'rgba(82,196,26,0.15)', border:'2px solid #52c41a', color:'#52c41a',
    display:'flex', justifyContent:'center', alignItems:'center',
    fontSize:'26px', margin:'0 auto 16px auto',
  },
  successTitle: { fontSize:'19px', fontWeight:600, color:'#52c41a', margin:'0 0 8px 0' },
  successText: { color:'#94a3b8', fontSize:'14px', margin:0 },
  footer: { textAlign:'center', fontSize:'13.5px', color:'#94a3b8' },
  link: { color:'#1890ff', textDecoration:'none', fontWeight:500 },
};

export default Register;
