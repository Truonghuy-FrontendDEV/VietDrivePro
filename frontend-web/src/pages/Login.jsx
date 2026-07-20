import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../components/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.password) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      nav(data.user.role === 'Admin' ? '/admin' : '/');
    } catch (e) { setError(e.response?.data?.message || 'Đăng nhập thất bại.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">🚗</div>
            <span>VietDrivePro</span>
          </div>
          <h1>Hệ thống ôn thi<br /><span>bằng lái xe</span><br />chuyên nghiệp</h1>
          <p>600 câu hỏi cập nhật 2025, đầy đủ 7 hạng bằng A1, A2, B1, B2, C, D, E</p>
          <div className="auth-features">
            {['📚 600 câu hỏi chuẩn bộ GTVT','🎯 Đề thi sát với kỳ thi thật','📊 Thống kê tiến độ học tập','🚦 Tra cứu biển báo giao thông'].map(f => (
              <div key={f} className="auth-feature-item"><span>✓</span>{f}</div>
            ))}
          </div>
          <div className="auth-stats">
            <div className="auth-stat"><strong>600+</strong><span>Câu hỏi</span></div>
            <div className="auth-stat"><strong>7</strong><span>Hạng bằng</span></div>
            <div className="auth-stat"><strong>6</strong><span>Chương học</span></div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Đăng nhập</h2>
            <p>Chào mừng trở lại! Đăng nhập để tiếp tục học.</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input className="form-control input-with-icon"
                placeholder="example@email.com" value={form.email}
                onChange={set('email')} onKeyDown={e => e.key==='Enter'&&submit()} autoFocus />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input className="form-control input-with-icon"
                type={showPwd ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={form.password} onChange={set('password')}
                onKeyDown={e => e.key==='Enter'&&submit()} />
              <button className="input-eye" type="button" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg auth-submit-btn"
            onClick={submit} disabled={loading}>
            {loading ? <><span className="btn-spinner"/>Đang đăng nhập...</> : '🚀 Đăng nhập'}
          </button>

          <div className="auth-divider"><span>Chưa có tài khoản?</span></div>
          <Link to="/register" className="btn btn-ghost btn-lg auth-submit-btn">
            ✏️ Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
}