import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../components/AuthContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');

  // Lấy tên người dùng
  const firstName = user?.fullName?.split(' ').pop() || 'bạn';

  // Dữ liệu static cho các thành phần không cần API
  const featuredSigns = [
    { id: 1, name: 'Đường cấm', icon: '🚫', color: '#ef4444', desc: 'Biển báo cấm' },
    { id: 2, name: 'Dừng lại', icon: '🛑', color: '#dc2626', desc: 'Biển báo nguy hiểm' },
    { id: 3, name: 'Ưu tiên', icon: '⚠️', color: '#f59e0b', desc: 'Biển báo hiệu lệnh' },
    { id: 4, name: 'Tốc độ', icon: '🏁', color: '#3b82f6', desc: 'Biển báo chỉ dẫn' },
  ];

  const news = [
    { id: 1, title: 'Thay đổi luật giao thông 2024', date: '15/01/2024', type: 'Cập nhật' },
    { id: 2, title: 'Mẹo thi thực hành lái xe', date: '12/01/2024', type: 'Mẹo hay' },
    { id: 3, title: 'Lịch thi bằng B2 tháng 1', date: '10/01/2024', type: 'Thông báo' },
  ];

  useEffect(() => {
    // Xác định lời chào theo giờ
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    // Fetch dữ liệu từ API
    api.get('/stats/dashboard')
      .then(r => setStats(r.data))
      .catch(() => setError('Không tải được dữ liệu thống kê.'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="home">
      {/* ── Hero Banner ────────────────────────────────── */}
      <div className="home-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-greeting">
                <span>👋</span> {greeting}, {firstName}!
              </div>
              <h1 className="hero-title">
                Sẵn sàng chinh phục<br />
                <span className="hero-highlight">kỳ thi bằng lái xe</span>
              </h1>
              <p className="hero-desc">
                Hệ thống ôn luyện thông minh với 600+ câu hỏi chuẩn Bộ GTVT, 
                đầy đủ 7 hạng bằng A1, A2, B1, B2, C, D, E. Tỷ lệ đậu lên đến 95%!
              </p>
              <div className="hero-actions">
                <button className="btn btn-lg hero-cta" onClick={() => navigate('/exam')}>
                  🚀 Thi thử ngay
                </button>
                <button 
                  className="btn btn-ghost btn-lg" 
                  onClick={() => navigate('/question-bank')}
                  style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)' }}
                >
                  📚 Học 600 câu
                </button>
                <button 
                  className="btn btn-ghost btn-lg" 
                  onClick={() => navigate('/traffic-signs')}
                  style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}
                >
                  🚦 Học biển báo
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="hero-trust">
                <div className="trust-item">
                  <span>✅</span>
                  <span>Đề thi chuẩn GTVT</span>
                </div>
                <div className="trust-item">
                  <span>🎯</span>
                  <span>Có câu điểm liệt</span>
                </div>
                <div className="trust-item">
                  <span>⭐</span>
                  <span>50,000+ học viên</span>
                </div>
                <div className="trust-item">
                  <span>📱</span>
                  <span>Học mọi lúc</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-3d">
                <div className="hc-top">
                  <span className="hc-icon">🏆</span>
                  <span className="hc-label">Tỷ lệ đậu của bạn</span>
                </div>
                <div className="hc-value">
                  {loading ? '—' : `${stats?.passRate ?? 0}%`}
                </div>
                <div className="hc-sub">
                  Dựa trên {stats?.totalExams ?? 0} lần thi • Cao hơn trung bình 12%
                </div>
                <div className="hc-progress">
                  <div className="hc-bar" style={{ width: `${stats?.passRate ?? 0}%` }} />
                </div>
                {stats?.totalExams === 0 && (
                  <div className="hc-motivation">
                    <span>🎯 Hãy thi thử để xem kết quả!</span>
                  </div>
                )}
                {stats?.totalExams > 0 && stats?.passRate < 100 && (
                  <div className="hc-motivation">
                    <span>🎯 Cố lên! {100 - (stats?.passRate ?? 0)}% nữa là đạt 100%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </div>

      <div className="container">
        {/* ── Error Message ─────────────────────────────────── */}
        {error && (
          <div className="error-alert">
            ⚠️ {error}
          </div>
        )}

        {/* ── Stats Row ─────────────────────────────────── */}
        {!loading && stats && (
          <div className="stats-row">
            {[
              { icon: '📝', val: stats.totalExams, label: 'Tổng lượt thi', color: '#0066cc', bg: '#e6f2ff', trend: '+12%' },
              { icon: '✅', val: stats.passed, label: 'Lần đạt', color: '#10b981', bg: '#d1fae5', trend: '+8%' },
              { icon: '❌', val: stats.failed, label: 'Lần chưa đạt', color: '#ef4444', bg: '#fee2e2', trend: '-3%' },
              { icon: '🎯', val: stats.avgScore, label: 'Điểm TB', color: '#8b5cf6', bg: '#ede9fe', trend: '+5%' },
              { icon: '📌', val: stats.wrongCount, label: 'Câu cần ôn', color: '#f59e0b', bg: '#fed7aa', trend: 'Cần cố gắng' },
            ].map((s, idx) => (
              <div key={s.label} className="stat-chip" style={{ '--chip-color': s.color, '--chip-bg': s.bg }}>
                <div className="stat-chip-icon">{s.icon}</div>
                <div className="stat-chip-info">
                  <div className="stat-chip-val">{s.val}</div>
                  <div className="stat-chip-label">{s.label}</div>
                  <div className="stat-chip-trend" style={{ color: s.color }}>
                    {s.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Main Features Grid ─────────────────────────────── */}
        <div className="features-section">
          <div className="section-header">
            <h2 className="section-title">⚡ Tính năng nổi bật</h2>
            <Link to="/features" className="view-all">Xem tất cả →</Link>
          </div>
          <div className="quick-grid">
            {[
              { to: '/exam', icon: '📝', title: 'Thi thử thông minh', desc: 'Đề thi mô phỏng sát thực tế, chấm điểm tự động', gradient: 'linear-gradient(135deg,#0066cc,#3b82f6)' },
              { to: '/question-bank', icon: '📚', title: 'Ngân hàng 600+ câu', desc: 'Đầy đủ câu hỏi lý thuyết, có giải thích chi tiết', gradient: 'linear-gradient(135deg,#059669,#10b981)' },
              { to: '/wrong-answers', icon: '🎯', title: 'Ôn câu sai', desc: 'Tập trung vào điểm yếu, cải thiện nhanh chóng', gradient: 'linear-gradient(135deg,#dc2626,#ef4444)' },
              { to: '/traffic-signs', icon: '🚦', title: 'Biển báo giao thông', desc: 'Tra cứu 200+ biển báo theo chuẩn mới nhất', gradient: 'linear-gradient(135deg,#d97706,#f59e0b)' },
              { to: '/regulations', icon: '📋', title: 'Luật giao thông', desc: 'Cập nhật văn bản luật và mức xử phạt mới', gradient: 'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
              { to: '/history', icon: '📊', title: 'Lịch sử thi', desc: 'Theo dõi tiến trình, phân tích kết quả chi tiết', gradient: 'linear-gradient(135deg,#0891b2,#06b6d4)' },
            ].map(q => (
              <Link key={q.to} to={q.to} className="quick-card">
                <div className="qc-icon-wrap" style={{ background: q.gradient }}>
                  <span>{q.icon}</span>
                </div>
                <div className="qc-body">
                  <div className="qc-title">{q.title}</div>
                  <div className="qc-desc">{q.desc}</div>
                  <div className="qc-tag">Học ngay →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Two Column Section ─────────────────────────────── */}
        <div className="two-columns">
          {/* Recent Exam Sessions */}
          {stats?.recentSessions?.length > 0 && (
            <div className="recent-section">
              <div className="section-header">
                <h2 className="section-title">🕐 Lịch sử thi gần đây</h2>
                <Link to="/history" className="btn-outline-sm">Xem chi tiết</Link>
              </div>
              <div className="recent-list">
                {stats.recentSessions.map((s, i) => (
                  <div key={s.sessionID} className={`recent-row ${i % 2 === 0 ? 'even' : ''}`}>
                    <div className="rr-left">
                      <div className={`rr-status-dot ${s.status === 'Pass' ? 'pass' : 'fail'}`} />
                      <div>
                        <div className="rr-license">
                          Hạng {s.licenseType}
                          {s.status === 'Pass' && <span className="rr-badge-pass">Đã đạt</span>}
                          {s.status === 'Fail' && <span className="rr-badge-fail">Chưa đạt</span>}
                        </div>
                        <div className="rr-date">{formatDate(s.startTime)}</div>
                      </div>
                    </div>
                    <div className="rr-score">
                      <span className="rr-score-val">{s.score}</span>
                      <span className="rr-score-total">/{s.totalQuestions}</span>
                      <div className="rr-passing">Cần đạt {s.passingScore}</div>
                    </div>
                    <Link to={`/exam/result/${s.sessionID}`} className="btn-detail">
                      Xem lại
                      <span className="btn-arrow">→</span>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="recent-footer">
                <span className="footer-note">💡 Mẹo: Thi lại nhiều lần để cải thiện điểm số!</span>
              </div>
            </div>
          )}

          {/* Quick Tips & News */}
          <div className="tips-section">
            <div className="section-header">
              <h2 className="section-title">💡 Mẹo thi hiệu quả</h2>
            </div>
            <div className="tips-list">
              <div className="tip-card">
                <div className="tip-icon">🎯</div>
                <div className="tip-content">
                  <h4>Làm đề mỗi ngày</h4>
                  <p>Dành 30 phút mỗi ngày để làm 1 đề thi, duy trì thói quen giúp ghi nhớ lâu hơn</p>
                </div>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📝</div>
                <div className="tip-content">
                  <h4>Tập trung vào câu sai</h4>
                  <p>Ôn lại những câu đã sai, hiểu rõ nguyên nhân để không lặp lại lỗi</p>
                </div>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🚦</div>
                <div className="tip-content">
                  <h4>Học biển báo theo nhóm</h4>
                  <p>Phân loại biển báo theo hình dạng và màu sắc để dễ nhớ hơn</p>
                </div>
              </div>
            </div>
            
            {/* News Updates */}
            <div className="news-section">
              <h3 className="news-title">📢 Cập nhật mới</h3>
              {news.map(item => (
                <div key={item.id} className="news-item">
                  <span className={`news-badge ${item.type === 'Cập nhật' ? 'update' : item.type === 'Mẹo hay' ? 'tip' : 'notice'}`}>
                    {item.type}
                  </span>
                  <span className="news-text">{item.title}</span>
                  <span className="news-date">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state khi chưa thi lần nào */}
        {!loading && stats?.totalExams === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3 className="empty-title">Bắt đầu hành trình ôn thi!</h3>
            <p className="empty-desc">
              Bạn chưa thi thử lần nào. Hãy thi thử để xem kết quả và thống kê.
            </p>
            <button onClick={() => navigate('/exam')} className="empty-btn">
              🚀 Thi thử ngay
            </button>
          </div>
        )}

        {/* ── Featured Traffic Signs ─────────────────────────────── */}
        <div className="signs-showcase">
          <div className="section-header">
            <h2 className="section-title">🚸 Biển báo phổ biến</h2>
            <Link to="/traffic-signs" className="view-all">Xem tất cả biển báo →</Link>
          </div>
          <div className="signs-grid">
            {featuredSigns.map(sign => (
              <div key={sign.id} className="sign-card">
                <div className="sign-icon" style={{ background: `${sign.color}15`, color: sign.color }}>
                  {sign.icon}
                </div>
                <div className="sign-name">{sign.name}</div>
                <div className="sign-desc">{sign.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── License Types Banner ─────────────────────────────── */}
        <div className="license-banner">
          <div className="lb-icon">🚗</div>
          <div className="lb-text">
            <h3>Bạn muốn thi bằng lái hạng nào?</h3>
            <p>Hệ thống hỗ trợ đầy đủ các hạng bằng theo quy định của Bộ GTVT</p>
          </div>
          <div className="lb-badges">
            {['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E', 'F'].map(b => (
              <div key={b} className="lb-badge">
                {b}
                <span className="badge-desc">Hạng {b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Call to Action Banner ─────────────────────────────── */}
        {stats?.totalExams > 0 && (
          <div className="cta-banner">
            <div className="cta-content">
              <h3>🎓 Sẵn sàng cho kỳ thi sắp tới?</h3>
              <p>Bắt đầu luyện thi ngay hôm nay với lộ trình học thông minh</p>
              <button className="btn cta-button" onClick={() => navigate('/exam')}>
                Bắt đầu thi thử miễn phí
                <span className="cta-arrow">→</span>
              </button>
            </div>
            <div className="cta-stats">
              <div className="cta-stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Học viên</span>
              </div>
              <div className="cta-stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Tỷ lệ đậu</span>
              </div>
              <div className="cta-stat">
                <span className="stat-number">600+</span>
                <span className="stat-label">Câu hỏi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}