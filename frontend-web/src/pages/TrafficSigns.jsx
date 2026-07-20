import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import './TrafficSigns.css';

export default function TrafficSigns() {
  const [signs, setSigns] = useState([]);
  const [types, setTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const [filters, setFilters] = useState({
    signType: '',
    search: '',
    page: 1,
    pageSize: 24
  });

  useEffect(() => {
    api.get('/trafficSigns/types')
      .then(r => setTypes(r.data || []))
      .catch(() => setTypes([]));
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.signType) params.append('signType', filters.signType);
      if (filters.search)   params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('pageSize', filters.pageSize);

      const response = await api.get(`/trafficSigns?${params}`);
      
      let signsData = [];
      let totalCount = 0;
      
      if (Array.isArray(response.data)) {
        signsData = response.data;
        totalCount = response.data.length;
      } 
      else if (response.data && typeof response.data === 'object') {
        if (response.data.$values) {
          signsData = response.data.$values;
          totalCount = response.data.$values.length;
        } else if (response.data.signs) {
          signsData = response.data.signs;
          totalCount = response.data.totalCount || response.data.signs.length;
        } else if (response.data.data) {
          signsData = response.data.data;
          totalCount = response.data.total || response.data.data.length;
        } else if (response.data.items) {
          signsData = response.data.items;
          totalCount = response.data.totalItems || response.data.items.length;
        } else {
          signsData = [];
          totalCount = 0;
        }
      }
      
      setSigns(signsData);
      setTotal(totalCount);
    } catch (err) {
      console.error('Lỗi fetch:', err);
      setSigns([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const setFilter = (k, v) =>
    setFilters(f => ({ ...f, [k]: v, page: 1 }));

  const totalPages = Math.ceil(total / filters.pageSize);

  const getSignTypeIcon = (type) => {
    const icons = {
      'Biển báo cấm': '⛔',
      'Biển báo nguy hiểm': '⚠️',
      'Biển hiệu lệnh': '🔵',
      'Biển chỉ dẫn': 'ℹ️',
      'Biển phụ': '📌',
      'Vạch kẻ đường': '📏',
    };
    return icons[type] || '🚦';
  };

  const getSignTypeColor = (type) => {
    const colors = {
      'Biển báo cấm': '#ef4444',
      'Biển báo nguy hiểm': '#f59e0b',
      'Biển hiệu lệnh': '#3b82f6',
      'Biển chỉ dẫn': '#10b981',
      'Biển phụ': '#8b5cf6',
      'Vạch kẻ đường': '#ec489a',
    };
    return colors[type] || '#64748b';
  };

  return (
    <div className="ts-page">
      {/* Hero Section */}
      <div className="ts-hero">
        <div className="container">
          <div className="ts-hero-content">
            <div className="ts-hero-text">
              <div className="hero-badge">🚗 Kiến thức giao thông</div>
              <h1 className="ts-hero-title">
                Biển báo giao thông
                <span className="hero-highlight">  đường bộ Việt Nam</span>
              </h1>
              <p className="ts-hero-desc">
                Tra cứu đầy đủ các loại biển báo, vạch kẻ đường theo quy chuẩn mới nhất
              </p>
            </div>
            <div className="ts-hero-stats">
              <div className="hero-stat">
                <div className="stat-number">{total}</div>
                <div className="stat-label">Biển báo</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">{types.length}</div>
                <div className="stat-label">Loại biển</div>
              </div>
            </div>
          </div>
        </div>
        <div className="ts-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </div>

      <div className="container">
        {/* Filter Bar */}
        <div className="ts-filter-bar">
          <div className="filter-group">
            <label className="filter-label">
              <span className="label-icon">🏷️</span>
              Loại biển báo
            </label>
            <select
              className="filter-select"
              value={filters.signType}
              onChange={e => setFilter('signType', e.target.value)}
            >
              <option value="">Tất cả loại biển</option>
              {types?.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <label className="filter-label">
              <span className="label-icon">🔍</span>
              Tìm kiếm
            </label>
            <input
              className="filter-input"
              placeholder="Tìm theo mã biển, tên biển..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="ts-results-info">
          <div className="results-count">
            <span className="count-number">{total}</span>
            <span className="count-label">biển báo</span>
          </div>
          <div className="results-page">
            Trang {filters.page} / {totalPages || 1}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải biển báo...</p>
          </div>
        ) : (
          <>
            <div className="ts-grid">
              {signs?.map((sign, index) => {
                const signCode = sign.SignCode || sign.signCode;
                const signName = sign.SignName || sign.signName;
                const signType = sign.SignType || sign.signType;
                const imageURL = sign.ImageURL || sign.imageURL;
                const typeColor = getSignTypeColor(signType);
                
                return (
                  <div
                    key={signCode || index}
                    className="ts-card"
                    onClick={() => setSelected(sign)}
                  >
                    <div className="ts-card-inner">
                      <div className="ts-image-container">
                        {imageURL ? (
                          <img
                            className="ts-image"
                            src={imageURL} 
                            alt={signName}
                            onError={e => {
                              e.target.src = '';
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="ts-no-image">🚧</div>';
                            }}
                          />
                        ) : (
                          <div className="ts-no-image">🚧</div>
                        )}
                      </div>
                      
                      <div className="ts-card-content">
                        <div className="ts-code" style={{ backgroundColor: `${typeColor}15`, color: typeColor }}>
                          {signCode}
                        </div>
                        <div className="ts-name">{signName}</div>
                        {signType && (
                          <div className="ts-type">
                            <span className="type-icon">{getSignTypeIcon(signType)}</span>
                            {signType}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {signs.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">🚫</div>
                  <h3 className="empty-title">Không tìm thấy biển báo</h3>
                  <p className="empty-desc">Vui lòng thử lại với từ khóa khác</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(f => ({ ...f, page: 1 }))}
                  >
                    «
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  >
                    ‹
                  </button>
                  
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let p;
                    if (totalPages <= 7) p = i + 1;
                    else if (filters.page <= 4) p = i + 1;
                    else if (filters.page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = filters.page - 3 + i;

                    return (
                      <button
                        key={p}
                        className={`pagination-btn ${filters.page === p ? 'active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, page: p }))}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    className="pagination-btn"
                    disabled={filters.page === totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  >
                    ›
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={filters.page === totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: totalPages }))}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">🚦</span>
                <h3>Chi tiết biển báo</h3>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-image">
                {(selected.ImageURL || selected.imageURL) ? (
                  <img
                    src={selected.ImageURL || selected.imageURL}
                    alt={selected.SignName || selected.signName}
                    onError={e => { 
                      e.target.src = '';
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="modal-no-image">🚧 Không có ảnh</div>';
                    }}
                  />
                ) : (
                  <div className="modal-no-image">🚧 Không có ảnh</div>
                )}
              </div>

              <div className="modal-info">
                <div className="info-row">
                  <span className="info-label">Mã biển:</span>
                  <span className="info-value highlight">
                    {selected.SignCode || selected.signCode}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Tên biển:</span>
                  <span className="info-value">{selected.SignName || selected.signName}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Loại biển:</span>
                  <span className="info-value">
                    <span className="type-badge">
                      {getSignTypeIcon(selected.SignType || selected.signType)}
                      {' '}{selected.SignType || selected.signType || '—'}
                    </span>
                  </span>
                </div>

                {(selected.Description || selected.description) && (
                  <div className="info-row description">
                    <span className="info-label">Mô tả:</span>
                    <p className="info-value description-text">
                      {selected.Description || selected.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn" onClick={() => setSelected(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}