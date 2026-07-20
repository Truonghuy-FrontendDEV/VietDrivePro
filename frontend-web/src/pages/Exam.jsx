import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Timer from '../components/Timer';
import './Exam.css';

export default function Exam() {
  const nav = useNavigate();

  // ── Setup state ───────────────────────────────────────────
  const [step,         setStep]         = useState('setup');
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [sampleExams,  setSampleExams]  = useState([]);
  const [selLT,        setSelLT]        = useState('');
  const [mode,         setMode]         = useState('random');
  const [selSE,        setSelSE]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  // ── Exam state ────────────────────────────────────────────
  const [session,    setSession]    = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [current,    setCurrent]    = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // ── Fullscreen lock state (frontend only) ─────────────────
  const [fullscreenLock, setFullscreenLock] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const warningTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const warningCountRef = useRef(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Load hạng bằng ────────────────────────────────────────
  useEffect(() => {
    api.get('/license-types')
      .then(r => {
        setLicenseTypes(r.data);
        if (r.data.length) setSelLT(String(r.data[0].licenseTypeID));
      })
      .catch(() => setError('Không thể tải danh sách hạng bằng.'));
  }, []);

  // ── Load đề mẫu khi chọn mode=sample ─────────────────────
  useEffect(() => {
    if (mode === 'sample' && selLT) {
      setSampleExams([]);
      setSelSE('');
      api.get(`/exam/sample-exams/${selLT}`)
        .then(r => {
          setSampleExams(r.data);
          if (r.data.length) setSelSE(String(r.data[0].sampleExamID));
        })
        .catch(() => setError('Không thể tải đề thi mẫu.'));
    }
  }, [mode, selLT]);

  // ── Tạo thông báo sau khi thi (DÙNG LOCALSTORAGE) ─────────
  const createExamNotification = (sessionID, score, isPassed, licenseType, totalQuestions) => {
    try {
      const percent = Math.round((score / totalQuestions) * 100);
      
      let title, message, type;
      
      if (isPassed) {
        if (percent >= 90) {
          title = '🏆 Xuất sắc! Bạn đã đậu với điểm số cao!';
          message = `Chúc mừng! Bạn đạt ${score}/${totalQuestions} điểm (${percent}%) - Hạng ${licenseType}. Thật tuyệt vời!`;
        } else if (percent >= 80) {
          title = '🌟 Tốt lắm! Bạn đã đậu!';
          message = `Bạn đạt ${score}/${totalQuestions} điểm (${percent}%). Hạng ${licenseType}. Cố gắng giữ vững phong độ!`;
        } else {
          title = '🎉 Chúc mừng! Bạn đã đậu!';
          message = `Bạn đạt ${score}/${totalQuestions} điểm (${percent}%). Hạng ${licenseType}. Tiếp tục phát huy nhé!`;
        }
        type = 'success';
      } else {
        title = '📚 Cố gắng hơn nhé!';
        message = `Bạn được ${score}/${totalQuestions} điểm (${percent}%). Hãy ôn lại các câu hỏi sai và thử lại!`;
        type = 'warning';
        
        if (percent < 50) {
          message = `Bạn được ${score}/${totalQuestions} điểm (${percent}%). Đừng nản! Hãy học kỹ 600 câu hỏi và thử lại nhé!`;
        }
      }
      
      // Lưu vào localStorage
      const existingNotifs = JSON.parse(localStorage.getItem('local_notifications') || '[]');
      const newNotif = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        time: 'Vừa xong',
        read: false,
        createdAt: new Date().toISOString(),
        examID: sessionID
      };
      
      existingNotifs.unshift(newNotif);
      // Chỉ giữ lại 50 thông báo gần nhất
      const keepNotifs = existingNotifs.slice(0, 50);
      localStorage.setItem('local_notifications', JSON.stringify(keepNotifs));
      
      console.log('✅ Đã lưu thông báo vào localStorage:', newNotif);
      
      // Dispatch event để Navbar cập nhật
      window.dispatchEvent(new CustomEvent('examCompleted'));
      window.dispatchEvent(new CustomEvent('notificationReceived'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'local_notifications',
        newValue: JSON.stringify(keepNotifs)
      }));
      
    } catch (error) {
      console.error('Lỗi tạo thông báo:', error);
    }
  };

  // ── Fullscreen Management ─────────────────────────────────
  const requestFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setFullscreenLock(true);
      setShowFullscreenPrompt(false);
    } catch (err) {
      console.error('Fullscreen error:', err);
      setShowFullscreenPrompt(true);
    }
  };

  const exitFullscreen = () => {
    try {
      if (document && typeof document.exitFullscreen === 'function') {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
          document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
    setFullscreenLock(false);
  };

  // ── Fullscreen Event Listeners ───────────────────────────
  useEffect(() => {
    if (step !== 'exam') return;

    const handleFullscreenChange = () => {
      if (isSubmittingRef.current) return;
      
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );

      if (!isFullscreen && fullscreenLock && !isSubmittingRef.current) {
        const newCount = warningCountRef.current + 1;
        warningCountRef.current = newCount;
        setWarningCount(newCount);
        setShowWarning(true);
        
        if (newCount >= 3) {
          alert('⚠️ Bạn đã vi phạm 3 lần! Bài thi sẽ tự động nộp.');
          doSubmit();
        } else {
          setTimeout(() => {
            if (step === 'exam' && !isSubmittingRef.current) requestFullscreen();
          }, 100);
          if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (isSubmittingRef.current) return;
      
      if (document.hidden && fullscreenLock && step === 'exam' && !isSubmittingRef.current) {
        const newCount = warningCountRef.current + 1;
        warningCountRef.current = newCount;
        setWarningCount(newCount);
        setShowWarning(true);
        
        if (newCount >= 3) {
          alert('⚠️ Bạn đã vi phạm 3 lần! Bài thi sẽ tự động nộp.');
          doSubmit();
        } else {
          if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [step, fullscreenLock]);

  // ── Prevent Keyboard Shortcuts ───────────────────────────
  useEffect(() => {
    if (step !== 'exam') return;

    const preventKeys = (e) => {
      if (isSubmittingRef.current) return;
      
      const blockedKeys = ['F5', 'F11', 'F12', 'Escape', 'ContextMenu'];
      
      if (
        e.altKey ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W' || e.key === 't' || e.key === 'T' || 
                       e.key === 'n' || e.key === 'N' || e.key === 'r' || e.key === 'R')) ||
        blockedKeys.includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        
        const newCount = warningCountRef.current + 1;
        warningCountRef.current = newCount;
        setWarningCount(newCount);
        setShowWarning(true);
        
        if (newCount >= 3) {
          alert('⚠️ Bạn đã vi phạm 3 lần! Bài thi sẽ tự động nộp.');
          doSubmit();
        } else {
          if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
        }
        return false;
      }
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', preventKeys);
    document.addEventListener('contextmenu', preventContextMenu);
    
    return () => {
      window.removeEventListener('keydown', preventKeys);
      document.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [step]);

  // ── Bắt đầu thi ───────────────────────────────────────────
  const startExam = async () => {
    if (!selLT) {
      setError('Vui lòng chọn hạng bằng.');
      return;
    }

    if (mode === 'sample' && !selSE) {
      setError('Vui lòng chọn đề mẫu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        licenseTypeID: parseInt(selLT),
        mode: mode,
        sampleExamID: mode === 'sample' ? parseInt(selSE) : null
      };

      const { data } = await api.post('/exam/start', payload);

      console.log("DATA BACKEND:", data);

      if (!data || !data.sessionID) {
        throw new Error("Không nhận được sessionID từ server");
      }

      setSession({
        sessionID: data.sessionID,
        licenseTypeID: data.licenseTypeID,
        licenseTypeName: data.licenseTypeName,
        timeLimitSeconds: data.timeLimitSeconds
      });

      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setAnswers({});
      setCurrent(0);
      setStep('exam');
      setWarningCount(0);
      warningCountRef.current = 0;
      isSubmittingRef.current = false;
      
      setShowFullscreenPrompt(true);

    } catch (e) {
      console.error("START EXAM ERROR:", e);
      const msg = e.response?.data?.message || e.response?.data?.detail || e.message || 'Không thể tạo đề thi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Chọn đáp án ──────────────────────────────────────────
  const pick = (qid, aid) => {
    setAnswers(prev => ({ ...prev, [qid]: aid }));

    if (session?.sessionID) {
      api.post('/exam/answer', {
        sessionID:  session.sessionID,
        questionID: qid,
        answerID:   aid
      }).catch(err => {
        console.warn('Answer save error:', err.response?.data?.message);
      });
    }
  };

  // ── Nộp bài và tạo thông báo ─────────────────────────────
  const doSubmit = useCallback(async () => {
    console.log("SESSION:", session);

    if (submitting || !session?.sessionID) {
      console.warn("❌ sessionID bị undefined hoặc đang submit");
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await api.post(`/exam/submit/${session.sessionID}`);
      console.log("SUBMIT RESPONSE:", res.data);
      
      const sid = res.data?.sessionID;
      const score = res.data?.score || 0;
      const isPassed = res.data?.isPassed || false;
      const totalQuestions = questions.length;
      const licenseType = session?.licenseTypeName || '';

      if (!sid) {
        throw new Error("Không nhận được sessionID từ server khi submit");
      }

      // 🔥 TẠO THÔNG BÁO SAU KHI THI XONG (dùng localStorage)
      createExamNotification(sid, score, isPassed, licenseType, totalQuestions);

      // Exit fullscreen safely
      try {
        if (document && document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen error:', err);
      }
      
      // Small delay to ensure fullscreen exit
      setTimeout(() => {
        nav(`/exam/result/${sid}`);
      }, 100);

    } catch (e) {
      console.error('Submit error:', e.response?.data || e);
      alert(e.response?.data?.message || 'Không thể nộp bài.');
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [session, submitting, nav, questions.length]);

  const confirmSubmit = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0 && !window.confirm(
      `Còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
    )) return;
    doSubmit();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (step === 'exam') {
        try {
          if (document && document.fullscreenElement) {
            document.exitFullscreen();
          }
        } catch (err) {
          console.warn('Cleanup exit fullscreen error:', err);
        }
      }
    };
  }, [step]);

  // ─────────────────────────────────────────────────────────
  // SETUP SCREEN (giữ nguyên)
  // ─────────────────────────────────────────────────────────
  if (step === 'setup') {
    const lt = licenseTypes.find(x => String(x.licenseTypeID) === selLT);

    return (
      <div className="exam-setup">
        <div className="exam-setup-container">

          <div className="setup-left">
            <h1>📝 Đề Thi Thử</h1>
            <p>Chọn hạng bằng và loại đề thi phù hợp với bạn</p>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="setup-section">
              <div className="setup-section-title">1. Chọn hạng bằng</div>
              <div className="lt-grid">
                {licenseTypes.map(lt => (
                  <button
                    key={lt.licenseTypeID}
                    className={`lt-card ${selLT === String(lt.licenseTypeID) ? 'active' : ''}`}
                    onClick={() => setSelLT(String(lt.licenseTypeID))}>
                    <div className="lt-name">Hạng {lt.typeName}</div>
                    <div className="lt-info">
                      {lt.totalQuestions} câu · {Math.round(lt.timeLimit / 60)} phút
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <div className="setup-section-title">2. Loại đề thi</div>
              <div className="mode-list">
                {[
                  { k:'random', icon:'🎲', title:'Ngẫu nhiên',  desc:'Câu hỏi random theo cấu trúc đề' },
                  { k:'sample', icon:'📋', title:'Đề thi mẫu',  desc:'Đề cố định theo số thứ tự'       },
                  { k:'wrong',  icon:'🎯', title:'Ôn câu sai',  desc:'Chỉ những câu bạn đã trả lời sai'},
                ].map(m => (
                  <div
                    key={m.k}
                    className={`mode-card ${mode === m.k ? 'active' : ''}`}
                    onClick={() => { setMode(m.k); setError(''); }}>
                    <div className="mc-icon">{m.icon}</div>
                    <div>
                      <div className="mc-title">{m.title}</div>
                      <div className="mc-desc">{m.desc}</div>
                    </div>
                    <div className={`mc-check ${mode === m.k ? 'on' : ''}`}>
                      {mode === m.k ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {mode === 'sample' && (
              <div className="setup-section">
                <div className="setup-section-title">3. Chọn đề mẫu</div>
                {sampleExams.length > 0 ? (
                  <select
                    className="sample-select"
                    value={selSE}
                    onChange={e => setSelSE(e.target.value)}>
                    {sampleExams.map(s => (
                      <option key={s.sampleExamID} value={s.sampleExamID}>{s.examName}</option>
                    ))}
                  </select>
                ) : (
                  <p className="no-sample">Chưa có đề mẫu cho hạng bằng này.</p>
                )}
              </div>
            )}

            <button
              className="start-btn"
              onClick={startExam}
              disabled={loading || (mode === 'sample' && sampleExams.length === 0)}>
              {loading ? <><Spinner /> Đang tạo đề...</> : '🚀 Bắt đầu thi'}
            </button>
          </div>

          <div className="setup-right">
            {lt && (
              <div className="lt-info-card">
                <div className="lic-card-header">
                  <div className="lic-badge">Hạng {lt.typeName}</div>
                  <span className="lic-info-text">Thông tin đề thi</span>
                </div>
                <div className="lic-stats">
                  <div className="lic-stat">
                    <div className="ls-val">{lt.totalQuestions}</div>
                    <div className="ls-lbl">Câu hỏi</div>
                  </div>
                  <div className="lic-stat">
                    <div className="ls-val">{Math.round(lt.timeLimit / 60)}</div>
                    <div className="ls-lbl">Phút</div>
                  </div>
                  <div className="lic-stat">
                    <div className="ls-val">{lt.passingScore}</div>
                    <div className="ls-lbl">Điểm đạt</div>
                  </div>
                </div>
                {lt.description && (
                  <p className="lic-desc">{lt.description}</p>
                )}
                <div className="lic-tips">
                  <div className="tip-title">⚠️ Lưu ý khi thi</div>
                  <ul>
                    <li>Bài thi ở chế độ <strong>toàn màn hình bắt buộc</strong></li>
                    <li>Không được thoát khỏi chế độ toàn màn hình</li>
                    <li>Không được chuyển tab sang ứng dụng khác</li>
                    <li>Không sử dụng phím tắt (Alt+Tab, Ctrl+W, F5...)</li>
                    <li>Vi phạm 3 lần → bài thi tự động nộp</li>
                    <li>Câu điểm liệt sai → trượt ngay lập tức</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // EXAM SCREEN
  // ─────────────────────────────────────────────────────────
  if (!questions.length) {
    return (
      <div className="loading-fullscreen">
        <Spinner size={40} />
        <p>Đang tải đề thi...</p>
      </div>
    );
  }

  const q = questions[current];
  const answeredCt = Object.keys(answers).length;
  const sel = answers[q?.questionID];

  return (
    <div className="exam-page">
      {/* Fullscreen Prompt Overlay */}
      {showFullscreenPrompt && step === 'exam' && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-modal">
            <div className="fullscreen-icon">🖥️</div>
            <h2>Chế độ thi toàn màn hình</h2>
            <p>Để đảm bảo tính nghiêm túc, bài thi sẽ được thực hiện ở chế độ toàn màn hình.</p>
            <p>Bạn sẽ <strong>không thể thoát</strong> ra ngoài cho đến khi hoàn thành bài thi.</p>
            <button onClick={requestFullscreen}>Vào thi ngay</button>
          </div>
        </div>
      )}

      {/* Warning Overlay */}
      {showWarning && (
        <div className="warning-overlay">
          <div className="warning-modal">
            <div className="warning-icon">⚠️</div>
            <h3>Cảnh báo vi phạm quy chế thi!</h3>
            <p>Bạn đã vi phạm <strong>{Math.min(warningCount, 3)}/3</strong> lần.</p>
            <p>Thêm <strong>{Math.max(0, 3 - warningCount)}</strong> lần nữa bài thi sẽ tự động nộp!</p>
            <div className="warning-progress">
              <div className="warning-progress-bar" style={{ width: `${Math.min((warningCount / 3) * 100, 100)}%` }}></div>
            </div>
            <button onClick={() => setShowWarning(false)}>Tiếp tục</button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="exam-topbar">
        <div className="etb-left">
          <div className="etb-badge">Hạng {session?.licenseTypeName}</div>
          <div className="etb-progress">
            <span className="etb-count">
              {answeredCt}/{questions.length} câu
            </span>
            <div className="etb-bar">
              <div className="etb-fill" style={{ width: `${(answeredCt / questions.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {session?.timeLimitSeconds && (
          <Timer totalSeconds={session.timeLimitSeconds} onTimeUp={doSubmit} />
        )}

        <button
          className="submit-btn"
          onClick={confirmSubmit}
          disabled={submitting}>
          {submitting ? <><Spinner size={16} light /> Đang nộp...</> : '📤 Nộp bài'}
        </button>
      </div>

      <div className="exam-body">

        {/* SIDEBAR */}
        <div className="exam-nav">
          <div className="en-title">Danh sách câu</div>
          <div className="en-grid">
            {questions.map((q2, i) => (
              <button
                key={q2.questionID}
                className={`en-btn ${i === current ? 'current' : ''} ${answers[q2.questionID] ? 'answered' : ''}`}
                onClick={() => setCurrent(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="en-legend">
            <span className="legend-dot answered"></span> Đã trả lời
            <span className="legend-dot current"></span> Đang xem
            <span className="legend-dot unanswered"></span> Chưa trả lời
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="exam-main">
          {q && (
            <div className="exam-question-card">
              <div className="question-header">
                <div className="question-number">
                  Câu {current + 1}/{questions.length}
                </div>
                {q.isCritical && (
                  <div className="critical-badge-large">
                    ⚠️ Câu điểm liệt
                  </div>
                )}
                {q.categoryName && (
                  <div className="category-badge">{q.categoryName}</div>
                )}
              </div>

              <div className="question-content">
                {q.content}
              </div>

              {q.imageURL && (
                <div className="question-image">
                  <img
                    src={q.imageURL.startsWith('images/') ? `/${q.imageURL}` : `/images/${q.imageURL}`}
                    alt="Hình minh họa"
                    onError={(e) => {
                      console.error("Không tìm thấy file ảnh:", q.imageURL);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="answers-list">
                {q.answers?.map((a, ai) => (
                  <div
                    key={a.answerID}
                    className={`answer-item ${sel === a.answerID ? 'selected' : ''}`}
                    onClick={() => pick(q.questionID, a.answerID)}>
                    <div className="answer-marker">
                      {String.fromCharCode(65 + ai)}
                    </div>
                    <div className="answer-text">{a.answerText}</div>
                  </div>
                ))}
              </div>

              <div className="question-navigation">
                <button
                  className="nav-btn prev"
                  onClick={() => setCurrent(c => c - 1)}
                  disabled={current === 0}>
                  ← Câu trước
                </button>

                {current < questions.length - 1 ? (
                  <button
                    className="nav-btn next"
                    onClick={() => setCurrent(c => c + 1)}>
                    Câu tiếp theo →
                  </button>
                ) : (
                  <button
                    className="nav-btn submit"
                    onClick={confirmSubmit}
                    disabled={submitting}>
                    📤 Nộp bài
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────
function Spinner({ size = 20, light = false }) {
  return (
    <div className={`spinner ${light ? 'spinner-light' : ''}`} style={{ width: size, height: size }} />
  );
}