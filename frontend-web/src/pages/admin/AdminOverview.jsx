import { useState, useEffect } from 'react';
import api from '../../api';
import './AdminDashboard.css';

export default function AdminOverview() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!stats)  return <div>Không tải được dữ liệu.</div>;

  return (
    <div>
      <h1 className="page-title">📊 Tổng quan hệ thống</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        <OvCard icon="👥" label="Học viên"      value={stats.totalUsers}     color="#1565c0" />
        <OvCard icon="📝" label="Tổng lượt thi" value={stats.totalExams}     color="#6a1b9a" />
        <OvCard icon="✅" label="Đạt"           value={stats.passedExams}    color="#2e7d32" />
        <OvCard icon="❌" label="Không đạt"     value={stats.failedExams}    color="#c62828" />
        <OvCard icon="📈" label="Tỷ lệ đạt"    value={`${stats.passRate}%`} color="#f57f17" />
        <OvCard icon="❓" label="Câu hỏi"       value={stats.totalQuestions} color="#00838f" />
        <OvCard icon="🚦" label="Biển báo"      value={stats.totalSigns}     color="#558b2f" />
        <OvCard icon="📋" label="Văn bản luật"  value={stats.totalRegs}      color="#4527a0" />
      </div>

      {/* Daily exam chart (simple bar) */}
      {stats.dailyExams?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>📅 Lượt thi 7 ngày gần nhất</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {stats.dailyExams.map((d, i) => {
              const max = Math.max(...stats.dailyExams.map(x => x.count), 1);
              const h   = Math.round((d.count / max) * 100);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1565c0' }}>{d.count}</div>
                  <div style={{
                    width: '100%', height: `${h}%`, minHeight: 4,
                    background: '#1565c0', borderRadius: '4px 4px 0 0',
                    transition: 'height .3s'
                  }} />
                  <div style={{ fontSize: 10, color: '#888', textAlign: 'center' }}>
                    {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OvCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', borderTop: `4px solid ${color}`, padding: '18px 12px' }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#777' }}>{label}</div>
    </div>
  );
}
