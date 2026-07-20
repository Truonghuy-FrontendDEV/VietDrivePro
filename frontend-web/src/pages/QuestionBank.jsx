import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import './QuestionBank.css';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [licenseTypes, setLicenseTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    licenseTypeId: '',
    categoryId: '',
    search: '',
    page: 1,
    pageSize: 20,
  });

  const [revealed, setRevealed] = useState({});
  const [expandedExplain, setExpandedExplain] = useState({});
  const [studyMode, setStudyMode] = useState('all'); // 'all', 'wrong', 'unanswered'
  const [randomMode, setRandomMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [savedAnswers, setSavedAnswers] = useState({});

  const SAVE_KEY = 'question_bank_progress';

  // ========== THÊM HÀM THÔNG BÁO CHO NAVBAR ==========
  const notifyProgressUpdate = () => {
    // Tạo custom event để Navbar biết có cập nhật
    window.dispatchEvent(new CustomEvent('questionStudied'));
    
    // Cũng dispatch storage event để đảm bảo
    window.dispatchEvent(new StorageEvent('storage', {
      key: SAVE_KEY,
      newValue: localStorage.getItem(SAVE_KEY)
    }));
  };

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedAnswers(parsed);
      setRevealed(parsed);
    }
  }, []);

  useEffect(() => {
    api.get('/license-types').then(r => setLicenseTypes(r.data));
    api.get('/QuestionBank/categories').then(r => setCategories(r.data));
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.licenseTypeId) params.append('licenseTypeId', filters.licenseTypeId);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('pageSize', filters.pageSize);
      const { data } = await api.get(`/QuestionBank?${params}`);
      setQuestions(data.data);
      setTotal(data.total);
      setRandomMode(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));
  const setPage = (p) => setFilters(f => ({ ...f, page: p }));

  const totalPages = Math.ceil(total / filters.pageSize) || 1;

  // ========== SỬA HÀM saveProgress - THÊM THÔNG BÁO ==========
  const saveProgress = (qId, aId) => {
    const newSaved = { ...savedAnswers, [qId]: aId };
    setSavedAnswers(newSaved);
    localStorage.setItem(SAVE_KEY, JSON.stringify(newSaved));
    
    // Thông báo cho Navbar biết có cập nhật
    notifyProgressUpdate();
  };

  const selectAnswer = (qId, aId) => {
    const q = questions.find(q => q.questionID === qId);
    const selectedAnswer = q?.answers.find(a => a.answerID === aId);

    setRevealed(prev => ({ ...prev, [qId]: aId }));

    if (selectedAnswer?.isCorrect) {
      setExpandedExplain(prev => ({ ...prev, [qId]: true }));
      saveProgress(qId, aId);
    } else {
      saveProgress(qId, aId);
    }
  };

  const checkAnswer = (qId) => {
    setExpandedExplain(prev => ({ ...prev, [qId]: true }));
  };

  // ========== SỬA HÀM clearReveal - THÊM THÔNG BÁO ==========
  const clearReveal = (qId) => {
    setRevealed(prev => {
      const n = { ...prev };
      delete n[qId];
      return n;
    });
    setExpandedExplain(prev => {
      const n = { ...prev };
      delete n[qId];
      return n;
    });
    const newSaved = { ...savedAnswers };
    delete newSaved[qId];
    setSavedAnswers(newSaved);
    localStorage.setItem(SAVE_KEY, JSON.stringify(newSaved));
    
    // Thông báo cho Navbar biết có cập nhật
    notifyProgressUpdate();
  };

  const toggleExplain = (qId) => {
    setExpandedExplain(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const getLicenseTypeName = (licenseTypeId) => {
    const lt = licenseTypes.find(l => l.licenseTypeID === licenseTypeId);
    return lt ? lt.typeName : '';
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalQuestions = questions.length;
    const answered = Object.keys(revealed).length;
    let correct = 0;
    let wrong = 0;

    questions.forEach(q => {
      const userAnswer = revealed[q.questionID];
      if (userAnswer) {
        const selected = q.answers.find(a => a.answerID === userAnswer);
        if (selected?.isCorrect) correct++;
        else wrong++;
      }
    });

    return {
      total: totalQuestions,
      answered,
      correct,
      wrong,
      percentAnswered: totalQuestions ? (answered / totalQuestions * 100).toFixed(1) : 0,
      percentCorrect: answered ? (correct / answered * 100).toFixed(1) : 0,
    };
  };

  // Randomize questions
  const randomizeQuestions = useCallback(() => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuestions(shuffled);
    setRandomMode(true);
  }, [questions]);

  const resetOrder = () => {
    fetchQuestions();
  };

  // Filter questions by study mode
  const getFilteredQuestions = () => {
    if (studyMode === 'all') return questions;

    if (studyMode === 'wrong') {
      return questions.filter(q => {
        const userAnswer = revealed[q.questionID];
        if (!userAnswer) return false;
        const selectedAns = q.answers.find(a => a.answerID === userAnswer);
        return selectedAns && !selectedAns.isCorrect;
      });
    }

    if (studyMode === 'unanswered') {
      return questions.filter(q => revealed[q.questionID] === undefined);
    }

    return questions;
  };

  // ========== SỬA HÀM resetAllProgress - THÊM THÔNG BÁO ==========
  const resetAllProgress = () => {
    if (window.confirm('⚠️ Bạn có chắc muốn xóa toàn bộ tiến độ học tập?')) {
      localStorage.removeItem(SAVE_KEY);
      setSavedAnswers({});
      setRevealed({});
      setExpandedExplain({});
      
      // Thông báo cho Navbar biết có cập nhật
      notifyProgressUpdate();
    }
  };

  const displayedQuestions = getFilteredQuestions();
  const stats = calculateStats();

  // ========== THÊM useEffect LẮNG NGHE THAY ĐỔI TỪ TAB KHÁC ==========
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === SAVE_KEY) {
        const newProgress = e.newValue ? JSON.parse(e.newValue) : {};
        setSavedAnswers(newProgress);
        setRevealed(newProgress);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'n' && filters.page < totalPages) {
        setPage(filters.page + 1);
      }
      if (e.altKey && e.key === 'p' && filters.page > 1) {
        setPage(filters.page - 1);
      }
      if (e.altKey && e.key === 'r') {
        randomizeQuestions();
      }
      if (e.altKey && e.key === 's') {
        setShowStats(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [filters.page, totalPages, randomizeQuestions]);

  return (
    <div className="qb-page">
      {/* Hero Section */}
      <div className="qb-hero">
        <div className="container">
          <div className="qb-hero-content">
            <div className="qb-hero-text">
              <div className="hero-badge">📚 Tài liệu ôn thi</div>
              <h1 className="qb-hero-title">
                Ngân hàng 600 câu hỏi
                <span className="hero-highlight"> chuẩn Bộ GTVT</span>
              </h1>
              <p className="qb-hero-desc">
                Ôn luyện với đầy đủ 600 câu hỏi, có giải thích chi tiết và hình ảnh minh họa
              </p>
              <div className="hero-shortcuts">
                <span>⌨️ Phím tắt:</span>
                <kbd>Alt+N</kbd> <span>Next</span>
                <kbd>Alt+P</kbd> <span>Prev</span>
                <kbd>Alt+R</kbd> <span>Random</span>
              </div>
            </div>
            <div className="qb-hero-stats">
              <div className="hero-stat">
                <div className="stat-number">{total}</div>
                <div className="stat-label">Câu hỏi</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">{licenseTypes.length}</div>
                <div className="stat-label">Hạng bằng</div>
              </div>
              <div className="hero-stat">
                <div className="stat-number">{categories.length}</div>
                <div className="stat-label">Chương</div>
              </div>
            </div>
          </div>
        </div>
        <div className="qb-wave">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </div>

      <div className="container">
        {/* Progress Stats Section */}
        {showStats && questions.length > 0 && (
          <div className="stats-section">
            <div className="stats-header">
              <h3 className="stats-title">📊 Tiến độ học tập</h3>
              <button className="stats-close" onClick={() => setShowStats(false)}>×</button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.answered}/{stats.total}</div>
                  <div className="stat-label">Đã làm</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${stats.percentAnswered}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.percentCorrect}%</div>
                  <div className="stat-label">Độ chính xác</div>
                  <div className="progress-bar">
                    <div className="progress-fill correct" style={{ width: `${stats.percentCorrect}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.correct}</div>
                  <div className="stat-label">Đúng</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <div className="stat-value">{stats.wrong}</div>
                  <div className="stat-label">Sai</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study Mode Bar */}
        <div className="study-mode-bar">
          <div className="study-mode-label">🎯 Chế độ học:</div>
          <div className="study-mode-buttons">
            <button
              className={`mode-btn ${studyMode === 'all' ? 'active' : ''}`}
              onClick={() => setStudyMode('all')}
            >
              📚 Tất cả ({questions.length})
            </button>
            <button
              className={`mode-btn ${studyMode === 'wrong' ? 'active' : ''}`}
              onClick={() => setStudyMode('wrong')}
            >
              ❌ Câu sai ({questions.filter(q => {
                const ans = revealed[q.questionID];
                if (!ans) return false;
                const selected = q.answers.find(a => a.answerID === ans);
                return selected && !selected.isCorrect;
              }).length})
            </button>
            <button
              className={`mode-btn ${studyMode === 'unanswered' ? 'active' : ''}`}
              onClick={() => setStudyMode('unanswered')}
            >
              ⏳ Chưa làm ({questions.filter(q => revealed[q.questionID] === undefined).length})
            </button>
          </div>
          <div className="mode-actions">
            <button
              className="random-btn"
              onClick={randomizeQuestions}
              title="Xáo trộn câu hỏi (Alt+R)"
            >
              🎲 Random
            </button>
            {randomMode && (
              <button className="reset-order-btn" onClick={resetOrder}>
                ↩️ Reset
              </button>
            )}
            <button className="reset-progress-btn" onClick={resetAllProgress}>
              🗑️ Xóa tiến độ
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="qb-filter-bar">
          <div className="filter-group">
            <label className="filter-label">
              <span className="label-icon">🚗</span>
              Hạng bằng
            </label>
            <select
              className="filter-select"
              value={filters.licenseTypeId}
              onChange={e => setFilter('licenseTypeId', e.target.value)}
            >
              <option value="">Tất cả hạng bằng</option>
              {licenseTypes.map(lt => (
                <option key={lt.licenseTypeID} value={lt.licenseTypeID}>
                  Hạng {lt.typeName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <span className="label-icon">📖</span>
              Chương
            </label>
            <select
              className="filter-select"
              value={filters.categoryId}
              onChange={e => setFilter('categoryId', e.target.value)}
            >
              <option value="">Tất cả chương</option>
              {categories.map(c => (
                <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
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
              placeholder="Nhập nội dung câu hỏi..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="qb-results-info">
          <div className="results-count">
            <span className="count-number">{displayedQuestions.length}</span>
            <span className="count-label">câu hỏi</span>
            {studyMode !== 'all' && (
              <span className="mode-badge">
                {studyMode === 'wrong' ? 'Chỉ câu sai' : 'Chưa làm'}
              </span>
            )}
            {randomMode && <span className="random-badge">🎲 Đang random</span>}
          </div>
          <div className="results-page">
            Trang {filters.page} / {totalPages || 1}
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải câu hỏi...</p>
          </div>
        ) : (
          <>
            {displayedQuestions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3 className="empty-title">Không tìm thấy câu hỏi</h3>
                <p className="empty-desc">Vui lòng thử lại với bộ lọc khác</p>
              </div>
            ) : (
              <div className="qb-grid">
                {displayedQuestions.map((q, idx) => {
                  const selectedAnswer = revealed[q.questionID];
                  const isRevealed = selectedAnswer !== undefined;
                  const isExplainExpanded = expandedExplain[q.questionID];
                  const isCorrect = isRevealed && q.answers.find(a => a.answerID === selectedAnswer)?.isCorrect;

                  return (
                    <div key={q.questionID} className={`qb-card ${isRevealed ? 'revealed' : ''} ${isCorrect ? 'correct-answered' : ''}`}>
                      {/* Card Header */}
                      <div className="qb-card-header">
                        <div className="question-number">
                          <span className="number-badge">
                            Câu {idx + 1}
                          </span>
                          {q.isCritical && (
                            <span className="critical-badge">
                              ⚠️ Điểm liệt
                            </span>
                          )}
                          {isRevealed && (
                            <span className={`result-badge ${isCorrect ? 'correct-badge' : 'wrong-badge'}`}>
                              {isCorrect ? '✓ Đã đúng' : '✗ Sai'}
                            </span>
                          )}
                        </div>
                        <div className="question-meta">
                          <span className="category-badge">{q.categoryName}</span>
                          <span className="license-badge">Hạng {getLicenseTypeName(q.licenseTypeId)}</span>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="qb-card-content">
                        <div className="question-text">{q.content}</div>

                        {q.imageURL && (
                          <div className="question-image">
                            <img
                              src={`/images/${q.imageURL}`}
                              alt="Hình minh họa"
                              onError={(e) => {
                                if (!e.target.src.includes('retry')) {
                                  e.target.src = `/${q.imageURL}?retry=true`;
                                } else {
                                  e.target.style.display = 'none';
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Answers */}
                      <div className="qb-answers">
                        {q.answers.map(a => {
                          let answerClass = 'answer-item';
                          if (isRevealed) {
                            if (a.isCorrect) answerClass += ' correct';
                            if (a.answerID === selectedAnswer && !a.isCorrect) answerClass += ' wrong';
                          } else {
                            if (a.answerID === selectedAnswer) answerClass += ' selected';
                          }

                          return (
                            <div
                              key={a.answerID}
                              className={answerClass}
                              onClick={() => !isRevealed && selectAnswer(q.questionID, a.answerID)}
                            >
                              <div className="answer-marker">
                                {isRevealed ? (
                                  a.isCorrect ? '✅' : (a.answerID === selectedAnswer ? '❌' : '○')
                                ) : (
                                  a.answerID === selectedAnswer ? '●' : '○'
                                )}
                              </div>
                              <div className="answer-text">{a.answerText}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="qb-actions">
                        {!isRevealed ? (
                          <button
                            className="btn-check"
                            disabled={selectedAnswer === undefined}
                            onClick={() => checkAnswer(q.questionID)}
                          >
                            🔍 Kiểm tra đáp án
                          </button>
                        ) : (
                          <>
                            <button className="btn-retry" onClick={() => clearReveal(q.questionID)}>
                              🔄 Làm lại
                            </button>
                            {q.explanation && (
                              <button className="btn-explain" onClick={() => toggleExplain(q.questionID)}>
                                {isExplainExpanded ? '📖 Ẩn giải thích' : '📖 Xem giải thích'}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Explanation */}
                      {isRevealed && q.explanation && isExplainExpanded && (
                        <div className="qb-explanation">
                          <div className="explanation-icon">💡</div>
                          <div className="explanation-content">
                            <strong>Giải thích:</strong>
                            <p>{q.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && studyMode === 'all' && (
              <div className="pagination-wrapper">
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={filters.page === 1}
                    onClick={() => setPage(1)}
                  >
                    «
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={filters.page === 1}
                    onClick={() => setPage(filters.page - 1)}
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
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    className="pagination-btn"
                    disabled={filters.page === totalPages}
                    onClick={() => setPage(filters.page + 1)}
                  >
                    ›
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={filters.page === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}