import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const pageSize = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize });
      if (search) params.append('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.data);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleLock = async (id) => {
    await api.put(`/admin/users/${id}/lock`);
    fetch();
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Xóa người dùng "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa.');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="page-title" style={{ margin: 0 }}>👥 Quản lý người dùng</h1>
        <span style={{ fontSize: 14, color: '#888' }}>Tổng: <strong>{total}</strong> tài khoản</span>
      </div>

      <div className="admin-search-bar">
        <input
          placeholder="🔍 Tìm theo tên, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 240 }}
        />
      </div>

      <div className="card table-wrap">
        {loading
          ? <div className="spinner" />
          : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.userID}>
                    <td style={{ color: '#aaa', fontSize: 13 }}>{(page - 1) * pageSize + i + 1}</td>
                    <td><strong>{u.fullName}</strong></td>
                    <td style={{ fontSize: 13, color: '#555' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-critical' : 'badge-inprog'}`}>
                        {u.role === 'Admin' ? '⚙️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#888' }}>
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <span className={`badge ${u.isLocked ? 'badge-fail' : 'badge-pass'}`}>
                        {u.isLocked ? '🔒 Đã khóa' : '✅ Hoạt động'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'Admin' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={`btn btn-sm ${u.isLocked ? 'btn-success' : 'btn-warning'}`}
                            onClick={() => toggleLock(u.userID)}
                          >
                            {u.isLocked ? '🔓 Mở' : '🔒 Khóa'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.userID, u.fullName)}>
                            🗑 Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p;
            if (totalPages <= 7) p = i + 1;
            else if (page <= 4) p = i + 1;
            else if (page >= totalPages - 3) p = totalPages - 6 + i;
            else p = page - 3 + i;
            return <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>;
          })}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  );
}
