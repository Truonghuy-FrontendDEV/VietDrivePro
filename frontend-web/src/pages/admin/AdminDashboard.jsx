import { useCallback, useEffect, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../components/AuthContext';

// ─────────────────────────────────────────────────────────────
// MENU — Đầy đủ các mục
// ─────────────────────────────────────────────────────────────
const MENU = [
  { to: '',            icon: '📊', label: 'Tổng quan'     },
  { to: 'questions',   icon: '❓', label: 'Câu hỏi'       },
  { to: 'sample-exams',icon: '📋', label: 'Đề thi mẫu'    },
  { to: 'users',       icon: '👥', label: 'Người dùng'    },
  { to: 'signs',       icon: '🚦', label: 'Biển báo'      },
  { to: 'regulations', icon: '📜', label: 'Văn bản luật'  },
  { to: 'reports',     icon: '📈', label: 'Báo cáo'       },
  { to: 'sessions',    icon: '📝', label: 'Lịch sử thi'   },
];

// ─────────────────────────────────────────────────────────────
// LAYOUT CHÍNH
// ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        flexShrink: 0,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>⚙️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>VietDrivePro</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {MENU.map(m => (
            <NavLink
              key={m.to}
              to={`/admin${m.to ? '/' + m.to : ''}`}
              end={m.to === ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                margin: '2px 8px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              })}
            >
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div style={{
          padding: 16,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            padding: '8px 4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16
            }}>
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user?.fullName || 'Admin'}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>Quản trị viên</div>
            </div>
          </div>
          <button
            onClick={() => nav('/')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            🏠 Về trang chủ
          </button>
          <button
            onClick={() => { logout(); nav('/login'); }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              border: 'none',
              background: 'rgba(220,38,38,0.25)',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.25)'}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', minWidth: 0 }}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="questions" element={<Questions />} />
          <Route path="sample-exams" element={<SampleExams />} />
          <Route path="users" element={<Users />} />
          <Route path="signs" element={<Signs />} />
          <Route path="regulations" element={<Regs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="sessions" element={<Sessions />} />
        </Routes>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED COMPONENTS & HELPERS
// ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s'
};

