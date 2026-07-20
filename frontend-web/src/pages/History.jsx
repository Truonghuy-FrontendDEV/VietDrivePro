import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './History.css';

export function History() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setL] = useState(false);
  const [page, setPage] = useState(1);
  const ps = 10;

  // Hàm lưu lịch sử thi vào localStorage
  const saveToLocalStorage = (newSessions) => {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('exam_history') || '[]');
      
      // Gộp và loại bỏ trùng lặp
      const allSessions = [...newSessions, ...existingHistory];
      const uniqueSessions = [];
      const ids = new Set();
      
      for (const session of allSessions) {
        if (!ids.has(session.sessionID)) {
          ids.add(session.sessionID);
          uniqueSessions.push(session);
        }
      }
      
      // Sắp xếp theo thời gian mới nhất
      uniqueSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      
      // Chỉ giữ lại 100 bài thi gần nhất
      const keepSessions = uniqueSessions.slice(0, 100);
      localStorage.setItem('exam_history', JSON.stringify(keepSessions));
      console.log('✅ Đã lưu lịch sử thi vào localStorage:', keepSessions.length, 'bài');
      
    } catch (error) {
      console.error('Lỗi lưu lịch sử thi:', error);
    }
  };

  // Hàm tạo thông báo cho kết quả thi (lưu vào localStorage)
  const createNotificationForResult = (session) => {
    try {
      const isPassed = session.status === 'Pass';
      const score = session.score;
      const totalQ = session.totalQuestions || 25;
      const percent = Math.round((score / totalQ) * 100);
      
      let title, message, type;
      
      if (isPassed) {
        if (percent >= 90) {
          title = '🏆 Xuất sắc! Bạn đã đậu với điểm số cao!';
          message = `Chúc mừng! Bạn đạt ${score}/${totalQ} điểm (${percent}%) - Hạng ${session.licenseType}. Thật tuyệt vời!`;
        } else if (percent >= 80) {
          title = '🌟 Tốt lắm! Bạn đã đậu!';
          message = `Bạn đạt ${score}/${totalQ} điểm (${percent}%). Hạng ${session.licenseType}. Cố gắng giữ vững phong độ!`;
        } else {
          title = '🎉 Chúc mừng! Bạn đã đậu!';
          message = `Bạn đạt ${score}/${totalQ} điểm (${percent}%). Hạng ${session.licenseType}. Tiếp tục phát huy nhé!`;
        }
        type = 'success';
      } else {
        title = '📚 Cố gắng hơn nhé!';
        message = `Bạn được ${score}/${totalQ} điểm (${percent}%). Hãy ôn lại các câu hỏi sai và thử lại!`;
        type = 'warning';
        
        if (percent < 50) {
          message = `Bạn được ${score}/${totalQ} điểm (${percent}%). Đừng nản! Hãy học kỹ 600 câu hỏi và thử lại nhé!`;
        }
      }
      
      // Lưu thông báo vào localStorage
      const existingNotifs = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const newNotif = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        time: 'Vừa xong',
        read: false,
        createdAt: new Date().toISOString(),
        examID: session.sessionID
      };
      
      existingNotifs.unshift(newNotif);
      const keepNotifs = existingNotifs.slice(0, 50);
      localStorage.setItem('local_notifications', JSON.stringify(keepNotifs));
      
      console.log('✅ Đã tạo thông báo cho session:', session.sessionID);
      
      // Dispatch event để Navbar cập nhật
      window.dispatchEvent(new CustomEvent('examCompleted'));
      window.dispatchEvent(new CustomEvent('notificationReceived'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'local_notifications',
        newValue: JSON.stringify(keepNotifs)
      }));
      
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
    }
  };

  // Hàm kiểm tra và tạo thông báo cho kết quả thi mới
  const checkAndNotifyNewResults = (newSessions) => {
    const notifiedSessions = JSON.parse(localStorage.getItem('notified_sessions') || '[]');
    
    for (const session of newSessions) {
      if (!notifiedSessions.includes(session.sessionID)) {
        createNotificationForResult(session);
        notifiedSessions.push(session.sessionID);
        localStorage.setItem('notified_sessions', JSON.stringify(notifiedSessions));
      }
    }
  };

  const fetch = useCallback(async () => {
    setL(true);
    try { 
      let dataSessions = [];
      let dataTotal = 0;
      
      // Thử gọi API trước
      try {
        const { data } = await api.get(`/stats/history?page=${page}&pageSize=${ps}`); 
        dataSessions = data.data || [];
        dataTotal = data.total || 0;
        console.log('📡 API trả về:', dataSessions.length, 'bài thi');
      } catch (apiError) {
        console.log('⚠️ API lỗi hoặc chưa có dữ liệu');
      }
      
      // Nếu API không có dữ liệu, đọc từ localStorage
      if (dataSessions.length === 0) {
        const localHistory = localStorage.getItem('exam_history');
        if (localHistory) {
          const parsed = JSON.parse(localHistory);
          const start = (page - 1) * ps;
          const end = start + ps;
          dataSessions = parsed.slice(start, end);
          dataTotal = parsed.length;
          console.log('📦 Đọc từ localStorage:', dataSessions.length, 'bài thi, tổng:', dataTotal);
        }
      }
      
      setSessions(dataSessions); 
      setTotal(dataTotal); 
      
      // Lưu vào localStorage nếu có dữ liệu từ API
      if (dataSessions.length > 0) {
        saveToLocalStorage(dataSessions);
      }
      
      // Kiểm tra và tạo thông báo
      if (dataSessions.length > 0) {
        checkAndNotifyNewResults(dataSessions);
      }
      
    } catch (error) {
      console.error('Lỗi lấy lịch sử thi:', error);
    } finally { 
      setL(false); 
    }
  }, [page]);
  
  useEffect(() => { fetch(); }, [fetch]);

  const dur = (a, b) => { 
    if(!b) return '—'; 
    const m = Math.floor((new Date(b) - new Date(a)) / 60000);
    const s = Math.floor(((new Date(b) - new Date(a)) % 60000) / 1000); 
    return `${m}p ${s}s`; 
  };
  
  const tp = Math.ceil(total/ps);

  // Calculate statistics
  const stats = {
    total: total,
    passed: sessions.filter(s => s.status === 'Pass').length,
    failed: sessions.filter(s => s.status === 'Fail').length,
    avgScore: sessions.length > 0 
      ? (sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length).toFixed(1)
      : 0,
    bestScore: sessions.length > 0 
      ? Math.max(...sessions.map(s => s.score))
      : 0
  };

  return (
    <div className="history-page">
      {/* Hero Section */}
      <div className="history-hero">
        <div className="container">
          <div className="history-hero-content">
            <div className="history-hero-text">
              <div className="hero-badge">📊 Tổng quan</div>
              <h1 className="history-hero-title">
                Lịch sử thi của bạn
              </h1>
              <p className="history-hero-desc">
                Theo dõi quá trình ôn luyện và cải thiện kết quả qua từng bài thi
              </p>
            </div>
            <div className="history-stats-grid">
              <div className="history-stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Tổng lượt thi</div>
              </div>
              <div className="history-stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.passed}</div>
                <div className="stat-label">Đạt</div>
              </div>
              <div className="history-stat-card danger">
                <div className="stat-icon">❌</div>
                <div className="stat-value">{stats.failed}</div>
                <div className="stat-label">Chưa đạt</div>
              </div>
              <div className="history-stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats.avgScore}</div>
                <div className="stat-label">Điểm TB</div>
              </div>
            </div>
          </div>
        </div>
        <div className="history-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </div>

      {/* Nút Refresh và Test */}
      <div className="container" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            onClick={() => {
              const localHistory = localStorage.getItem('exam_history');
              const history = JSON.parse(localHistory || '[]');
              alert(`Có ${history.length} bài thi trong localStorage`);
              fetch();
            }}
            style={{ padding: '8px 16px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            🔄 Kiểm tra dữ liệu
          </button>
          <button 
            onClick={() => {
              const mockHistory = [
                {
                  sessionID: Date.now(),
                  licenseType: 'A1',
                  score: 18,
                  totalQuestions: 25,
                  status: 'Fail',
                  startTime: new Date().toISOString(),
                  endTime: new Date(Date.now() + 120000).toISOString()
                },
                {
                  sessionID: Date.now() + 1,
                  licenseType: 'A2',
                  score: 12,
                  totalQuestions: 25,
                  status: 'Fail',
                  startTime: new Date(Date.now() - 86400000).toISOString(),
                  endTime: new Date(Date.now() - 86280000).toISOString()
                }
              ];
              localStorage.setItem('exam_history', JSON.stringify(mockHistory));
              alert('Đã thêm dữ liệu mẫu!');
              fetch();
            }}
            style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            📝 Thêm dữ liệu mẫu
          </button>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-state-icon">📋</div>
            <h2 className="empty-state-title">Chưa có lần thi nào</h2>
            <p className="empty-state-desc">Hãy bắt đầu bài thi đầu tiên để theo dõi tiến trình của bạn</p>
            <Link to="/exam" className="btn btn-primary empty-state-btn">
              🚀 Bắt đầu thi ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="table-container card">
              <div className="table-header">
                <h3 className="table-title">📋 Chi tiết các lần thi</h3>
                <div className="table-info">
                  Hiển thị {(page-1)*ps + 1} - {Math.min(page*ps, total)} trên {total}
                </div>
              </div>
              <div className="table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Hạng bằng</th>
                      <th>Điểm</th>
                      <th>Kết quả</th>
                      <th>Thời lượng</th>
                      <th>Thời gian thi</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={s.sessionID} className="history-row">
                        <td className="row-number">
                          {(page-1)*ps + i + 1}
                        </td>
                        <td className="license-type">
                          <span className="license-badge">Hạng {s.licenseType}</span>
                        </td>
                        <td className="score-cell">
                          <div className="score-wrapper">
                            <span className={`score-value ${s.status === 'Pass' ? 'score-pass' : 'score-fail'}`}>
                              {s.score}
                            </span>
                            <span className="score-max">/{s.totalQuestions || 25}</span>
                          </div>
                        </td>
                        <td>
                          <div className="result-badges">
                            <span className={`badge ${s.status === 'Pass' ? 'badge-pass' : 'badge-fail'}`}>
                              {s.status === 'Pass' ? '✅ Đạt' : '❌ Chưa đạt'}
                            </span>
                            {s.hasCriticalError && (
                              <span className="badge badge-critical">
                                ⚠️ Điểm liệt
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="duration-cell">
                          <span className="duration-icon">⏱️</span>
                          {dur(s.startTime, s.endTime)}
                        </td>
                        <td className="date-cell">
                          <div className="date-wrapper">
                            <span className="date-icon">📅</span>
                            {new Date(s.startTime).toLocaleString('vi-VN')}
                          </div>
                        </td>
                        <td className="action-cell">
                          <Link 
                            to={`/exam/result/${s.sessionID}`} 
                            className="btn-view"
                          >
                            Chi tiết
                            <span className="btn-view-arrow">→</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {tp > 1 && (
              <div className="pagination-wrapper">
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    disabled={page === 1} 
                    onClick={() => setPage(1)}
                  >
                    «
                  </button>
                  <button 
                    className="pagination-btn" 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p-1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(7, tp) }, (_, i) => {
                    let p;
                    if(tp <= 7) p = i+1;
                    else if(page <= 4) p = i+1;
                    else if(page >= tp-3) p = tp-6+i;
                    else p = page-3+i;
                    return (
                      <button 
                        key={p} 
                        className={`pagination-btn ${page === p ? 'active' : ''}`} 
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button 
                    className="pagination-btn" 
                    disabled={page === tp} 
                    onClick={() => setPage(p => p+1)}
                  >
                    ›
                  </button>
                  <button 
                    className="pagination-btn" 
                    disabled={page === tp} 
                    onClick={() => setPage(tp)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}