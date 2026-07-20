import { useCallback, useEffect, useState } from 'react';
import api from '../../api';

const EMPTY = { signCode: '', signName: '', signType: '', imageURL: '', description: '' };

export default function AdminSigns() {
  const [signs,    setSigns]    = useState([]);
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
      const { data } = await api.get('/traffic-signs', {
        params: {
          page,
          pageSize,
          keyword: search || undefined // Backend của bạn dùng 'keyword' chứ không phải 'search'
        }
      });

      // Backend trả về object có tên là "signs", không phải "data"
      setSigns(data.signs || []); 
      
      // Backend trả về tên là "totalCount", không phải "total"
      setTotal(data.totalCount || 0); 

    } catch (error) {
      console.error("Lỗi lấy dữ liệu biển báo:", error);
      setSigns([]); // Nếu lỗi thì cho mảng rỗng để không bị crash giao diện
    } finally { 
      setLoading(false); 
    }
  }, [search, page]);
  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setEditId(null); setForm(EMPTY); setErr(''); setShowModal(true); };
  const openEdit   = s => { setEditId(s.signID); setForm({ signCode: s.signCode, signName: s.signName, signType: s.signType || '', imageURL: s.imageURL || '', description: s.description || '' }); setErr(''); setShowModal(true); };

  const save = async () => {
    if (!form.signCode.trim() || !form.signName.trim()) { setErr('Mã và tên biển báo không được trống.'); return; }
    setSaving(true); setErr('');
    try {
      if (editId) await api.put(`/admin/signs/${editId}`, form);
      else        await api.post('/admin/signs', form);
      setShowModal(false); fetch();
    } catch (e) { setErr(e.response?.data?.message || 'Lỗi lưu.'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Xóa biển báo này?')) return;
    await api.delete(`/admin/signs/${id}`); fetch();
  };

  const totalPages = Math.ceil(total / pageSize);
  const h = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title" style={{ margin: 0 }}>🚦 Quản lý biển báo</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm biển báo</button>
      </div>

      <div className="admin-search-bar">
        <input placeholder="🔍 Tìm theo tên, mã biển..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, minWidth: 240 }} />
        <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}><strong>{total}</strong> biển</span>
      </div>

      <div className="card table-wrap">
        {loading ? <div className="spinner" /> : (
          <table>
            <thead><tr><th>Ảnh</th><th>Mã</th><th>Tên biển báo</th><th>Loại</th><th>Thao tác</th></tr></thead>
            <tbody>
              {signs.map(s => (
                <tr key={s.signID}>
                  <td>
                    {s.imageURL
                      ? <img src={s.imageURL} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }}
                          onError={e => { e.target.style.display = 'none'; }} />
                      : <span style={{ fontSize: 24 }}>🚧</span>}
                  </td>
                  <td><strong>{s.signCode}</strong></td>
                  <td style={{ fontSize: 13 }}>{s.signName}</td>
                  <td style={{ fontSize: 12, color: '#888' }}>{s.signType || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(s.signID)}>🗑</button>
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
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? '✏️ Sửa biển báo' : '+ Thêm biển báo'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Mã biển *</label><input value={form.signCode} onChange={h('signCode')} placeholder="P.123" /></div>
              <div className="form-group"><label>Loại biển</label><input value={form.signType} onChange={h('signType')} placeholder="Biển cấm..." /></div>
            </div>
            <div className="form-group"><label>Tên biển báo *</label><input value={form.signName} onChange={h('signName')} /></div>
            <div className="form-group"><label>URL hình ảnh</label><input value={form.imageURL} onChange={h('imageURL')} placeholder="https://..." /></div>
            {form.imageURL && <img src={form.imageURL} alt="" style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 12 }} onError={e => { e.target.style.display='none'; }} />}
            <div className="form-group"><label>Mô tả</label><textarea rows={3} value={form.description} onChange={h('description')} style={{ resize: 'vertical' }} /></div>
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
