import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const EMPTY = { title: '', content: '', penaltyRange: '' };

export default function AdminRegulations() {
  const [regs,     setRegs]     = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [showModal,setShowModal]= useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');
  const pageSize = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize });
      if (search) params.append('search', search);
      const { data } = await api.get(`/regulations?${params}`);
      setRegs(data.data);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setErr(''); setShowModal(true); };
  const openEdit   = r => { setEditId(r.regulationID); setForm({ title: r.title, content: r.content, penaltyRange: r.penaltyRange || '' }); setErr(''); setShowModal(true); };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { setErr('Tiêu đề và nội dung không được trống.'); return; }
    setSaving(true); setErr('');
    try {
      if (editId) await api.put(`/admin/regulations/${editId}`, form);
      else        await api.post('/admin/regulations', form);
      setShowModal(false); fetch();
    } catch (e) { setErr(e.response?.data?.message || 'Lỗi lưu.'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Xóa văn bản luật này?')) return;
    await api.delete(`/admin/regulations/${id}`); fetch();
  };

  const totalPages = Math.ceil(total / pageSize);
  const h = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title" style={{ margin: 0 }}>📋 Quản lý văn bản luật</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm văn bản</button>
      </div>

      <div className="admin-search-bar">
        <input placeholder="🔍 Tìm theo tiêu đề..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 240 }} />
        <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}><strong>{total}</strong> văn bản</span>
      </div>

      <div className="card table-wrap">
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>#</th><th>Tiêu đề</th><th>Mức phạt</th><th>Cập nhật</th><th>Thao tác</th></tr></thead>
            <tbody>
              {regs.map((r, i) => (
                <tr key={r.regulationID}>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{(page - 1) * pageSize + i + 1}</td>
                  <td style={{ fontSize: 14, maxWidth: 340 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  </td>
                  <td>
                    {r.penaltyRange
                      ? <span className="reg-penalty" style={{ background: '#fff3e0', color: '#e65100', fontSize: 12, padding: '2px 8px', borderRadius: 10 }}>{r.penaltyRange}</span>
                      : '—'}
                  </td>
                  <td style={{ fontSize: 12, color: '#888' }}>{new Date(r.lastUpdated).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>✏️ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(r.regulationID)}>🗑</button>
                    </div>
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? '✏️ Sửa văn bản luật' : '+ Thêm văn bản mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="form-group"><label>Tiêu đề *</label><input value={form.title} onChange={h('title')} /></div>
            <div className="form-group"><label>Mức phạt</label><input value={form.penaltyRange} onChange={h('penaltyRange')} placeholder="VD: 800.000 – 1.000.000 đồng" /></div>
            <div className="form-group">
              <label>Nội dung *</label>
              <textarea rows={8} value={form.content} onChange={h('content')} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : (editId ? '💾 Cập nhật' : '+ Thêm mới')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
