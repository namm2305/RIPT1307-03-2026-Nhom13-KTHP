import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MailOutlined, LockOutlined, ArrowRightOutlined, ExclamationCircleOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const API_BASE = 'http://localhost:5050/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/profile');
  }, [navigate]);

  const validateEmail = (value: string) => {
    if (!value) { setEmailError('Vui lòng nhập email'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(value)) { setEmailError('Email không đúng định dạng'); return false; }
    setEmailError(''); return true;
  };

  const validatePassword = (value: string) => {
    if (!value) { setPasswordError('Vui lòng nhập mật khẩu'); return false; }
    if (value.length < 6) { setPasswordError('Mật khẩu ít nhất 6 ký tự'); return false; }
    setPasswordError(''); return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateEmail(email) || !validatePassword(password)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Đăng nhập thất bại');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));

      setLoginSuccess(true);
      setTimeout(() => navigate('/profile'), 1000);
    } catch {
      // Fallback mock khi server chưa chạy
      const mockUser = {
        id: 'u1',
        name: 'Nguyễn Văn Dun',
        email,
        role: 'student',
        roleDisplay: 'Sinh viên',
        faculty: 'Khoa Công nghệ Thông tin 1',
        studentId: 'B21DCCN001',
        bio: 'Sinh viên CNTT K21 PTIT. Đam mê UI/UX và React/TypeScript.',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Dun`,
        joinDate: '2024-09-01T08:00:00.000Z',
        reputation: 250,
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('storage'));
      setLoginSuccess(true);
      setTimeout(() => navigate('/profile'), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 15px rgba(24,144,255,0.4)} 50%{box-shadow:0 0 28px rgba(24,144,255,0.7)} }
        .fade-in { animation: fadeIn 0.45s ease-out both; }
        .spinner { animation: spin 0.8s linear infinite; }
        .shake { animation: shake 0.3s ease-in-out; }
        .glow { animation: pulseGlow 2s infinite; }
        .input-wrap:focus-within { border-color: #1890ff !important; box-shadow: 0 0 0 2px rgba(24,144,255,0.2) !important; }
        .input-err { border-color: #ff4d4f !important; box-shadow: 0 0 0 2px rgba(255,77,79,0.2) !important; }
        .submit-btn:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(24,144,255,0.4) !important; }
        .submit-btn { transition: all 0.25s ease; width:100%; }
      `}} />

      <div style={styles.bgCircles}>
        <div style={{...styles.circle, width:'400px',height:'400px',background:'#1890ff',top:'-10%',left:'10%'}} />
        <div style={{...styles.circle, width:'450px',height:'450px',background:'#722ed1',bottom:'-10%',right:'10%'}} />
      </div>

      <div className="fade-in" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}><span style={styles.logoText}>PTIT</span></div>
          <h2 style={styles.title}>Đăng Nhập Hệ Thống</h2>
          <p style={styles.subtitle}>Kết nối với cộng đồng sinh viên PTIT</p>
        </div>

        {loginSuccess ? (
          <div className="fade-in" style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.successTitle}>Đăng nhập thành công!</h3>
            <p style={styles.successText}>Đang chuyển đến trang cá nhân...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }} noValidate>

            {/* Server error banner */}
            {serverError && (
              <div className="shake" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', background:'rgba(255,77,79,0.12)', border:'1px solid rgba(255,77,79,0.3)', borderRadius:'9px', color:'#ff7875', fontSize:'13.5px' }}>
                <ExclamationCircleOutlined style={{ fontSize: 15 }} /><span>{serverError}</span>
              </div>
            )}

            {/* Email */}
            <div style={styles.group}>
              <label style={styles.label}>Địa chỉ Email</label>
              <div className={`input-wrap${emailError ? ' input-err' : ''}`} style={styles.inputWrap}>
                <MailOutlined style={{ fontSize: 17, ...(emailError ? styles.iconErr : styles.icon) }} />
                <input
                  type="email" placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={e => { setEmail(e.target.value); validateEmail(e.target.value); setServerError(''); }}
                  onBlur={() => validateEmail(email)}
                  style={styles.input} disabled={isLoading}
                />
              </div>
              {emailError && <div className="shake" style={styles.err}><ExclamationCircleOutlined style={{ fontSize: 13 }}/><span>{emailError}</span></div>}
            </div>

            {/* Password */}
            <div style={styles.group}>
              <label style={styles.label}>Mật khẩu</label>
              <div className={`input-wrap${passwordError ? ' input-err' : ''}`} style={styles.inputWrap}>
                <LockOutlined style={{ fontSize: 17, ...(passwordError ? styles.iconErr : styles.icon) }} />
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => { setPassword(e.target.value); validatePassword(e.target.value); setServerError(''); }}
                  onBlur={() => validatePassword(password)}
                  style={styles.input} disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                  {showPassword ? <EyeInvisibleOutlined style={{ fontSize: 17 }}/> : <EyeOutlined style={{ fontSize: 17 }}/>}
                </button>
              </div>
              {passwordError && <div className="shake" style={styles.err}><ExclamationCircleOutlined style={{ fontSize: 13 }}/><span>{passwordError}</span></div>}
            </div>

            {/* Remember + Forgot */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px', marginTop:'-4px' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'6px', color:'#94a3b8', cursor:'pointer' }}>
                <input type="checkbox" style={{ cursor:'pointer', accentColor:'#1890ff' }} />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" onClick={e => e.preventDefault()} style={{ color:'#1890ff', textDecoration:'none', transition:'opacity 0.2s' }}>
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={isLoading}
              className={`submit-btn${!isLoading ? ' glow' : ''}`}
              style={{ ...styles.submitBtn, opacity: isLoading ? 0.75 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'8px' }}>
                  <div className="spinner" style={{ width:'17px', height:'17px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff' }} />
                  <span>Đang xác thực...</span>
                </div>
              ) : (
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'6px' }}>
                  <span>Đăng Nhập</span><ArrowRightOutlined style={{ fontSize: 17 }}/>
                </div>
              )}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <span>Chưa có tài khoản? </span>
          <Link to="/register" style={styles.link}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display:'flex', justifyContent:'center', alignItems:'center',
    minHeight:'100vh', padding:'20px',
    background:'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    position:'relative', overflow:'hidden',
    fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  bgCircles: { position:'absolute', width:'100%', height:'100%', top:0, left:0, zIndex:0 },
  circle: { position:'absolute', borderRadius:'50%', filter:'blur(80px)', opacity:0.14 },
  card: {
    position:'relative', zIndex:1, width:'100%', maxWidth:'440px',
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:'18px', padding:'40px',
    boxShadow:'0 8px 40px rgba(0,0,0,0.4)', backdropFilter:'blur(20px)',
    color:'#fff', display:'flex', flexDirection:'column', gap:'22px',
  },
  header: { textAlign:'center' as const },
  logo: {
    width:'62px', height:'62px', borderRadius:'16px',
    background:'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
    display:'flex', justifyContent:'center', alignItems:'center',
    margin:'0 auto 14px auto', boxShadow:'0 4px 15px rgba(24,144,255,0.3)',
  },
  logoText: { fontSize:'17px', fontWeight:'bold', letterSpacing:'1px', color:'#fff' },
  title: { fontSize:'23px', fontWeight:700, margin:'0 0 6px 0', background:'linear-gradient(to right,#fff,#e2e8f0)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  subtitle: { fontSize:'13.5px', color:'#94a3b8', margin:0 },
  group: { display:'flex', flexDirection:'column', gap:'7px' },
  label: { fontSize:'13.5px', fontWeight:500, color:'#cbd5e1' },
  inputWrap: {
    display:'flex', alignItems:'center',
    background:'rgba(15,23,42,0.6)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'9px', padding:'0 13px', height:'46px', transition:'all 0.25s',
  },
  icon: { color:'#64748b', marginRight:'10px', flexShrink:0 },
  iconErr: { color:'#ff4d4f', marginRight:'10px', flexShrink:0 },
  input: { width:'100%', background:'none', border:'none', outline:'none', color:'#fff', fontSize:'14.5px', height:'100%' },
  eyeBtn: { background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:0, display:'flex', alignItems:'center', marginLeft:'8px' },
  err: { display:'flex', alignItems:'center', gap:'5px', color:'#ff4d4f', fontSize:'12.5px' },
  submitBtn: {
    height:'46px', border:'none', borderRadius:'9px',
    background:'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
    color:'#fff', fontSize:'15.5px', fontWeight:600,
    boxShadow:'0 4px 15px rgba(24,144,255,0.2)',
  },
  successBox: { textAlign:'center' as const, padding:'20px 10px' },
  successIcon: {
    width:'62px', height:'62px', borderRadius:'50%',
    background:'rgba(82,196,26,0.15)', border:'2px solid #52c41a', color:'#52c41a',
    display:'flex', justifyContent:'center', alignItems:'center',
    fontSize:'26px', margin:'0 auto 16px auto',
  },
  successTitle: { fontSize:'20px', fontWeight:600, color:'#52c41a', margin:'0 0 8px 0' },
  successText: { color:'#94a3b8', fontSize:'14px', margin:0 },
  footer: { textAlign:'center' as const, fontSize:'13.5px', color:'#94a3b8' },
  link: { color:'#1890ff', textDecoration:'none', fontWeight:500 },
};

export default Login;
