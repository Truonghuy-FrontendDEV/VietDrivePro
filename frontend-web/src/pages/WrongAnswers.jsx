import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export function WrongAnswers() {
  const nav = useNavigate();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setL] = useState(false);
  const [page, setPage] = useState(1);
  const [revealed, setRev] = useState({});
  const ps = 15;

  const fetch = useCallback(async () => {
    setL(true);
    try { 
      const { data } = await api.get(`/stats/wrong-answers?page=${page}&pageSize=${ps}`); 
      setLogs(data.data); 
      setTotal(data.total); 
    } finally { 
      setL(false); 
    }
  }, [page]);
  
  useEffect(() => { fetch(); }, [fetch]);

  const remove = async (qid) => {
    if (!window.confirm('Xóa câu này khỏi danh sách sai?')) return;
    await api.delete(`/stats/wrong-answers/${qid}`); 
    fetch();
  };

  const startPractice = async () => {
    try {
      const lt = await api.get('/license-types');
      const { data } = await api.post('/exam/start', { 
        licenseTypeID: lt.data[0].licenseTypeID, 
        mode: 'wrong', 
        sampleExamID: null 
      });
      nav('/exam', { state: data });
    } catch(e) { 
      alert(e.response?.data?.message || 'Không thể tạo đề.'); 
    }
  };

  const tp = Math.ceil(total/ps);

  return (
    <div className="page-wrap">
      <div className="container">
        <div style={{ 
          background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', 
          borderRadius: 16, 
          padding: '24px 28px', 
          marginBottom: 24, 
          color: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 12 
        }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>🎯 Ôn tập câu sai</h1>
            <p style={{ opacity: .8, fontSize: 14 }}>{total} câu cần ôn luyện thêm</p>
          </div>
          {total > 0 && 
            <button 
              className="btn" 
              style={{ background: '#fff', color: '#dc2626', fontWeight: 700 }} 
              onClick={startPractice}
            >
              🚀 Thi ôn {total} câu sai
            </button>
          }
        </div>

        {loading ? 
          <div className="spinner-wrap"><div className="spinner"/></div>
          : logs.length === 0 ? (
            <div className="card text-center" style={{ padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontWeight: 800, color: '#111827', marginBottom: 8 }}>Không có câu sai nào!</h2>
              <p style={{ color: '#6b7280' }}>Bạn đang làm rất tốt. Hãy tiếp tục thi thử.</p>
            </div>
          ) : (
            logs.map((log, idx) => {
              const q = log.question;
              const sel = revealed[q.questionID];
              const done = sel !== undefined;
              return (
                <div key={log.logID} style={{ 
                  background: '#fff', 
                  borderRadius: 14, 
                  border: '1.5px solid #e5e7eb', 
                  marginBottom: 14, 
                  overflow: 'hidden', 
                  boxShadow: '0 2px 8px rgba(0,0,0,.04)' 
                }}>
                  <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: '#dc2626', 
                      color: '#fff', 
                      fontSize: 12, 
                      fontWeight: 700, 
                      padding: '2px 10px', 
                      borderRadius: 6 
                    }}>
                      Sai {log.errorCount} lần
                    </span>
                    {q.isCritical && 
                      <span className="badge badge-critical">⚠️ Điểm liệt</span>
                    }
                    {q.categoryName && 
                      <span style={{ 
                        fontSize: 12, 
                        background: '#f3f4f6', 
                        color: '#6b7280', 
                        padding: '2px 8px', 
                        borderRadius: 10 
                      }}>
                        {q.categoryName}
                      </span>
                    }
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
                      {new Date(log.lastAttempted).toLocaleDateString('vi-VN')}
                    </span>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(q.questionID)}>
                      ✕ Xóa
                    </button>
                  </div>
                  <div style={{ padding: '10px 20px', fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}>
                    {q.content}
                  </div>
                    {q.imageURL && (
                      <div style={{ padding: '0 20px 10px', textAlign: 'center' }}>
                        <img 
                          // Xử lý thông minh: Nếu DB có 'images/' rồi thì chỉ thêm dấu / ở đầu
                          src={q.imageURL.startsWith('images/') ? `/${q.imageURL}` : `/images/${q.imageURL}`} 
                          alt="Minh họa câu hỏi" 
                          style={{ 
                            maxHeight: 180, 
                            borderRadius: 8, 
                            objectFit: 'contain',
                            border: '1px solid #eee',
                            display: 'inline-block' 
                          }} 
                          onError={e => { 
                            // Nếu lỗi thật sự (sai tên file) thì mới ẩn đi
                            console.error("Lỗi tải ảnh:", q.imageURL);
                            e.target.parentElement.style.display = 'none'; 
                          }}
                        />
                      </div>
                    )}
                  <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {q.answers.map((a, ai) => {
                      let bg = '#f9fafb', border = '#e5e7eb', color = '#374151';
                      if(done) {
                        if(a.isCorrect) { bg = '#f0fdf4'; border = '#86efac'; color = '#166534'; }
                        else if(a.answerID === sel) { bg = '#fef2f2'; border = '#fca5a5'; color = '#7f1d1d'; }
                      } else if(a.answerID === sel) { 
                        bg = '#eff6ff'; border = '#93c5fd'; color = '#1e40af'; 
                      }
                      return (
                        <div 
                          key={a.answerID} 
                          onClick={() => !done && setRev(p => ({ ...p, [q.questionID]: a.answerID }))}
                          style={{ 
                            display: 'flex', 
                            gap: 12, 
                            alignItems: 'center', 
                            padding: '11px 16px', 
                            background: bg, 
                            border: `1.5px solid ${border}`, 
                            color, 
                            borderRadius: 10, 
                            fontSize: 14, 
                            cursor: done ? 'default' : 'pointer' 
                          }}
                        >
                          <div style={{ 
                            width: 26, height: 26, borderRadius: '50%', 
                            background: done ? (a.isCorrect ? '#16a34a' : a.answerID === sel ? '#dc2626' : '#e5e7eb') 
                                      : (a.answerID === sel ? '#1a56db' : '#e5e7eb'),
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: 12, fontWeight: 800, flexShrink: 0 
                          }}>
                            {done ? (a.isCorrect ? '✓' : a.answerID === sel ? '✗' : String.fromCharCode(65 + ai)) 
                                  : (a.answerID === sel ? '●' : String.fromCharCode(65 + ai))}
                          </div>
                          {a.answerText}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
                    {!done ? 
                      <button className="btn btn-primary btn-sm" disabled={sel === undefined}>✓ Kiểm tra</button>
                      : 
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setRev(p => { const n = { ...p }; delete n[q.questionID]; return n; })}
                      >
                        ↺ Làm lại
                      </button>
                    }
                  </div>
                  {done && q.explanation && (
                    <div style={{ 
                      margin: '0 20px 16px', 
                      background: '#fffbeb', 
                      borderRadius: 10, 
                      padding: '10px 14px', 
                      fontSize: 13, 
                      color: '#78350f', 
                      borderLeft: '3px solid #f59e0b' 
                    }}>
                      💡 <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )
        }
        {tp > 1 && 
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={page === 1} onClick={() => setPage(p => p-1)}>‹</button>
            {Array.from({ length: Math.min(5, tp) }, (_, i) => {
              const p = Math.max(1, page-2) + i;
              if(p > tp) return null;
              return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button disabled={page === tp} onClick={() => setPage(p => p+1)}>›</button>
            <button disabled={page === tp} onClick={() => setPage(tp)}>»</button>
          </div>
        }
      </div>
    </div>
  );
}