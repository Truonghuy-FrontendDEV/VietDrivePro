// ── ExamResult ────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';

export default function ExamResult() {
  const { sessionId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get(`/exam/result/${sessionId}`).then(r => setResult(r.data)).finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:80 }}><div className="spinner"/></div>;
  if (!result) return <div style={{ padding:40, textAlign:'center' }}>Không tìm thấy kết quả.</div>;

  const pass = result.status === 'Pass';
  const pct  = Math.round(result.score / result.totalQuestions * 100);
  const correctCount = result.details?.filter(d => d.isCorrect).length || 0;
  const wrongCount   = result.details?.filter(d => !d.isCorrect).length || 0;

  const filtered = (result.details||[]).filter(d =>
    filter === 'all' ? true : filter === 'correct' ? d.isCorrect : !d.isCorrect
  );

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Hero result */}
      <div style={{
        background: pass ? 'linear-gradient(135deg,#065f46,#059669)' : 'linear-gradient(135deg,#7f1d1d,#dc2626)',
        padding: '48px 20px 64px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', color: '#fff', position: 'relative' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{pass ? '🎉' : '😤'}</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
            {pass ? 'Chúc mừng! Bạn đã ĐẠT!' : 'Rất tiếc! Chưa đạt lần này'}
          </h1>
          <div style={{ fontSize: 72, fontWeight: 900, margin: '16px 0' }}>{result.score}</div>
          <div style={{ opacity: .8, fontSize: 16, marginBottom: 20 }}>
            trên tổng số {result.totalQuestions} câu · Cần {result.passingScore} để đạt
          </div>

          {result.hasCriticalError && (
            <div style={{ background:'rgba(255,255,255,.2)', borderRadius:10, padding:'10px 20px', marginBottom:16, fontWeight:600 }}>
              ⚠️ Bạn đã trả lời sai câu điểm liệt
            </div>
          )}

          {/* Stat bubbles */}
          <div style={{ display:'flex', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            {[
              { label:'Đúng',    val: correctCount, color:'#bbf7d0', tc:'#065f46' },
              { label:'Sai',     val: wrongCount,   color:'#fecaca', tc:'#7f1d1d' },
              { label:'Tỷ lệ đúng', val: `${pct}%`, color:'#fef3c7', tc:'#78350f' },
            ].map(s => (
              <div key={s.label} style={{ background:s.color, borderRadius:12, padding:'12px 24px', color:s.tc }}>
                <div style={{ fontSize:24, fontWeight:900 }}>{s.val}</div>
                <div style={{ fontSize:13 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-24px auto 0', padding: '0 20px' }}>
        {/* Action buttons */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28, background:'#fff', borderRadius:16, padding:20, boxShadow:'0 4px 16px rgba(0,0,0,.08)', border:'1px solid #e5e7eb' }}>
          <Link to="/exam"    className="btn btn-primary">📝 Thi lại</Link>
          <Link to="/"        className="btn btn-secondary">🏠 Trang chủ</Link>
          <Link to="/history" className="btn btn-secondary">📊 Lịch sử</Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {[
            { k:'all',     l:`Tất cả (${result.totalQuestions})` },
            { k:'correct', l:`✅ Đúng (${correctCount})` },
            { k:'wrong',   l:`❌ Sai (${wrongCount})` },
          ].map(t => (
            <button key={t.k} onClick={() => setFilter(t.k)}
              style={{
                padding:'8px 20px', borderRadius:20, border: filter===t.k?'none':'1.5px solid #e5e7eb',
                background: filter===t.k?'#1a56db':'#fff', color: filter===t.k?'#fff':'#374151',
                fontWeight:600, fontSize:14, cursor:'pointer'
              }}>{t.l}</button>
          ))}
        </div>

        {/* Detail cards */}
        {filtered.map((d, i) => {
          const origIdx = result.details.indexOf(d);
          return (
            <div key={d.questionID} style={{
              background:'#fff', borderRadius:14, marginBottom:14, overflow:'hidden',
              border:`1.5px solid ${d.isCorrect ? '#bbf7d0' : '#fecaca'}`,
              boxShadow:'0 2px 8px rgba(0,0,0,.05)'
            }}>
              <div style={{ padding:'14px 20px 0', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontWeight:700, fontSize:13, color:'#9ca3af' }}>Câu {origIdx+1}</span>
                {d.isCritical && <span className="badge badge-critical">⚠️ Điểm liệt</span>}
                {d.categoryName && <span style={{ fontSize:12, background:'#f3f4f6', color:'#6b7280', padding:'2px 8px', borderRadius:10 }}>{d.categoryName}</span>}
                <span className={`badge badge-${d.isCorrect?'pass':'fail'}`} style={{ marginLeft:'auto' }}>
                  {d.isCorrect ? '✅ Đúng' : '❌ Sai'}
                </span>
              </div>
              <div style={{ padding:'10px 20px', fontSize:16, fontWeight:700, lineHeight:1.6, color:'#111827' }}>{d.questionContent}</div>
              {d.questionImage && (
                <div style={{ padding:'0 20px 10px' }}>
                  <img src={`/images/${d.questionImage}`} alt="" style={{ maxHeight:180, borderRadius:8, objectFit:'contain' }} onError={e=>{e.target.parentElement.style.display='none'}} />
                </div>
              )}
              <div style={{ padding:'0 20px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                {d.answers?.map(a => {
                  const isSel = a.answerID === d.selectedAnswerID;
                  const bg = a.isCorrect ? '#f0fdf4' : isSel ? '#fef2f2' : '#f9fafb';
                  const border = a.isCorrect ? '#86efac' : isSel ? '#fca5a5' : '#e5e7eb';
                  const icon = a.isCorrect ? '✅' : isSel ? '❌' : '⚪';
                  return (
                    <div key={a.answerID} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:bg, border:`1.5px solid ${border}`, borderRadius:10, fontSize:14 }}>
                      <span>{icon}</span><span>{a.answerText}</span>
                    </div>
                  );
                })}
              </div>
              {d.explanation && (
                <div style={{ margin:'0 20px 16px', background:'#fffbeb', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#78350f', borderLeft:'3px solid #f59e0b' }}>
                  💡 <strong>Giải thích:</strong> {d.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}