function PageHeader({ title, action }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 12
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{title}</h1>
      {action}
    </div>
  );
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const buttonStyle = (disabled = false, active = false) => ({
    minWidth: 38,
    height: 38,
    padding: '0 12px',
    borderRadius: 8,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: active ? 'none' : '1.5px solid #e2e8f0',
    background: active ? '#6366f1' : '#fff',
    color: active ? '#fff' : '#374151',
    opacity: disabled ? 0.5 : 1
  });

  return (
    <div style={{
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      marginTop: 24,
      flexWrap: 'wrap'
    }}>
      <button
        disabled={page === 1}
        onClick={() => onChange(1)}
        style={buttonStyle(page === 1)}
      >«</button>
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        style={buttonStyle(page === 1)}
      >‹</button>
      {getPageNumbers().map((p, idx) => (
        p === '...' ? (
          <span key={idx} style={{ padding: '0 8px', alignSelf: 'center' }}>...</span>
        ) : (
          <button
            key={idx}
            onClick={() => onChange(p)}
            style={buttonStyle(false, page === p)}
          >{p}</button>
        )
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        style={buttonStyle(page === totalPages)}
      >›</button>
      <button
        disabled={page === totalPages}
        onClick={() => onChange(totalPages)}
        style={buttonStyle(page === totalPages)}
      >»</button>
    </div>
  );
}

function Modal({ show, onClose, title, children, footer, wide }) {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%',
          maxWidth: wide ? 900 : 680,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1.5px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 1
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              border: 'none',
              background: '#f1f5f9',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 20,
              fontWeight: 600
            }}
          >×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && (
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            padding: '16px 24px',
            borderTop: '1.5px solid #f1f5f9'
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 6
      }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function DataTable({ columns, rows, loading }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1.5px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
          }} />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '2px solid #e2e8f0'
              }}>
                {columns.map(col => (
                  <th key={col} style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: '#64748b',
                    whiteSpace: 'nowrap'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '14px 16px', verticalAlign: 'middle' }}>{cell}</td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{
                    textAlign: 'center',
                    padding: 48,
                    color: '#9ca3af'
                  }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERVIEW - Tổng quan
// ─────────────────────────────────────────────────────────────
function Overview() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/admin/overview')
      .then(r => setData(r.data))
      .catch(() => {});
  }, []);

  if (!data) return <LoadingSpinner />;

  const maxCount = Math.max(...(data.daily7days || []).map(d => d.count), 1);

  const statsCards = [
    { icon: '👥', label: 'Học viên', value: data.totalUsers, color: '#1a56db' },
    { icon: '📝', label: 'Lượt thi', value: data.totalExams, color: '#7c3aed' },
    { icon: '✅', label: 'Đạt', value: data.passedExams, color: '#059669' },
    { icon: '❌', label: 'Không đạt', value: data.failedExams, color: '#dc2626' },
    { icon: '📈', label: 'Tỷ lệ đạt', value: `${data.passRate}%`, color: '#d97706' },
    { icon: '❓', label: 'Câu hỏi', value: data.totalQuestions, color: '#0891b2' },
    { icon: '🚦', label: 'Biển báo', value: data.totalSigns, color: '#65a30d' },
    { icon: '📜', label: 'Văn bản luật', value: data.totalRegs, color: '#7c3aed' }
  ];

  return (
    <div>
      <PageHeader title="📊 Tổng quan hệ thống" />

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        {statsCards.map(card => (
          <div key={card.label} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '20px 16px',
            border: '1.5px solid #e2e8f0',
            textAlign: 'center',
            borderTop: `4px solid ${card.color}`,
            transition: 'transform 0.2s'
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Chart */}
      {data.daily7days?.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          border: '1.5px solid #e2e8f0'
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
            📅 Lượt thi 7 ngày gần đây
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
            {data.daily7days.map((d, i) => (
              <div key={i} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>{d.count}</div>
                <div style={{
                  width: '100%',
                  height: `${Math.round(d.count / maxCount * 100)}%`,
                  minHeight: 4,
                  background: 'linear-gradient(180deg, #6366f1, #818cf8)',
                  borderRadius: '4px 4px 0 0'
                }} />
                <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
                  {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REPORTS - Báo cáo chi tiết
// ─────────────────────────────────────────────────────────────
function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?days=${days}`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !data) return <LoadingSpinner />;

  const { summary, daily, byLicense, topWrong, avgScores, newUsersByDay } = data;
  const maxDaily = Math.max(...daily.map(d => d.total), 1);
  const maxScore = Math.max(...avgScores.map(d => d.avgScore), 1);

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>📈 Báo cáo thống kê</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                background: days === d ? '#6366f1' : '#f1f5f9',
                color: days === d ? '#fff' : '#374151',
                transition: 'all 0.2s'
              }}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {[
          { icon: '📝', label: 'Tổng lượt thi', value: summary.totalExams, color: '#1a56db' },
          { icon: '✅', label: 'Lượt đạt', value: summary.passedExams, color: '#059669' },
          { icon: '❌', label: 'Lượt không đạt', value: summary.failedExams, color: '#dc2626' },
          { icon: '📈', label: 'Tỷ lệ đậu', value: `${summary.passRate}%`, color: '#d97706' },
          { icon: '👥', label: 'User mới', value: summary.newUsers, color: '#7c3aed' },
          { icon: '⚠️', label: 'Lỗi điểm liệt', value: summary.criticalFail, color: '#ea580c' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff',
            borderRadius: 16,
            padding: '20px 16px',
            border: '1.5px solid #e2e8f0',
            textAlign: 'center',
            borderTop: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Daily & License Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Daily Exams */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📅 Lượt thi theo ngày</div>
          {daily.length === 0 ? (
            <EmptyData />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110 }}>
                {daily.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#6366f1' }}>{d.total}</div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{
                        width: '100%',
                        height: `${Math.round(d.passed / maxDaily * 80)}px`,
                        minHeight: d.passed > 0 ? 3 : 0,
                        background: '#10b981',
                        borderRadius: '2px 2px 0 0'
                      }} />
                      <div style={{
                        width: '100%',
                        height: `${Math.round(d.failed / maxDaily * 80)}px`,
                        minHeight: d.failed > 0 ? 3 : 0,
                        background: '#ef4444'
                      }} />
                    </div>
                    <div style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }} /> Đạt
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2 }} /> Không đạt
                </span>
              </div>
            </>
          )}
        </div>

        {/* By License */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🚗 Tỷ lệ đậu theo hạng bằng</div>
          {byLicense.length === 0 ? (
            <EmptyData />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byLicense.map(license => (
                <div key={license.license}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>Hạng {license.license}</span>
                    <span style={{ color: '#6b7280' }}>
                      {license.passed}/{license.total} — <strong style={{ color: '#059669' }}>{license.passRate}%</strong>
                    </span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #059669, #34d399)',
                      width: `${license.passRate}%`,
                      borderRadius: 6,
                      transition: 'width 0.4s'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Avg Scores & New Users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Avg Scores */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🎯 Điểm trung bình theo ngày</div>
          {avgScores.length === 0 ? (
            <EmptyData />
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110 }}>
              {avgScores.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#d97706' }}>{d.avgScore}</div>
                  <div style={{
                    width: '100%',
                    height: `${Math.round(d.avgScore / maxScore * 90)}px`,
                    minHeight: 4,
                    background: 'linear-gradient(180deg, #d97706, #fbbf24)',
                    borderRadius: '2px 2px 0 0'
                  }} />
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>
                    {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Users */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>👥 Người dùng mới đăng ký</div>
          {newUsersByDay.length === 0 ? (
            <EmptyData />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {newUsersByDay.slice(-7).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#6b7280', minWidth: 70 }}>
                    {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 6, height: 8 }}>
                    <div style={{
                      height: '100%',
                      background: '#7c3aed',
                      borderRadius: 6,
                      width: `${Math.min(d.count * 20, 100)}%`
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', minWidth: 28 }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Wrong Questions */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>❌ Top 10 câu sai nhiều nhất</div>
        {topWrong.length === 0 ? (
          <EmptyData />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>#</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>Nội dung câu hỏi</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: '#64748b' }}>Điểm liệt</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: '#64748b' }}>Số lần sai</th>
                </tr>
              </thead>
              <tbody>
                {topWrong.map((w, i) => (
                  <tr key={w.questionID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#94a3b8' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>
                      <div style={{ maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {w.content}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {w.isCritical ? (
                        <span style={{ background: '#fde8e8', color: '#9b1c1c', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                          ⚠️ Liệt
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 800, padding: '4px 14px', borderRadius: 10 }}>
                        {w.errorCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SAMPLE EXAMS - Quản lý đề thi mẫu
// ─────────────────────────────────────────────────────────────
function SampleExams() {
  const [exams, setExams] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterLicense, setFilterLicense] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ examName: '', licenseTypeID: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [examDetail, setExamDetail] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const PAGE_SIZE = 15;

  useEffect(() => {
    api.get('/license-types').then(r => setLicenseTypes(r.data)).catch(() => {});
  }, []);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (filterLicense) params.append('licenseTypeId', filterLicense);
      const { data } = await api.get(`/admin/sample-exams?${params}`);
      setExams(data.data);
      setTotal(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [page, filterLicense]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const openCreateModal = () => {
    setEditId(null);
    setForm({ examName: '', licenseTypeID: licenseTypes[0]?.licenseTypeID || '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (exam) => {
    setEditId(exam.sampleExamID);
    setForm({ examName: exam.examName || '', licenseTypeID: exam.licenseTypeID });
    setFormError('');
    setShowModal(true);
  };

  const saveExam = async () => {
    if (!form.examName.trim()) {
      setFormError('Tên đề thi không được trống.');
      return;
    }
    if (!form.licenseTypeID) {
      setFormError('Vui lòng chọn hạng bằng.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        examName: form.examName.trim(),
        licenseTypeID: parseInt(form.licenseTypeID)
      };
      if (editId) {
        await api.put(`/admin/sample-exams/${editId}`, payload);
      } else {
        await api.post('/admin/sample-exams', payload);
      }
      setShowModal(false);
      fetchExams();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Lỗi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const deleteExam = async (id, name) => {
    if (!window.confirm(`Xóa đề thi "${name}"?`)) return;
    await api.delete(`/admin/sample-exams/${id}`);
    fetchExams();
  };

  // ========== ĐÃ SỬA ==========
  const openQuestionsManager = async (examId) => {
    setQuestionsLoading(true);
    setShowQuestionsModal(true);
    setQuestionSearch('');
    
    try {
      console.log('🟢 Đang tải examId:', examId);
      
      const examRes = await api.get(`/admin/sample-exams/${examId}/questions`);
      console.log('🟢 Exam response:', examRes.data);
      
      const questionsRes = await api.get('/admin/questions?pageSize=500');
      console.log('🟢 Questions response:', questionsRes.data);
      
      if (examRes.data) {
        setExamDetail(examRes.data);
      } else {
        console.error('🔴 Không có dữ liệu đề thi');
        alert('Không thể tải dữ liệu đề thi');
        setShowQuestionsModal(false);
        return;
      }
      
      if (questionsRes.data && Array.isArray(questionsRes.data.data)) {
        setAllQuestions(questionsRes.data.data);
      } else if (questionsRes.data && Array.isArray(questionsRes.data)) {
        setAllQuestions(questionsRes.data);
      } else {
        console.error('🔴 Cấu trúc dữ liệu câu hỏi không đúng', questionsRes.data);
        setAllQuestions([]);
      }
      
    } catch (error) {
      console.error('🔴 LỖI:', error);
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('URL:', error.config?.url);
        
        if (error.response.status === 500) {
          alert(`❌ Lỗi Server (500) tại API: ${error.config?.url}\n\nVui lòng kiểm tra backend log!`);
        } else if (error.response.status === 404) {
          alert(`❌ Không tìm thấy dữ liệu (404) tại: ${error.config?.url}`);
        } else {
          alert(`❌ Lỗi: ${error.response.data?.message || 'Có lỗi xảy ra'}`);
        }
      } else if (error.request) {
        alert('❌ Không thể kết nối đến server. Kiểm tra backend đã chạy chưa?');
      } else {
        alert(`❌ Lỗi: ${error.message}`);
      }
      
      setShowQuestionsModal(false);
      
    } finally {
      setQuestionsLoading(false);
    }
  };
  // ========== KẾT THÚC SỬA ==========

  // ========== ĐÃ SỬA ==========
  const addQuestionToExam = async (questionId) => {
    if (!examDetail?.sampleExamID) {
      alert('Không tìm thấy thông tin đề thi');
      return;
    }
    
    setQuestionsLoading(true);
    try {
      await api.post(`/admin/sample-exams/${examDetail.sampleExamID}/add-question/${questionId}`);
      const res = await api.get(`/admin/sample-exams/${examDetail.sampleExamID}/questions`);
      setExamDetail(res.data);
    } catch (e) {
      console.error('Add question error:', e);
      alert(e.response?.data?.message || 'Lỗi khi thêm câu hỏi');
    } finally {
      setQuestionsLoading(false);
    }
  };
  // ========== KẾT THÚC SỬA ==========

  // ========== ĐÃ SỬA ==========
  const removeQuestionFromExam = async (questionId) => {
    if (!examDetail?.sampleExamID) return;
    
    setQuestionsLoading(true);
    try {
      await api.delete(`/admin/sample-exams/${examDetail.sampleExamID}/remove-question/${questionId}`);
      const res = await api.get(`/admin/sample-exams/${examDetail.sampleExamID}/questions`);
      setExamDetail(res.data);
    } catch (e) {
      console.error('Remove question error:', e);
      alert(e.response?.data?.message || 'Lỗi khi xóa câu hỏi');
    } finally {
      setQuestionsLoading(false);
    }
  };
  // ========== KẾT THÚC SỬA ==========

  const isQuestionInExam = (questionId) => {
    return examDetail?.questions?.some(q => q.questionID === questionId);
  };

  const filteredQuestions = allQuestions.filter(q =>
    !questionSearch || (q.content && q.content.toLowerCase().includes(questionSearch.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="📋 Quản lý đề thi mẫu"
        action={
          <button
            onClick={openCreateModal}
            style={{
              background: '#1a56db',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            + Tạo đề thi mới
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filterLicense}
          onChange={e => { setFilterLicense(e.target.value); setPage(1); }}
          style={inputStyle}
        >
          <option value="">-- Tất cả hạng bằng --</option>
          {licenseTypes.map(lt => (
            <option key={lt.licenseTypeID} value={lt.licenseTypeID}>
              Hạng {lt.typeName}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Tổng <strong>{total}</strong> đề thi
        </span>
      </div>

      <DataTable
        loading={loading}
        columns={['ID', 'Tên đề thi', 'Hạng bằng', 'Số câu', 'Thao tác']}
        rows={exams.map(exam => [
          <span style={{ color: '#94a3b8', fontSize: 12 }}>#{exam.sampleExamID}</span>,
          <strong style={{ fontSize: 14 }}>{exam.examName}</strong>,
          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            Hạng {exam.licenseTypeName}
          </span>,
          <span style={{ fontWeight: 700, color: '#7c3aed' }}>{exam.questionCount} câu</span>,
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => openQuestionsManager(exam.sampleExamID)}
              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              📝 Câu hỏi
            </button>
            <button
              onClick={() => openEditModal(exam)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              ✏️
            </button>
            <button
              onClick={() => deleteExam(exam.sampleExamID, exam.examName)}
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              🗑
            </button>
          </div>
        ])}
      />

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? '✏️ Sửa đề thi' : '+ Tạo đề thi mới'}
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 22px', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              onClick={saveExam}
              disabled={saving}
              style={{ background: saving ? '#93c5fd' : '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '⏳ Đang lưu...' : editId ? '💾 Cập nhật' : '+ Tạo đề'}
            </button>
          </>
        }
      >
        {formError && <ErrorAlert message={formError} />}
        <FormField label="Tên đề thi" required>
          <input
            value={form.examName}
            onChange={e => setForm(f => ({ ...f, examName: e.target.value }))}
            placeholder="VD: Đề thi mẫu A1 số 1"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Hạng bằng" required>
          <select
            value={form.licenseTypeID}
            onChange={e => setForm(f => ({ ...f, licenseTypeID: e.target.value }))}
            style={inputStyle}
          >
            <option value="">-- Chọn hạng bằng --</option>
            {licenseTypes.map(lt => (
              <option key={lt.licenseTypeID} value={lt.licenseTypeID}>
                Hạng {lt.typeName}
              </option>
            ))}
          </select>
        </FormField>
      </Modal>

      {/* ========== ĐÃ SỬA MODAL NÀY ========== */}
      <Modal
        show={showQuestionsModal}
        onClose={() => setShowQuestionsModal(false)}
        title={examDetail ? `📝 Câu hỏi trong đề: ${examDetail.examName} (Hạng ${examDetail.licenseTypeName})` : '📝 Câu hỏi'}
        wide
      >
        {questionsLoading ? (
          <LoadingSpinner />
        ) : !examDetail ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
            ⚠️ Không thể tải dữ liệu đề thi. Vui lòng đóng và thử lại.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Questions in exam */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                ✅ Trong đề ({examDetail?.questions?.length || 0} câu)
              </div>
              <div style={{ maxHeight: 450, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!examDetail?.questions || examDetail.questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    📭 Chưa có câu hỏi nào
                  </div>
                ) : (
                  examDetail.questions.map(q => (
                    <div
                      key={q.questionID}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        padding: '10px 14px',
                        background: '#f0fdf4',
                        borderRadius: 10,
                        border: '1px solid #bbf7d0',
                        fontSize: 13
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {q.content && q.content.length > 80 ? q.content.slice(0, 80) + '…' : (q.content || 'Không có nội dung')}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {q.categoryName || 'Không có danh mục'}
                          {q.isCritical && <span style={{ color: '#dc2626', marginLeft: 6 }}>⚠️ Liệt</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestionFromExam(q.questionID)}
                        disabled={questionsLoading}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: questionsLoading ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add from bank */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                📚 Ngân hàng câu hỏi
              </div>
              <input
                value={questionSearch}
                onChange={e => setQuestionSearch(e.target.value)}
                placeholder="🔍 Tìm câu hỏi..."
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <div style={{ maxHeight: 450, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredQuestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    📭 Không tìm thấy câu hỏi nào
                  </div>
                ) : (
                  filteredQuestions.slice(0, 50).map(q => {
                    const isAdded = isQuestionInExam(q.questionID);
                    return (
                      <div
                        key={q.questionID}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'flex-start',
                          padding: '10px 14px',
                          background: isAdded ? '#f9fafb' : '#fff',
                          borderRadius: 10,
                          border: `1px solid ${isAdded ? '#e2e8f0' : '#e2e8f0'}`,
                          fontSize: 13,
                          opacity: isAdded ? 0.6 : 1
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            {q.content && q.content.length > 70 ? q.content.slice(0, 70) + '…' : (q.content || 'Không có nội dung')}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{q.categoryName || 'Không có danh mục'}</div>
                        </div>
                        <button
                          onClick={() => !isAdded && addQuestionToExam(q.questionID)}
                          disabled={isAdded || questionsLoading}
                          style={{
                            background: isAdded ? '#f1f5f9' : '#eff6ff',
                            color: isAdded ? '#94a3b8' : '#1d4ed8',
                            border: `1px solid ${isAdded ? '#e2e8f0' : '#bfdbfe'}`,
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            cursor: (isAdded || questionsLoading) ? 'not-allowed' : 'pointer',
                            fontWeight: 700
                          }}
                        >
                          {isAdded ? '✓' : '+'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* ========== KẾT THÚC SỬA MODAL ========== */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// USERS - Quản lý người dùng
// ─────────────────────────────────────────────────────────────
function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (search) params.append('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.data);
      setTotal(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleLock = async (id) => {
    await api.put(`/admin/users/${id}/lock`);
    fetchUsers();
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Xóa người dùng "${name}"?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi.');
    }
  };

  return (
    <div>
      <PageHeader
        title="👥 Quản lý người dùng"
        action={<span style={{ fontSize: 14, color: '#64748b' }}>Tổng <strong>{total}</strong></span>}
      />
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="🔍 Tìm theo tên, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable
        loading={loading}
        columns={['#', 'Họ tên', 'Email', 'Vai trò', 'Ngày tạo', 'Trạng thái', 'Thao tác']}
        rows={users.map((user, i) => [
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{(page - 1) * PAGE_SIZE + i + 1}</span>,
          <strong>{user.fullName}</strong>,
          <span style={{ fontSize: 13, color: '#64748b' }}>{user.email}</span>,
          <span style={{
            background: user.role === 'Admin' ? '#ede9fe' : '#e0f2fe',
            color: user.role === 'Admin' ? '#6d28d9' : '#0369a1',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700
          }}>
            {user.role === 'Admin' ? '⚙️ Admin' : '👤 User'}
          </span>,
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
          </span>,
          <span style={{
            background: user.isLocked ? '#fde8e8' : '#dcfce7',
            color: user.isLocked ? '#991b1b' : '#166534',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600
          }}>
            {user.isLocked ? '🔒 Khóa' : '✅ Hoạt động'}
          </span>,
          user.role !== 'Admin' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => toggleLock(user.userID)}
                style={{
                  background: user.isLocked ? '#f0fdf4' : '#fffbeb',
                  color: user.isLocked ? '#059669' : '#d97706',
                  border: `1px solid ${user.isLocked ? '#86efac' : '#fde68a'}`,
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {user.isLocked ? '🔓 Mở' : '🔒 Khóa'}
              </button>
              <button
                onClick={() => deleteUser(user.userID, user.fullName)}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                🗑
              </button>
            </div>
          )
        ])}
      />

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUESTIONS - Quản lý câu hỏi
// ─────────────────────────────────────────────────────────────
const EMPTY_QUESTION = {
  content: '',
  imageURL: '',
  explanation: '',
  isCritical: false,
  categoryID: '',
  licenseTypeIDs: [],
  answers: [
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false }
  ]
};

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_QUESTION);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [filters, setFilters] = useState({
    categoryId: '',
    licenseTypeId: '',
    search: '',
    page: 1,
    pageSize: 15
  });

  useEffect(() => {
    api.get('/question-bank/categories').then(r => setCategories(r.data));
    api.get('/license-types').then(r => setLicenseTypes(r.data));
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        pageSize: filters.pageSize
      });
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.licenseTypeId) params.append('licenseTypeId', filters.licenseTypeId);
      if (filters.search) params.append('search', filters.search);
      const { data } = await api.get(`/admin/questions?${params}`);
      setQuestions(data.data);
      setTotal(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const openCreateModal = () => {
    setEditId(null);
    setForm(EMPTY_QUESTION);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditId(q.questionID);
    setForm({
      content: q.content,
      imageURL: q.imageURL || '',
      explanation: q.explanation || '',
      isCritical: q.isCritical,
      categoryID: String(q.categoryID),
      licenseTypeIDs: q.licenseTypeIDs || [],
      answers: q.answers.length >= 4
        ? q.answers.map(a => ({ answerText: a.answerText, isCorrect: a.isCorrect }))
        : [...q.answers.map(a => ({ answerText: a.answerText, isCorrect: a.isCorrect })), ...Array(4 - q.answers.length).fill({ answerText: '', isCorrect: false })]
    });
    setFormError('');
    setShowModal(true);
  };

  const saveQuestion = async () => {
    // Validation
    if (!form.content.trim()) {
      setFormError('Nội dung câu hỏi không được trống.');
      return;
    }
    if (!form.categoryID) {
      setFormError('Vui lòng chọn chương.');
      return;
    }
    if (form.licenseTypeIDs.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 hạng bằng áp dụng.');
      return;
    }
    if (!form.answers.some(a => a.isCorrect)) {
      setFormError('Phải chọn ít nhất 1 đáp án đúng.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        content: form.content.trim(),
        imageURL: form.imageURL || null,
        explanation: form.explanation || null,
        isCritical: form.isCritical,
        categoryID: form.categoryID ? parseInt(form.categoryID) : 0,
        licenseTypeIDs: form.licenseTypeIDs.filter(id => id).map(Number),
        answers: form.answers.map(a => ({
          answerText: a.answerText.trim() || '',
          isCorrect: a.isCorrect
        }))
      };

      // Debug: kiểm tra payload trước khi gửi
      console.log('📦 Payload gửi lên:', payload);

      if (editId !== null) {
        await api.put(`/admin/questions/${editId}`, payload);
      } else {
        await api.post('/admin/questions', payload);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (e) {
      console.error('❌ Lỗi response:', e.response?.data);
      setFormError(e.response?.data?.message || 'Lỗi lưu câu hỏi. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      fetchQuestions();
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi xóa câu hỏi.');
    }
  };

  const updateAnswer = (index, field, value) => {
    setForm(prev => {
      const newAnswers = [...prev.answers];
      if (field === 'isCorrect') {
        newAnswers.forEach((_, i) => {
          newAnswers[i] = { ...newAnswers[i], isCorrect: i === index };
        });
      } else {
        newAnswers[index] = { ...newAnswers[index], [field]: value };
      }
      return { ...prev, answers: newAnswers };
    });
  };

  const toggleLicenseType = (id) => {
    setForm(prev => ({
      ...prev,
      licenseTypeIDs: prev.licenseTypeIDs.includes(id)
        ? prev.licenseTypeIDs.filter(x => x !== id)
        : [...prev.licenseTypeIDs, id]
    }));
  };

  return (
    <div>
      <PageHeader
        title="❓ Quản lý câu hỏi"
        action={
          <button
            onClick={openCreateModal}
            style={{ background: '#1a56db', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            + Thêm câu hỏi
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          style={{ ...inputStyle, flex: 'none', minWidth: 160 }}
          value={filters.licenseTypeId}
          onChange={e => updateFilter('licenseTypeId', e.target.value)}
        >
          <option value="">-- Hạng bằng --</option>
          {licenseTypes.map(lt => (
            <option key={lt.licenseTypeID} value={lt.licenseTypeID}>Hạng {lt.typeName}</option>
          ))}
        </select>
        <select
          style={{ ...inputStyle, flex: 'none', minWidth: 190 }}
          value={filters.categoryId}
          onChange={e => updateFilter('categoryId', e.target.value)}
        >
          <option value="">-- Chương --</option>
          {categories.map(cat => (
            <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
          ))}
        </select>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          placeholder="🔍 Tìm nội dung..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />
        <span style={{ fontSize: 14, color: '#64748b', whiteSpace: 'nowrap' }}>
          <strong>{total}</strong> câu
        </span>
      </div>

      <DataTable
        loading={loading}
        columns={['ID', 'Nội dung câu hỏi', 'Chương', 'Điểm liệt', 'Thao tác']}
        rows={questions.map(q => [
          <span key={`id-${q.questionID}`} style={{ color: '#94a3b8', fontSize: 12 }}>{String(q.questionID ?? '')}</span>,
          <div key={`content-${q.questionID}`} style={{ maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{q.content}</div>,
          <span key={`cat-${q.questionID}`} style={{ fontSize: 12, color: '#64748b' }}>{q.categoryName}</span>,
          q.isCritical ? (
            <span key={`critical-${q.questionID}`} style={{ background: '#fde8e8', color: '#9b1c1c', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>⚠️ Liệt</span>
          ) : '—',
          <div key={`action-${q.questionID}`} style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => openEditModal(q)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              ✏️
            </button>
            <button
              onClick={() => deleteQuestion(q.questionID)}
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              🗑
            </button>
          </div>
        ])}
      />

      <Pagination page={filters.page} total={total} pageSize={filters.pageSize} onChange={p => setFilters(prev => ({ ...prev, page: p }))} />

      {/* Question Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId !== null ? '✏️ Sửa câu hỏi' : '+ Thêm câu hỏi mới'}
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 22px', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              onClick={saveQuestion}
              disabled={saving}
              style={{ background: saving ? '#93c5fd' : '#1a56db', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '⏳ Đang lưu...' : (editId !== null ? '💾 Cập nhật' : '+ Thêm mới')}
            </button>
          </>
        }
      >
        {formError && <ErrorAlert message={formError} />}

        <FormField label="Nội dung câu hỏi" required>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Chương" required>
            <select
              value={form.categoryID}
              onChange={e => setForm(f => ({ ...f, categoryID: e.target.value }))}
              style={inputStyle}
            >
              <option value="">-- Chọn chương --</option>
              {categories.map(cat => (
                <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Tên file ảnh">
            <input
              value={form.imageURL}
              onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))}
              placeholder="p123.png"
              style={inputStyle}
            />
          </FormField>
        </div>

        <FormField label="Hạng bằng áp dụng" required>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {licenseTypes.map(lt => (
              <label key={lt.licenseTypeID} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form.licenseTypeIDs.includes(lt.licenseTypeID)}
                  onChange={() => toggleLicenseType(lt.licenseTypeID)}
                />
                Hạng {lt.typeName}
              </label>
            ))}
          </div>
        </FormField>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input
            type="checkbox"
            id="critical"
            checked={form.isCritical}
            onChange={e => setForm(f => ({ ...f, isCritical: e.target.checked }))}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          <label htmlFor="critical" style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            ⚠️ Câu điểm liệt
          </label>
        </div>

        <FormField label="Đáp án" required>
          {form.answers.map((ans, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <input
                type="radio"
                name="correctAnswer"
                checked={ans.isCorrect}
                onChange={() => updateAnswer(idx, 'isCorrect', true)}
                style={{ width: 18, height: 18, flexShrink: 0, cursor: 'pointer' }}
              />
              <input
                value={ans.answerText}
                onChange={e => updateAnswer(idx, 'answerText', e.target.value)}
                placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                style={{ ...inputStyle, border: `1.5px solid ${ans.isCorrect ? '#86efac' : '#e2e8f0'}` }}
              />
              {ans.isCorrect && <span style={{ fontSize: 18 }}>✅</span>}
            </div>
          ))}
        </FormField>

        <FormField label="Giải thích">
          <textarea
            value={form.explanation}
            onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
            rows={2}
            placeholder="Lý do đáp án đúng..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </FormField>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SIGNS - Quản lý biển báo
// ─────────────────────────────────────────────────────────────
const EMPTY_SIGN = { signCode: '', signName: '', signType: '', imageURL: '', description: '' };

function Signs() {
  const [signs, setSigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_SIGN);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const PAGE_SIZE = 15;

  const fetchSigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (search) params.append('keyword', search);
      const { data } = await api.get(`/trafficSigns?${params}`);
      setSigns(data.signs);
      setTotal(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchSigns(); }, [fetchSigns]);

  const openCreateModal = () => {
    setEditId(null);
    setForm(EMPTY_SIGN);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (sign) => {
    setEditId(sign.signID);
    setForm({
      signCode: sign.signCode,
      signName: sign.signName,
      signType: sign.signType || '',
      imageURL: sign.imageURL || '',
      description: sign.description || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const saveSign = async () => {
    if (!form.signCode.trim() || !form.signName.trim()) {
      setFormError('Mã và tên biển báo không được trống.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editId) {
        await api.put(`/admin/signs/${editId}`, form);
      } else {
        await api.post('/admin/signs', form);
      }
      setShowModal(false);
      fetchSigns();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Lỗi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSign = async (id) => {
    if (!window.confirm('Xóa biển báo này?')) return;
    await api.delete(`/admin/signs/${id}`);
    fetchSigns();
  };

  return (
    <div>
      <PageHeader
        title="🚦 Quản lý biển báo"
        action={
          <button
            onClick={openCreateModal}
            style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            + Thêm biển báo
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="🔍 Tìm theo tên, mã biển..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span style={{ fontSize: 14, color: '#64748b', whiteSpace: 'nowrap' }}>
          <strong>{total}</strong> biển
        </span>
      </div>

      <DataTable
        loading={loading}
        columns={['Ảnh', 'Mã biển', 'Tên biển báo', 'Loại biển', 'Thao tác']}
        rows={signs?.map(sign => [
          sign.imageURL ? (
            <img src={sign.imageURL} alt="" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
          ) : (
            <span style={{ fontSize: 28 }}>🚧</span>
          ),
          <strong style={{ color: '#1a56db' }}>{sign.signCode}</strong>,
          <span style={{ fontSize: 13 }}>{sign.signName}</span>,
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{sign.signType || '—'}</span>,
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => openEditModal(sign)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              ✏️
            </button>
            <button
              onClick={() => deleteSign(sign.signID)}
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              🗑
            </button>
          </div>
        ])}
      />

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? '✏️ Sửa biển báo' : '+ Thêm biển báo'}
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 22px', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              onClick={saveSign}
              disabled={saving}
              style={{ background: saving ? '#fbbf24' : '#d97706', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '⏳ Đang lưu...' : (editId ? '💾 Cập nhật' : '+ Thêm')}
            </button>
          </>
        }
      >
        {formError && <ErrorAlert message={formError} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormField label="Mã biển" required>
            <input value={form.signCode} onChange={e => setForm(f => ({ ...f, signCode: e.target.value }))} placeholder="P.123" style={inputStyle} />
          </FormField>
          <FormField label="Loại biển">
            <input value={form.signType} onChange={e => setForm(f => ({ ...f, signType: e.target.value }))} placeholder="Biển cấm..." style={inputStyle} />
          </FormField>
        </div>
        <FormField label="Tên biển báo" required>
          <input value={form.signName} onChange={e => setForm(f => ({ ...f, signName: e.target.value }))} style={inputStyle} />
        </FormField>
        <FormField label="URL hình ảnh">
          <input value={form.imageURL} onChange={e => setForm(f => ({ ...f, imageURL: e.target.value }))} placeholder="https://..." style={inputStyle} />
        </FormField>
        {form.imageURL && (
          <div style={{ marginBottom: 16 }}>
            <img src={form.imageURL} alt="" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8, border: '1px solid #e2e8f0' }} />
          </div>
        )}
        <FormField label="Mô tả">
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </FormField>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REGULATIONS - Quản lý văn bản luật
// ─────────────────────────────────────────────────────────────
const EMPTY_REG = { title: '', content: '', penaltyRange: '' };

function Regs() {
  const [regulations, setRegulations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_REG);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const PAGE_SIZE = 15;

  const fetchRegulations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (search) params.append('keyword', search);
      const { data } = await api.get(`/regulations?${params}`);
      setRegulations(data.regulations || []);  
      setTotal(data.totalCount || 0);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchRegulations(); }, [fetchRegulations]);

  const openCreateModal = () => {
    setEditId(null);
    setForm(EMPTY_REG);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (reg) => {
    setEditId(reg.regulationID);
    setForm({
      title: reg.title,
      content: reg.content,
      penaltyRange: reg.penaltyRange || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const saveRegulation = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError('Tiêu đề và nội dung không được trống.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editId) {
        await api.put(`/admin/regulations/${editId}`, form);
      } else {
        await api.post('/admin/regulations', form);
      }
      setShowModal(false);
      fetchRegulations();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Lỗi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRegulation = async (id) => {
    if (!window.confirm('Xóa văn bản luật này?')) return;
    await api.delete(`/admin/regulations/${id}`);
    fetchRegulations();
  };

  return (
    <div>
      <PageHeader
        title="📜 Quản lý văn bản luật"
        action={
          <button
            onClick={openCreateModal}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            + Thêm văn bản
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="🔍 Tìm tiêu đề..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span style={{ fontSize: 14, color: '#64748b', whiteSpace: 'nowrap' }}>
          <strong>{total}</strong> văn bản
        </span>
      </div>

      <DataTable
        loading={loading}
        columns={['#', 'Tiêu đề', 'Mức phạt', 'Cập nhật', 'Thao tác']}
        rows={(regulations || []).map((reg, i) => [
          <span style={{ color: '#94a3b8', fontSize: 12 }}>{(page - 1) * PAGE_SIZE + i + 1}</span>,
          <div style={{ maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>{reg.title}</div>,
          reg.penaltyRange ? (
            <span style={{ background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 12, border: '1px solid #fde68a' }}>
              {reg.penaltyRange}
            </span>
          ) : '—',
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {new Date(reg.lastUpdated).toLocaleDateString('vi-VN')}
          </span>,
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => openEditModal(reg)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              ✏️
            </button>
            <button
              onClick={() => deleteRegulation(reg.regulationID)}
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              🗑
            </button>
          </div>
        ])}
      />

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? '✏️ Sửa văn bản luật' : '+ Thêm văn bản mới'}
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 22px', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button
              onClick={saveRegulation}
              disabled={saving}
              style={{ background: saving ? '#c084fc' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '⏳ Đang lưu...' : (editId ? '💾 Cập nhật' : '+ Thêm')}
            </button>
          </>
        }
      >
        {formError && <ErrorAlert message={formError} />}
        <FormField label="Tiêu đề" required>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
        </FormField>
        <FormField label="Mức phạt">
          <input value={form.penaltyRange} onChange={e => setForm(f => ({ ...f, penaltyRange: e.target.value }))} placeholder="800.000 – 1.000.000 đồng" style={inputStyle} />
        </FormField>
        <FormField label="Nội dung" required>
          <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} style={{ ...inputStyle, resize: 'vertical' }} />
        </FormField>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SESSIONS - Lịch sử thi
// ─────────────────────────────────────────────────────────────
function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/sessions?page=${page}&pageSize=${PAGE_SIZE}`);
      setSessions(data.data);
      setTotal(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const calculateDuration = (start, end) => {
    if (!end) return '—';
    const diff = new Date(end) - new Date(start);
    return `${Math.floor(diff / 60000)}p ${Math.floor((diff % 60000) / 1000)}s`;
  };

  return (
    <div>
      <PageHeader
        title="📝 Lịch sử thi toàn hệ thống"
        action={<span style={{ fontSize: 14, color: '#64748b' }}>Tổng <strong>{total}</strong> lần thi</span>}
      />

      <DataTable
        loading={loading}
        columns={['ID', 'User', 'Hạng', 'Điểm', 'Kết quả', 'Thời lượng', 'Thời gian', 'Chi tiết']}
        rows={sessions.map(session => [
          <span style={{ color: '#94a3b8', fontSize: 12 }}>#{session.sessionID}</span>,
          <span style={{ fontSize: 13 }}>#{session.userID}</span>,
          <strong>Hạng {session.licenseType}</strong>,
          <div>
            <span style={{ fontSize: 18, fontWeight: 900, color: session.status === 'Pass' ? '#059669' : '#dc2626' }}>{session.score}</span>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>/{session.totalQuestions}</span>
          </div>,
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{
              display: 'inline-flex',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: session.status === 'Pass' ? '#dcfce7' : '#fde8e8',
              color: session.status === 'Pass' ? '#166534' : '#9b1c1c'
            }}>
              {session.status === 'Pass' ? '✅ Đạt' : '❌ Chưa đạt'}
            </span>
            {session.hasCriticalError && (
              <span style={{
                display: 'inline-flex',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                background: '#fde8e8',
                color: '#9b1c1c'
              }}>
                ⚠️ Điểm liệt
              </span>
            )}
          </div>,
          <span style={{ fontSize: 13, color: '#64748b' }}>{calculateDuration(session.startTime, session.endTime)}</span>,
          <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {new Date(session.startTime).toLocaleString('vi-VN')}
          </span>,
          <a
            href={`/exam/result/${session.sessionID}`}
            target="_blank"
            rel="noreferrer"
            style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
          >
            Xem
          </a>
        ])}
      />

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{
        width: 44,
        height: 44,
        border: '4px solid #e2e8f0',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ErrorAlert({ message }) {
  return (
    <div style={{
      background: '#fef2f2',
      color: '#dc2626',
      borderRadius: 10,
      padding: '12px 16px',
      marginBottom: 20,
      fontSize: 14,
      borderLeft: `4px solid #dc2626`
    }}>
      ⚠️ {message}
    </div>
  );
}

function EmptyData({ text = "Không có dữ liệu" }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 40,
      color: '#9ca3af',
      fontSize: 14
    }}>
      {text}
    </div>
  );
}

// Thêm animation style toàn cục
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .modal-enter {
    animation: slideIn 0.2s ease-out;
  }
`;
document.head.appendChild(styleSheet);

