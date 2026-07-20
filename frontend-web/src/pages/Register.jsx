import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.fullName || !form.email || !form.password) { setError('Vui lòng điền đầy đủ.'); return; }
    if (form.password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự.'); return; }
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', { fullName: form.fullName, email: form.email, password: form.password });
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => nav('/login'), 1500);
    } catch (e) { setError(e.response?.data?.message || 'Đăng ký thất bại.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand"><div className="auth-brand-icon">🚗</div><span>VietDrivePro</span></div>
          <h1>Bắt đầu hành trình<br /><span>chinh phục</span><br />bằng lái xe</h1>
          <p>Tạo tài khoản miễn phí và bắt đầu ôn luyện ngay hôm nay!</p>
          <div className="auth-features">
            {['🆓 Hoàn toàn miễn phí','📱 Học mọi lúc, mọi nơi','🏆 Tỷ lệ đậu cao','🔄 Cập nhật đề thi 2025'].map(f => (
              <div key={f} className="auth-feature-item"><span>✓</span>{f}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Điền thông tin bên dưới để tạo tài khoản mới.</p>
          </div>

          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <div className="form-group">
            <label className="form-label">Họ và tên <span>*</span></label>
            <div className="input-icon-wrap">
              <span className="input-icon">👤</span>
              <input className="form-control input-with-icon" placeholder="Nguyễn Văn A" value={form.fullName} onChange={set('fullName')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <div className="input-icon-wrap">
              <span className="input-icon">✉️</span>
              <input className="form-control input-with-icon" placeholder="email@example.com" value={form.email} onChange={set('email')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu <span>*</span></label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input className="form-control input-with-icon" type="password" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={set('password')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu <span>*</span></label>
            <div className="input-icon-wrap">
              <span className="input-icon">🔒</span>
              <input className="form-control input-with-icon" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={set('confirm')} onKeyDown={e => e.key==='Enter'&&submit()} />
            </div>
          </div>

          <button className="btn btn-primary btn-lg auth-submit-btn" onClick={submit} disabled={loading}>
            {loading ? <><span className="btn-spinner"/>Đang xử lý...</> : '🎉 Tạo tài khoản'}
          </button>
          <div className="auth-divider"><span>Đã có tài khoản?</span></div>
          <Link to="/login" className="btn btn-ghost btn-lg auth-submit-btn">← Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}