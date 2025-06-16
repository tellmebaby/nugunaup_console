import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Edit3, Save, X, Car, Calendar, DollarSign, FileText } from 'lucide-react';

const CarNoteWidget = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  
  const observer = useRef();
  const lastCarElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCars();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // 차량 목록 로드
  const loadCars = async (newOffset = 0, isLoadMore = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/action-car-notes?limit=${limit}&offset=${newOffset}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        const newCars = result.data.cars;
        
        if (isLoadMore) {
          setCars(prev => [...prev, ...newCars]);
        } else {
          setCars(newCars);
        }
        
        setHasMore(newCars.length === limit);
        setOffset(newOffset + limit);
      } else {
        console.error('차량 목록 로드 실패:', result.message);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCars = () => {
    loadCars(offset, true);
  };

  // 초기 로드
  useEffect(() => {
    loadCars();
  }, []);

  // 노트 편집 시작
  const startEditNote = (car) => {
    setEditingNote(car.ac_no);
    setNoteContent(car.note_data.note || '');
  };

  // 노트 편집 취소
  const cancelEdit = () => {
    setEditingNote(null);
    setNoteContent('');
  };

  // 노트 저장
  const saveNote = async (acNo) => {
    if (saving) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/action-car-notes/${acNo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: noteContent })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        // 로컬 상태 업데이트
        setCars(prev => prev.map(car => 
          car.ac_no === acNo 
            ? { ...car, note_data: result.data.note_data }
            : car
        ));
        setEditingNote(null);
        setNoteContent('');
      } else {
        alert('노트 저장에 실패했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('노트 저장 오류:', error);
      alert('노트 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 금액 포맷팅
  const formatPrice = (price) => {
    if (!price) return '0원';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="car-note-widget-container">
      <div className="car-note-widget-title">
        <Car className="w-6 h-6 text-blue-600" />
        차량 노트
      </div>
      <p className="car-note-widget-description">사고차경공매 차량 목록 및 노트 관리</p>

      <div className="space-y-4">
        {cars.map((car, index) => (
          <div
            key={car.ac_no}
            ref={index === cars.length - 1 ? lastCarElementRef : null}
            className="car-note-item"
          >
            {/* 차량 기본 정보 */}
            <div className="car-note-header">
              <div className="car-note-car-info">
                <h3 className="car-note-car-name">
                  {car.ac_car_name}
                </h3>
                <p className="car-note-car-number">차량번호: {car.ac_car_number}</p>
              </div>
              <div className="car-note-details">
                <div className="car-note-price">
                  <DollarSign className="w-4 h-4" />
                  <span>최고가: {formatPrice(car.max_bid_price)}</span>
                </div>
                <div className="car-note-date">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(car.ac_reg_date)}</span>
                </div>
              </div>
            </div>

            {/* 노트 섹션 */}
            <div className="car-note-section">
              <div className="car-note-section-header">
                <div className="car-note-section-title">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>노트</span>
                </div>
                {editingNote !== car.ac_no && (
                  <button
                    onClick={() => startEditNote(car)}
                    className="car-note-edit-btn"
                  >
                    <Edit3 className="w-3 h-3" />
                    편집
                  </button>
                )}
              </div>

              {editingNote === car.ac_no ? (
                <div className="space-y-3">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="노트를 입력하세요..."
                    className="car-note-textarea"
                    rows={4}
                  />
                  <div className="car-note-actions">
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="car-note-btn car-note-btn-cancel"
                    >
                      <X className="w-3 h-3" />
                      취소
                    </button>
                    <button
                      onClick={() => saveNote(car.ac_no)}
                      disabled={saving}
                      className="car-note-btn car-note-btn-save"
                    >
                      <Save className="w-3 h-3" />
                      {saving ? '저장중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="car-note-content">
                  {car.note_data.note ? (
                    <div>
                      <p className="car-note-text">
                        {car.note_data.note}
                      </p>
                      {car.note_data.updated_at && (
                        <p className="car-note-timestamp">
                          수정: {formatDate(car.note_data.updated_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="car-note-empty">노트가 없습니다. 편집 버튼을 클릭하여 노트를 추가하세요.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="car-note-loading">
          <div className="car-note-loading-spinner"></div>
        </div>
      )}

      {/* 더 이상 데이터가 없을 때 */}
      {!hasMore && cars.length > 0 && (
        <div className="car-note-end-message">
          모든 차량을 확인했습니다.
        </div>
      )}

      {/* 데이터가 없을 때 */}
      {!loading && cars.length === 0 && (
        <div className="car-note-no-data">
          <Car className="car-note-no-data-icon" />
          <p>등록된 사고차가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default CarNoteWidget;