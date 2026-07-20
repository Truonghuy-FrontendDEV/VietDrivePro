import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import './Regulations.css';

export default function Regulations() {
  const [regs,     setRegs]    = useState([]);
  const [total,    setTotal]   = useState(0);
  const [loading,  setLoading] = useState(false);
  const [search,   setSearch]  = useState('');
  const [page,     setPage]    = useState(1);
  const [expanded, setExpanded]= useState(null);
  const pageSize = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize });
      if (search) params.append('search', search);
      const { data } = await api.get(`/regulations?${params}`);
      setRegs(data.regulations || []);
      setTotal(data.totalCount || 0);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = e => { setSearch(e.target.value); setPage(1); };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="reg-wrap">
      <div className="container">
        <h1 className="page-title">📋 Văn bản luật & Mức phạt</h1>

        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="🔍 Tìm theo tên điều luật, nội dung..."
            value={search}
            onChange={handleSearch}
            style={{ flex: 1, minWidth: 260, padding: '8px 12px', border: '1px solid #ccc', borderRadius: 7, fontSize: 14 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#888' }}>
            Tìm thấy <strong style={{ marginLeft: 4 }}>{total}</strong>&nbsp;điều luật
          </div>
        </div>

        {loading
          ? <div className="spinner" />
          : (regs || []).length === 0
            ? <div className="card text-center" style={{ padding: 40, color: '#888' }}>Không tìm thấy kết quả.</div>
            : (
              <div className="reg-list">
                {(regs || []).map(reg => (
                  <div key={reg.regulationID} className="reg-card card">
                    <div className="reg-header" onClick={() => setExpanded(expanded === reg.regulationID ? null : reg.regulationID)}>
                      <div className="reg-title">{reg.title}</div>
                      <div className="reg-meta">
                        {reg.penaltyRange && (
                          <span className="reg-penalty">💰 {reg.penaltyRange}</span>
                        )}
                        <span style={{ fontSize: 12, color: '#aaa' }}>
                          {new Date(reg.lastUpdated).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="reg-toggle">{expanded === reg.regulationID ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {expanded === reg.regulationID && (
                      <div className="reg-content">
                        {(reg.content || '').split('\n').map((line, i) => (
                          <p key={i} style={{ marginBottom: 6 }}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
        }

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, page - 2) + i;
              if (p > totalPages) return null;
              return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        )}
      </div>
    </div>
  );
}
