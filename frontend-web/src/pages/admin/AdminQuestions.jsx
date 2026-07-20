import { useCallback, useEffect, useState } from 'react';
import api from '../../api';

const EMPTY_FORM = {
  content: '', imageURL: '', explanation: '', isCritical: false,
  categoryID: '', licenseTypeIDs: [], answers: [
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
  ]
};

export default function AdminQuestions() {
  const [questions,    setQuestions]    = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [formErr,      setFormErr]      = useState('');

  const [filters, setFilters] = useState({ categoryId: '', licenseTypeId: '', search: '', page: 1, pageSize: 15 });

  useEffect(() => {
    api.get('/questionbank/categories').then(r => setCategories(r.data)).catch(e => console.error(e));
    api.get('/licensetypes').then(r => setLicenseTypes(r.data)).catch(e => console.error(e));
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const safePage = (() => {
        const num = Number(filters.page);
        return (isNaN(num) || num < 1) ? 1 : num;
      })();
      
      const safePageSize = (() => {
        const num = Number(filters.pageSize);
        return (isNaN(num) || num < 1) ? 15 : num;
      })();
      
      let safeCategoryId = undefined;
      if (filters.categoryId && filters.categoryId !== '') {
        const num = Number(filters.categoryId);
        if (!isNaN(num)) safeCategoryId = num;
      }
      
      let safeLicenseTypeId = undefined;
      if (filters.licenseTypeId && filters.licenseTypeId !== '') {
        const num = Number(filters.licenseTypeId);
        if (!isNaN(num)) safeLicenseTypeId = num;
      }

      console.log("PARAMS:", {
        page: safePage,
        pageSize: safePageSize,
        categoryId: safeCategoryId,
        licenseTypeId: safeLicenseTypeId,
        search: filters.search
      });

      const { data } = await api.get('/admin/questions', {
        params: {
          page: Number(safePage),
          pageSize: Number(safePageSize),

          ...(safeCategoryId !== undefined && { categoryId: safeCategoryId }),
          ...(safeLicenseTypeId !== undefined && { licenseTypeId: safeLicenseTypeId }),
          ...(filters.search?.trim() && { search: filters.search.trim() })
        }
      });

      setQuestions(data.data || []);
      setTotal(data.total || 0);

    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormErr('');
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditId(q.questionID);
    setForm({
      content:        q.content,
      imageURL:       q.imageURL || '',
      explanation:    q.explanation || '',
      isCritical:     q.isCritical,
      categoryID:     String(q.categoryID),
      licenseTypeIDs: q.licenseTypeIDs || [],
      answers:        q.answers.map(a => ({ answerText: a.answerText, isCorrect: a.isCorrect }))
    });
    setFormErr('');
    setShowModal(true);
  };

  const save = async () => {
    if (!form.content.trim())             { setFormErr('Nội dung không được trống.'); return; }
    if (!form.categoryID)                 { setFormErr('Vui lòng chọn chương.'); return; }
    if (!form.answers.some(a => a.isCorrect))  { setFormErr('Phải có ít nhất 1 đáp án đúng.'); return; }
    if (form.answers.some(a => !a.answerText.trim())) { setFormErr('Đáp án không được để trống.'); return; }

    setSaving(true); setFormErr('');
    try {
      const payload = {
        ...form,
        categoryID: parseInt(form.categoryID),
        licenseTypeIDs: form.licenseTypeIDs.map(Number),
        answers: form.answers.filter(a => a.answerText.trim())
      };
      if (editId) {
        await api.put(`/admin/questions/${editId}`, payload);
      } else {
        await api.post('/admin/questions', payload);
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Lỗi lưu câu hỏi.');
    } finally { setSaving(false); }
  };

  const deleteQ = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    await api.delete(`/admin/questions/${id}`);
    fetch();
  };

  const setAnswer = (i, field, val) => {
    setForm(f => {
      const ans = [...f.answers];
      if (field === 'isCorrect') {
        ans.forEach((a, idx) => ans[idx] = { ...a, isCorrect: idx === i ? val : false });
      } else {
        ans[i] = { ...ans[i], [field]: val };
      }
      return { ...f, answers: ans };
    });
  };

  const toggleLicenseType = (id) => {
    setForm(f => {
      const ids = f.licenseTypeIDs.includes(id)
        ? f.licenseTypeIDs.filter(x => x !== id)
        : [...f.licenseTypeIDs, id];
      return { ...f, licenseTypeIDs: ids };
    });
  };

  // ✅ Fix totalPages tránh NaN
  const safePageSize = Number(filters.pageSize) || 15;
  const totalPages = Math.ceil(total / safePageSize) || 1;

  // ✅ Fix setFilter (ép kiểu toàn bộ chỗ nguy hiểm)
  const setFilter = (k, v) => {
    setFilters(f => {
      // PAGE
      if (k === 'page') {
        const num = Number(v);
        return {
          ...f,
          page: (isNaN(num) || num < 1) ? 1 : num
        };
      }

      // PAGE SIZE
      if (k === 'pageSize') {
        const num = Number(v);
        return {
          ...f,
          pageSize: (isNaN(num) || num < 1) ? 15 : num,
          page: 1
        };
      }

      // 🔥 FIX QUAN TRỌNG: SELECT (string → number)
      if (k === 'categoryId' || k === 'licenseTypeId') {
        return {
          ...f,
          [k]: v ? Number(v) : '',
          page: 1
        };
      }

      // SEARCH hoặc field khác
      return {
        ...f,
        [k]: v,
        page: 1
      };
    });
  };

  // ✅ Fix goToPage (giữ nguyên nhưng viết gọn hơn)
  const goToPage = (pageNum) => {
    const num = Number(pageNum);
    setFilters(f => ({
      ...f,
      page: (isNaN(num) || num < 1) ? 1 : num
    }));
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title" style={{ margin: 0 }}>❓ Quản lý câu hỏi</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm câu hỏi</button>
      </div>

      <div className="admin-search-bar">
        <select value={filters.licenseTypeId} onChange={e => setFilter('licenseTypeId', e.target.value)}>
          <option value="">-- Hạng bằng --</option>
          {licenseTypes.map(lt => <option key={lt.licenseTypeID} value={lt.licenseTypeID}>Hạng {lt.typeName}</option>)}
        </select>
        <select value={filters.categoryId} onChange={e => setFilter('categoryId', e.target.value)}>
          <option value="">-- Chương --</option>
          {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
        </select>
        <input placeholder="🔍 Tìm nội dung..." value={filters.search}
          onChange={e => setFilter('search', e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <span style={{ fontSize: 13, color: '#888', alignSelf: 'center' }}>
          <strong>{total}</strong> câu
        </span>
      </div>

      <div className="card table-wrap">
        {loading ? <div className="spinner" /> : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th style={{ minWidth: 300 }}>Nội dung</th>
                <th>Chương</th><th>Điểm liệt</th><th>Hạng bằng</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.questionID}>
                  <td style={{ color: '#aaa', fontSize: 12 }}>{q.questionID}</td>
                  <td style={{ fontSize: 13, maxWidth: 340 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.content}
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{q.categoryName}</td>
                  <td>{q.isCritical ? <span className="badge badge-critical">⚠️ Liệt</span> : '—'}</td>
                  <td style={{ fontSize: 12 }}>{q.licenseTypeIDs?.join(', ') || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(q)}>✏️ Sửa</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteQ(q.questionID)}>🗑</button>
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
          <button 
            disabled={Number(filters.page) <= 1}
            onClick={() => goToPage(1)}>
            «
          </button>

          <button
            disabled={Number(filters.page) <= 1}
            onClick={() => goToPage(Math.max((Number(filters.page) || 1) - 1, 1))}>
            ‹
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const current = Number(filters.page) > 0 ? Number(filters.page) : 1;
            let p;

            if (totalPages <= 7) p = i + 1;
            else if (current <= 4) p = i + 1;
            else if (current >= totalPages - 3) p = totalPages - 6 + i;
            else p = current - 3 + i;

            return (
              <button 
                key={p}
                className={current === p ? 'active' : ''}
                onClick={() => goToPage(p)}>
                {p}
              </button>
            );
          })}

          <button 
            disabled={(Number(filters.page) || 1) >= totalPages}
            onClick={() => goToPage(Math.min((Number(filters.page) || 1) + 1, totalPages))}>
            ›
          </button>

          <button 
            disabled={(Number(filters.page) || 1) >= totalPages}
            onClick={() => goToPage(totalPages)}>
            »
          </button>
        </div>
      )}

      {/* ── Modal thêm/sửa câu hỏi ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? '✏️ Sửa câu hỏi' : '+ Thêm câu hỏi mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {formErr && <div className="alert alert-error">{formErr}</div>}

            <div className="form-group">
              <label>Nội dung câu hỏi *</label>
              <textarea rows={3} value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Chương *</label>
                <select value={form.categoryID} onChange={e => setForm(f => ({ ...f, categoryID: e.target.value }))}>
                  <option value="">-- Chọn chương --</option>
                  {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>URL hình ảnh</label>
                <input value={form.imageURL} onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))}
                  placeholder="p123.png" />
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="critical" checked={form.isCritical}
                onChange={e => setForm(f => ({ ...f, isCritical: e.target.checked }))} />
              <label htmlFor="critical" style={{ marginBottom: 0 }}>⚠️ Câu điểm liệt</label>
            </div>

            <div className="form-group">
              <label>Hạng bằng áp dụng</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {licenseTypes.map(lt => (
                  <label key={lt.licenseTypeID} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                    <input type="checkbox"
                      checked={form.licenseTypeIDs.includes(lt.licenseTypeID)}
                      onChange={() => toggleLicenseType(lt.licenseTypeID)} />
                    Hạng {lt.typeName}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Các đáp án * (chọn đáp án đúng)</label>
              {form.answers.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input type="radio" name="correct" checked={a.isCorrect}
                    onChange={() => setAnswer(i, 'isCorrect', true)}
                    title="Đáp án đúng" style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <input value={a.answerText}
                    onChange={e => setAnswer(i, 'answerText', e.target.value)}
                    placeholder={`Đáp án ${i + 1}`}
                    style={{ flex: 1, padding: '7px 10px', border: `1px solid ${a.isCorrect ? '#4caf50' : '#ccc'}`, borderRadius: 7, fontSize: 14 }} />
                  {a.isCorrect && <span style={{ color: '#4caf50', fontWeight: 700, fontSize: 12 }}>✅ Đúng</span>}
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Giải thích đáp án</label>
              <textarea rows={2} value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Giải thích tại sao đáp án đó đúng..." style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Đang lưu...' : (editId ? '💾 Cập nhật' : '+ Thêm mới')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}