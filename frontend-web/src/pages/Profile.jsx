import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../components/AuthContext';
import './Profile.css';

export function Profile() {
  const { user, logout, updateUser } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('info');
  const [pf, setPf] = useState({ fullName: user?.fullName || '', avatarURL: user?.avatarURL || '' });
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState(''); 
  const [err, setErr] = useState(''); 
  const [loading, setL] = useState(false);

  const saveProfile = async () => {
    if(!pf.fullName.trim()) {
      setErr('Tên không được trống.');
      return;
    }
    setL(true);
    setMsg('');
    setErr('');
    try { 
      const { data } = await api.put('/auth/update-profile', {
        fullName: pf.fullName.trim(),
        avatarURL: pf.avatarURL || null
      }); 
      updateUser({ fullName: data.fullName, avatarURL: data.avatarURL }); 
      setMsg('✅ Cập nhật thành công!'); 
      setTimeout(() => setMsg(''), 3000);
    } catch(e) {
      setErr(e.response?.data?.message || 'Lỗi.');
      setTimeout(() => setErr(''), 3000);
    } finally {
      setL(false);
    }
  };
  
  const changePwd = async () => {
    if(!pw.oldPassword || !pw.newPassword) {
      setErr('Điền đầy đủ.');
      return;
    }
    if(pw.newPassword.length < 6) {
      setErr('Mật khẩu mới ≥ 6 ký tự.');
      return;
    }
    if(pw.newPassword !== pw.confirm) {
      setErr('Xác nhận không khớp.');
      return;
    }
    setL(true);
    setMsg('');
    setErr('');
    try { 
      await api.put('/auth/change-password', {
        oldPassword: pw.oldPassword,
        newPassword: pw.newPassword
      }); 
      setMsg('✅ Đổi thành công! Đang đăng xuất...'); 
      setTimeout(() => {
        logout();
        nav('/login');
      }, 1500); 
    } catch(e) {
      setErr(e.response?.data?.message || 'Lỗi.');
      setTimeout(() => setErr(''), 3000);
    } finally {
      setL(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    ];
    return gradients[user?.id?.length % gradients.length] || gradients[0];
  };

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="container">
          <div className="profile-hero-content">
            <div className="profile-avatar-container">
              <div className="profile-avatar" style={{ background: getRandomGradient() }}>
                {user?.avatarURL ? 
                  <img src={user.avatarURL} alt={user?.fullName} onError={e => { e.target.style.display = 'none'; }} /> 
                  : <span className="avatar-initials">{getInitials(user?.fullName)}</span>
                }
              </div>
              <div className="profile-avatar-badge">
                {user?.role === 'Admin' ? '⚙️' : '👤'}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user?.fullName}</h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-role-badge">
                {user?.role === 'Admin' ? 'Quản trị viên' : 'Học viên'}
              </div>
            </div>
          </div>
        </div>
        <div className="profile-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </div>

      <div className="container">
        <div className="profile-card-wrapper">
          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${tab === 'info' ? 'active' : ''}`}
              onClick={() => { setTab('info'); setMsg(''); setErr(''); }}
            >
              <span className="tab-icon">✏️</span>
              <span className="tab-label">Thông tin cá nhân</span>
            </button>
            <button 
              className={`profile-tab ${tab === 'password' ? 'active' : ''}`}
              onClick={() => { setTab('password'); setMsg(''); setErr(''); }}
            >
              <span className="tab-icon">🔒</span>
              <span className="tab-label">Đổi mật khẩu</span>
            </button>
          </div>

          {/* Content Card */}
          <div className="profile-card">
            {err && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{err}</span>
                <button className="alert-close" onClick={() => setErr('')}>×</button>
              </div>
            )}
            {msg && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span className="alert-message">{msg}</span>
                <button className="alert-close" onClick={() => setMsg('')}>×</button>
              </div>
            )}
            
            {tab === 'info' ? (
              <div className="profile-form">
                <div className="form-section">
                  <h3 className="form-section-title">
                    <span className="section-icon">📝</span>
                    Thông tin cơ bản
                  </h3>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👤</span>
                      Họ và tên
                    </label>
                    <input 
                      className="form-input" 
                      value={pf.fullName} 
                      onChange={e => setPf(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="Nhập họ và tên của bạn"
                    />
                    <p className="form-hint">Tên sẽ hiển thị trên hệ thống và trong các bài thi</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📧</span>
                      Email
                    </label>
                    <input 
                      className="form-input form-input-disabled" 
                      value={user?.email} 
                      disabled 
                    />
                    <p className="form-hint">Email không thể thay đổi. Liên hệ admin nếu cần hỗ trợ.</p>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <span className="section-icon">🖼️</span>
                    Ảnh đại diện
                  </h3>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🔗</span>
                      URL Ảnh đại diện
                    </label>
                    <input 
                      className="form-input" 
                      value={pf.avatarURL} 
                      onChange={e => setPf(p => ({ ...p, avatarURL: e.target.value }))} 
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="form-hint">Nhập URL hình ảnh từ internet (JPG, PNG, GIF)</p>
                  </div>
                  {pf.avatarURL && (
                    <div className="avatar-preview">
                      <p className="preview-label">Xem trước:</p>
                      <img src={pf.avatarURL} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        💾 Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-section">
                  <h3 className="form-section-title">
                    <span className="section-icon">🔐</span>
                    Đổi mật khẩu
                  </h3>
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🔑</span>
                      Mật khẩu hiện tại
                    </label>
                    <input 
                      className="form-input" 
                      type="password" 
                      value={pw.oldPassword} 
                      onChange={e => setPw(p => ({ ...p, oldPassword: e.target.value }))}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">✨</span>
                      Mật khẩu mới
                    </label>
                    <input 
                      className="form-input" 
                      type="password" 
                      value={pw.newPassword} 
                      onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} 
                      placeholder="Tối thiểu 6 ký tự"
                    />
                    <div className="password-strength">
                      <div className="strength-bar"></div>
                      <p className="strength-text">Mật khẩu phải có ít nhất 6 ký tự</p>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">✓</span>
                      Xác nhận mật khẩu mới
                    </label>
                    <input 
                      className="form-input" 
                      type="password" 
                      value={pw.confirm} 
                      onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn btn-warning" onClick={changePwd} disabled={loading}>
                    {loading ? (
                      <>
                        <span className="btn-spinner"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        🔒 Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>

                <div className="security-note">
                  <span className="note-icon">🔐</span>
                  <div className="note-content">
                    <strong>Lưu ý bảo mật:</strong>
                    <p>Sau khi đổi mật khẩu thành công, bạn sẽ được đăng xuất và cần đăng nhập lại với mật khẩu mới.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}