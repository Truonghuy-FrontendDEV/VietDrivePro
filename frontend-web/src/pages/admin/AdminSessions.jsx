import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const pageSize = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/sessions?page=${page}&pageSize=${pageSize}`);
      setSessions(data.data);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / pageSize);

  const duration = (start, end) => {
    if (!end) return '—';
    const m = Math.floor((new Date(end) - new Date(start)) / 60000);
    const s = Math.floor(((new Date(end) - new Date(start)) % 60000) / 1000);
    return `${m}p ${s}s`;
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title" style={{ margin: 0 }}>📝 Lịch sử thi (toàn hệ thống)</h1>
        <span style={{ fontSize: 14, color: '#888' }}>Tổng: <strong>{total}</strong> lần thi</span>
      </div>

      <div className="card table-wrap">
        {loading ? <div className="spinner" /> : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>UserID</th><th>Hạng bằng</th>
                <th>Điểm</th><th>Kết quả</th><th>Thời lượng</th><th>Thời gian</th><th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.sessionID}>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{s.sessionID}</td>
                  <td style={{ fontSize: 13 }}>#{s.userID}</td>
                  <td><strong>Hạng {s.licenseType}</strong></td>
                  <td><strong>{s.score}</strong>/{s.totalQuestions}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span className={`badge badge-${s.status === 'Pass' ? 'pass' : 'fail'}`}>
                        {s.status === 'Pass' ? '✅ Đạt' : '❌ Không đạt'}
                      </span>
                      {s.hasCriticalError && <span className="badge badge-critical" style={{ fontSize: 10 }}>⚠️ Điểm liệt</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#666' }}>{duration(s.startTime, s.endTime)}</td>
                  <td style={{ fontSize: 12, color: '#888' }}>{new Date(s.startTime).toLocaleString('vi-VN')}</td>
                  <td>
                    <Link to={`/exam/result/${s.sessionID}`} className="btn btn-secondary btn-sm"
                      target="_blank" rel="noreferrer">Chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p; if (totalPages <= 7) p = i + 1; else if (page <= 4) p = i + 1; else if (page >= totalPages - 3) p = totalPages - 6 + i; else p = page - 3 + i;
            return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  );
}
