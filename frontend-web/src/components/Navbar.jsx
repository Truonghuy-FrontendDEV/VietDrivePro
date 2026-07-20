// Navbar.jsx - Full với dữ liệu thật 100% (ĐÃ SỬA HOÀN CHỈNH)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from './AuthContext';
import './Navbar.css';

const LINKS = [
  { to: '/', icon: '🏠', label: 'Trang chủ', requiredRole: null },
  { to: '/exam', icon: '📝', label: 'Thi thử', requiredRole: null },
  { to: '/question-bank', icon: '📚', label: '600 câu hỏi', requiredRole: null },
  { to: '/wrong-answers', icon: '🎯', label: 'Câu sai', requiredRole: null },
  { to: '/traffic-signs', icon: '🚦', label: 'Biển báo', requiredRole: null },
  { to: '/regulations', icon: '📋', label: 'Luật GT', requiredRole: null },
  { to: '/history', icon: '📊', label: 'Lịch sử', requiredRole: null },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // User statistics state - DỮ LIỆU THẬT
  const [userStats, setUserStats] = useState({
    totalExams: 0,
    passedExams: 0,
    failedExams: 0,
    passRate: 0,
    avgScore: 0,
    wrongAnswers: 0,
    studiedQuestions: 0,
    rank: 'Mới bắt đầu',
    rankProgress: 0,
    nextRank: 'Học viên chăm chỉ',
    badges: []
  });
  
  // Notifications state - DỮ LIỆU THẬT (từ localStorage)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const ref = useRef(null);
  const notifRef = useRef(null);
  

  // ==================== LẤY DỮ LIỆU THẬT ====================
  
  // 1. Lấy lịch sử thi (từ API hoặc localStorage)
  const fetchRealExamHistory = useCallback(async () => {
    if (!user?.userID) return [];
    try {
      const response = await api.get(`/exam-result/user/${user.userID}`);
      if (response.data && response.data.length > 0) {
        return response.data;
      }
      throw new Error('API trả về rỗng');
    } catch (error) {
      console.log('⚠️ API lịch sử thi chưa có, đọc từ localStorage');
      // Fallback: đọc từ localStorage
      const localHistory = localStorage.getItem('exam_history');
      if (localHistory) {
        return JSON.parse(localHistory);
      }
      return [];
    }
  }, [user]);

  // 2. Lấy số câu sai (từ API hoặc localStorage)
  const fetchRealWrongAnswers = useCallback(async () => {
    if (!user?.userID) return 0;
    try {
      const response = await api.get(`/wrong-answers/user/${user.userID}/count`);
      if (response.data?.count !== undefined) {
        return response.data.count;
      }
      throw new Error('API trả về undefined');
    } catch (error) {
      console.log('⚠️ API câu sai chưa có, đọc từ localStorage');
      // Fallback: đếm từ localStorage
      const localWrong = localStorage.getItem('wrong_answers');
      if (localWrong) {
        return JSON.parse(localWrong).length || 0;
      }
      return 0;
    }
  }, [user]);

  // 3. Lấy tiến độ học 600 câu từ localStorage
  const fetchRealStudiedQuestions = useCallback(() => {
    try {
      const savedProgress = localStorage.getItem('question_bank_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const studied = Object.keys(progress).length;
        console.log('📊 Số câu đã học:', studied);
        return studied;
      }
      return 0;
    } catch (error) {
      console.error('Lỗi lấy tiến độ học:', error);
      return 0;
    }
  }, []);

  // 4. Lấy thông báo từ localStorage và API
  const fetchRealNotifications = useCallback(async () => {
    if (!user?.userID) return;
    
    try {
      let apiNotifs = [];
      try {
        const response = await api.get(`/notifications/user/${user.userID}`);
        apiNotifs = response.data || [];
      } catch (apiError) {
        console.log('API notifications chưa có, chỉ dùng localStorage');
      }
      
      const localNotifs = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      
      const formattedApiNotifs = apiNotifs.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        time: formatRealTime(notif.createdAt),
        read: notif.isRead || false,
        examID: notif.relatedExamID
      }));
      
      const formattedLocalNotifs = localNotifs.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        time: notif.time,
        read: notif.read || false,
        examID: notif.examID
      }));
      
      const allNotifs = [...formattedApiNotifs, ...formattedLocalNotifs];
      
      console.log('📢 Đã load notifications:', allNotifs.length, 'thông báo');
      
      setNotifications(allNotifs);
      setUnreadCount(allNotifs.filter(n => !n.read).length);
      
    } catch (error) {
      console.error('Lỗi lấy thông báo:', error);
      const localNotifs = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      setNotifications(localNotifs);
      setUnreadCount(localNotifs.filter(n => !n.read).length);
    }
  }, [user]);

  // Format thời gian
  const formatRealTime = (timestamp) => {
    if (!timestamp) return 'Vừa xong';
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // 5. Tính toán rank và huy hiệu
  const calculateRankAndBadges = (totalExams, passRate, avgScore, studiedQuestions, wrongAnswers) => {
    let rank = 'Mới bắt đầu';
    let rankProgress = 0;
    let nextRank = 'Học viên chăm chỉ';
    let badges = [];

    if (totalExams >= 50 && passRate >= 90 && avgScore >= 90) {
      rank = 'Huyền thoại';
      rankProgress = 100;
      nextRank = 'Tối thượng';
      badges.push({ name: '👑 Huyền thoại', icon: '👑', color: '#fbbf24' });
    } else if (totalExams >= 30 && passRate >= 85 && avgScore >= 85) {
      rank = 'Cao thủ';
      rankProgress = 80;
      nextRank = 'Huyền thoại';
      badges.push({ name: '🏆 Cao thủ', icon: '🏆', color: '#f59e0b' });
    } else if (totalExams >= 20 && passRate >= 80 && avgScore >= 80) {
      rank = 'Chuyên nghiệp';
      rankProgress = 60;
      nextRank = 'Cao thủ';
      badges.push({ name: '⭐ Chuyên nghiệp', icon: '⭐', color: '#10b981' });
    } else if (totalExams >= 10 && passRate >= 70) {
      rank = 'Học viên chăm chỉ';
      rankProgress = 40;
      nextRank = 'Chuyên nghiệp';
      badges.push({ name: '📚 Chăm chỉ', icon: '📚', color: '#3b82f6' });
    } else if (totalExams >= 5) {
      rank = 'Người mới';
      rankProgress = 20;
      nextRank = 'Học viên chăm chỉ';
      badges.push({ name: '🌱 Người mới', icon: '🌱', color: '#8b5cf6' });
    } else if (totalExams >= 1) {
      rank = 'Tập sự';
      rankProgress = 10;
      nextRank = 'Người mới';
      badges.push({ name: '🚗 Tập sự', icon: '🚗', color: '#6b7280' });
    }

    if (studiedQuestions === 600) {
      badges.push({ name: '💯 Hoàn thành 600 câu', icon: '💯', color: '#ef4444' });
    } else if (studiedQuestions >= 300) {
      badges.push({ name: '📖 Học 300 câu', icon: '📖', color: '#f59e0b' });
    } else if (studiedQuestions >= 100) {
      badges.push({ name: '🎯 Học 100 câu', icon: '🎯', color: '#06b6d4' });
    }

    if (wrongAnswers === 0 && studiedQuestions > 100) {
      badges.push({ name: '🎯 Chính xác tuyệt đối', icon: '🎯', color: '#ec489a' });
    }
    
    if (passRate >= 90 && totalExams >= 10) {
      badges.push({ name: '🎖️ Tỷ lệ đậu cao', icon: '🎖️', color: '#fbbf24' });
    }

    return { rank, rankProgress, nextRank, badges: badges.slice(0, 4) };
  };

  // 6. TỔNG HỢP TẤT CẢ DỮ LIỆU (ĐÃ SỬA - CÓ FALLBACK LOCALSTORAGE)
  const fetchAllRealData = useCallback(async () => {
    if (!user?.userID) return;
    
    setLoadingStats(true);
    try {
      // Lấy dữ liệu (có fallback localStorage)
      const [exams, wrongAnswers] = await Promise.all([
        fetchRealExamHistory(),
        fetchRealWrongAnswers()
      ]);
      
      const studiedQuestions = fetchRealStudiedQuestions();
      
      console.log('📚 Dữ liệu tổng hợp:');
      console.log('  - Số bài thi:', exams.length);
      console.log('  - Số câu đã học:', studiedQuestions);
      console.log('  - Số câu sai:', wrongAnswers);
      
      // Tính toán thống kê
      const totalExams = exams.length;
      const passedExams = exams.filter(e => e.isPassed === true || e.isPassed === 1 || e.status === 'Pass').length;
      const failedExams = totalExams - passedExams;
      const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
      const avgScore = totalExams > 0 
        ? exams.reduce((sum, e) => sum + (e.score || 0), 0) / totalExams 
        : 0;

      // Tính rank và huy hiệu
      const { rank, rankProgress, nextRank, badges } = calculateRankAndBadges(
        totalExams, passRate, avgScore, studiedQuestions, wrongAnswers
      );

      // Cập nhật state
      setUserStats({
        totalExams,
        passedExams,
        failedExams,
        passRate: Math.round(passRate),
        avgScore: avgScore.toFixed(1),
        wrongAnswers,
        studiedQuestions,
        rank,
        rankProgress,
        nextRank,
        badges
      });
      
      console.log('✅ Navbar đã cập nhật:', { 
        totalExams, 
        passedExams, 
        failedExams, 
        studiedQuestions 
      });
      
    } catch (error) {
      console.error('Lỗi tổng hợp dữ liệu:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [user, fetchRealExamHistory, fetchRealWrongAnswers, fetchRealStudiedQuestions]);

  // Mark notification as read
  const markNotificationAsRead = async (notifId) => {
    try {
      try {
        await api.put(`/notifications/${notifId}/read`);
      } catch (apiError) {
        console.log('API chưa có, chỉ update localStorage');
      }
      
      const localNotifs = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const updatedLocalNotifs = localNotifs.map(n => 
        n.id === notifId ? { ...n, read: true } : n
      );
      localStorage.setItem('local_notifications', JSON.stringify(updatedLocalNotifs));
      
      setNotifications(prev => prev.map(n => 
        n.id === notifId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      try {
        await api.put(`/notifications/user/${user.userID}/read-all`);
      } catch (apiError) {
        console.log('API chưa có, chỉ update localStorage');
      }
      
      const localNotifs = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const updatedLocalNotifs = localNotifs.map(n => ({ ...n, read: true }));
      localStorage.setItem('local_notifications', JSON.stringify(updatedLocalNotifs));
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả:', error);
    }
  };

  // LẮNG NGHE SỰ KIỆN
  useEffect(() => {
    const handleDataUpdate = () => {
      console.log('📢 Nhận được event cập nhật dữ liệu');
      fetchAllRealData();
      fetchRealNotifications();
    };
    
    const handleStorageChange = (e) => {
      console.log('📢 Storage changed:', e.key);
      if (e.key === 'question_bank_progress' || e.key === 'wrong_answers' || e.key === 'exam_history') {
        fetchAllRealData();
      }
      if (e.key === 'local_notifications') {
        fetchRealNotifications();
      }
    };
    
    window.addEventListener('examCompleted', handleDataUpdate);
    window.addEventListener('questionStudied', handleDataUpdate);
    window.addEventListener('wrongAnswersUpdated', handleDataUpdate);
    window.addEventListener('notificationReceived', handleDataUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('examCompleted', handleDataUpdate);
      window.removeEventListener('questionStudied', handleDataUpdate);
      window.removeEventListener('wrongAnswersUpdated', handleDataUpdate);
      window.removeEventListener('notificationReceived', handleDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchAllRealData, fetchRealNotifications]);

  // AUTO REFRESH
  useEffect(() => {
    fetchAllRealData();
    fetchRealNotifications();
    
    const statsInterval = setInterval(() => {
      fetchAllRealData();
    }, 30000);
    
    const notifInterval = setInterval(() => {
      fetchRealNotifications();
    }, 30000);
    
    return () => {
      clearInterval(statsInterval);
      clearInterval(notifInterval);
    };
  }, [fetchAllRealData, fetchRealNotifications]);

  // Close dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setOpen(false); 
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus tab
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Tab được focus, cập nhật dữ liệu');
      fetchAllRealData();
      fetchRealNotifications();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAllRealData, fetchRealNotifications]);

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
    setMobileMenuOpen(false);
  };

  const initial = user?.fullName?.[0]?.toUpperCase() || 'U';
  const fullName = user?.fullName || 'Người dùng';
  const firstName = fullName.split(' ').pop();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <div className="brand-logo">
              <span className="logo-icon">🚗</span>
              <span className="logo-badge">Pro</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">VietDrivePro</span>
              <span className="brand-slogan">Ôn thi bằng lái xe</span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Nav Links */}
          <div className={`navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {LINKS.map(l => (
              <Link 
                key={l.to} 
                to={l.to}
                className={`nav-link ${pathname === l.to ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-link-icon">{l.icon}</span>
                <span className="nav-link-text">{l.label}</span>
                {pathname === l.to && <span className="nav-active-dot"></span>}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="navbar-right">
            {/* Notifications */}
            <div className="notifications-dropdown" ref={notifRef}>
              <button 
                className={`notif-btn ${unreadCount > 0 ? 'has-notif' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="notif-icon">🔔</span>
                {unreadCount > 0 && (
                  <>
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    <span className="notif-pulse"></span>
                  </>
                )}
              </button>
              
              {showNotifications && (
                <div className="notif-menu">
                  <div className="notif-header">
                    <h4>
                      Thông báo
                      {unreadCount > 0 && (
                        <span className="notif-header-count">({unreadCount} mới)</span>
                      )}
                    </h4>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all" onClick={markAllAsRead}>
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <span>📭</span>
                        <p>Không có thông báo</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notif-item ${!notif.read ? 'unread' : ''}`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          <div className={`notif-icon ${notif.type}`}>
                            {notif.type === 'success' && '✅'}
                            {notif.type === 'warning' && '⚠️'}
                            {notif.type === 'info' && 'ℹ️'}
                            {notif.type === 'achievement' && '🏆'}
                          </div>
                          <div className="notif-content">
                            <div className="notif-title">{notif.title}</div>
                            <div className="notif-message">{notif.message}</div>
                            <div className="notif-time">{notif.time}</div>
                          </div>
                          {!notif.read && <div className="notif-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/exam')} title="Thi ngay">
                <span className="qa-icon">🚀</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/question-bank')} title="Học ngay">
                <span className="qa-icon">📖</span>
              </button>
            </div>

            {/* Admin Badge */}
            {user?.role === 'Admin' && (
              <Link to="/admin" className="admin-badge">
                <span className="badge-icon">⚙️</span>
                <span className="badge-text">Admin</span>
              </Link>
            )}

            {/* Avatar Dropdown */}
            <div className="avatar-dropdown" ref={ref}>
              <button className="navbar-avatar-btn" onClick={() => setOpen(v => !v)}>
                <div className="avatar-circle">
                  {user?.avatarURL ? (
                    <img src={user.avatarURL} alt="avatar" />
                  ) : (
                    <span className="avatar-initial">{initial}</span>
                  )}
                  <span className="avatar-status"></span>
                </div>
                <div className="avatar-info">
                  <span className="avatar-name">{firstName}</span>
                  <span className="avatar-role">{user?.role === 'Admin' ? 'Quản trị viên' : 'Học viên'}</span>
                </div>
                <span className="avatar-chevron">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="greeting">{getGreeting()},</div>
                    <div className="dropdown-avatar">
                      <div className="dropdown-avatar-circle">
                        {user?.avatarURL ? (
                          <img src={user.avatarURL} alt="avatar" />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="dropdown-user-info">
                        <div className="dropdown-name">{fullName}</div>
                        <div className="dropdown-email">{user?.email || 'user@example.com'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Thống kê */}
                  {loadingStats ? (
                    <div style={{ padding: '10px', textAlign: 'center' }}>
                      Đang tải dữ liệu...
                    </div>
                  ) : (
                    <div className="dropdown-stats">
                      <div className="dropdown-stat">
                        <span className="stat-value">{userStats.totalExams}</span>
                        <span className="stat-label">Bài thi</span>
                      </div>
                      <div className="dropdown-stat">
                        <span className="stat-value">{userStats.passRate}%</span>
                        <span className="stat-label">Tỷ lệ đậu</span>
                      </div>
                      <div className="dropdown-stat">
                        <span className="stat-value">{userStats.avgScore}</span>
                        <span className="stat-label">Điểm TB</span>
                      </div>
                    </div>
                  )}

                  {/* Chi tiết đậu/rớt */}
                  <div className="exam-detail-stats">
                    <div className="detail-stat passed">
                      <span className="detail-label">✅ Đã đậu</span>
                      <span className="detail-value">{userStats.passedExams}</span>
                    </div>
                    <div className="detail-stat failed">
                      <span className="detail-label">❌ Chưa đạt</span>
                      <span className="detail-value">{userStats.failedExams}</span>
                    </div>
                  </div>

                  {/* Rank Progress */}
                  <div className="rank-section">
                    <div className="rank-info">
                      <span className="rank-name">🏅 {userStats.rank}</span>
                      <span className="next-rank">→ {userStats.nextRank}</span>
                    </div>
                    <div className="rank-progress-bar">
                      <div className="rank-progress-fill" style={{ width: `${userStats.rankProgress}%` }}></div>
                    </div>
                    <div className="rank-progress-text">{userStats.rankProgress}% đến cấp tiếp theo</div>
                  </div>

                  {/* Badges */}
                  {userStats.badges.length > 0 && (
                    <div className="badges-section">
                      <div className="badges-title">🏅 Huy hiệu đạt được</div>
                      <div className="badges-list">
                        {userStats.badges.map((badge, idx) => (
                          <div key={idx} className="badge-item" style={{ borderColor: badge.color }}>
                            <span className="badge-icon">{badge.icon}</span>
                            <span className="badge-name">{badge.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tiến độ 600 câu */}
                  <div className="study-progress">
                    <div className="progress-info">
                      <span>📚 Tiến độ 600 câu</span>
                      <span className="progress-percent">
                        {Math.round((userStats.studiedQuestions / 600) * 100)}%
                      </span>
                    </div>
                    <div className="progress-stats">
                      <span>Đã học: <strong>{userStats.studiedQuestions}</strong>/600 câu</span>
                      <span>Còn lại: <strong>{600 - userStats.studiedQuestions}</strong> câu</span>
                    </div>
                    <div className="study-progress-bar">
                      <div 
                        className="study-progress-fill" 
                        style={{ width: `${(userStats.studiedQuestions / 600) * 100}%` }}
                      >
                        {userStats.studiedQuestions > 0 && (
                          <span className="progress-tooltip">
                            {Math.round((userStats.studiedQuestions / 600) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {userStats.studiedQuestions === 600 && (
                      <div className="progress-complete-badge">
                        🎉 Hoàn thành! Chúc mừng bạn!
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="dropdown-items">
                    <div className="dropdown-item" onClick={() => { navigate('/profile'); setOpen(false); setMobileMenuOpen(false); }}>
                      <span className="item-icon">👤</span>
                      <span className="item-text">Hồ sơ cá nhân</span>
                      <span className="item-arrow">→</span>
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/history'); setOpen(false); setMobileMenuOpen(false); }}>
                      <span className="item-icon">📊</span>
                      <span className="item-text">Lịch sử thi</span>
                      <span className="item-value">{userStats.totalExams} bài</span>
                      <span className="item-arrow">→</span>
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/wrong-answers'); setOpen(false); setMobileMenuOpen(false); }}>
                      <span className="item-icon">🎯</span>
                      <span className="item-text">Câu hỏi sai</span>
                      <span className="item-value">{userStats.wrongAnswers} câu</span>
                      <span className="item-arrow">→</span>
                    </div>
                    <div className="dropdown-item" onClick={() => { navigate('/question-bank'); setOpen(false); setMobileMenuOpen(false); }}>
                      <span className="item-icon">📚</span>
                      <span className="item-text">600 câu hỏi</span>
                      <span className="item-value">{userStats.studiedQuestions}/600</span>
                      <span className="item-arrow">→</span>
                    </div>
                    {user?.role === 'Admin' && (
                      <>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item" onClick={() => { navigate('/admin'); setOpen(false); setMobileMenuOpen(false); }}>
                          <span className="item-icon">⚙️</span>
                          <span className="item-text">Quản trị hệ thống</span>
                          <span className="item-arrow">→</span>
                        </div>
                      </>
                    )}
                    <div className="dropdown-divider" />
                    <div className="dropdown-item danger" onClick={handleLogout}>
                      <span className="item-icon">🚪</span>
                      <span className="item-text">Đăng xuất</span>
                      <span className="item-arrow">→</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </>
  );
}