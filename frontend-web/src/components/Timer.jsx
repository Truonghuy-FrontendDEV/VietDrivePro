import { useEffect, useRef, useState } from 'react';

export default function Timer({ totalSeconds, onTimeUp }) {
  const [left, setLeft] = useState(totalSeconds);
  const ref = useRef();
  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft(p => { if (p <= 1) { clearInterval(ref.current); onTimeUp(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []); // eslint-disable-line

  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  const pct = (left / totalSeconds) * 100;
  const danger = left <= 60;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: danger ? '#fef2f2' : '#eff6ff',
      border: `1.5px solid ${danger ? '#fca5a5' : '#bfdbfe'}`,
      borderRadius: 10, padding: '8px 16px', fontWeight: 700,
      color: danger ? '#dc2626' : '#1d4ed8', fontSize: 18,
      transition: 'all .3s',
      animation: danger ? 'pulse 1s infinite' : 'none'
    }}>
      <span>⏱</span>
      <span style={{ minWidth: 58 }}>{m}:{s}</span>
      <div style={{ width: 80, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: danger ? '#dc2626' : '#3b82f6',
          transition: 'width .9s linear'
        }} />
      </div>
    </div>
  );
}