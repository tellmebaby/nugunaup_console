"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import SubscriptionModal from '../ui/SubscriptionModal';
import '../../styles/UserListStyle.css';

interface User {
  id: number;
  real_name: string;
  member_type: string;
  company_name: string;
  last_modified: string | null;
  verified_date: string | null;
  entry_count: number;
  sold_count: number;
  is_received: 'Y' | 'N';
  status?: 'enabled' | 'disabled';
  selected?: boolean;
}

export default function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true); // 더 불러올 데이터가 있는지 여부
  const [offset, setOffset] = useState<number>(0); // 페이징 오프셋
  const [limit] = useState<number>(20); // 한 번에 불러올 데이터 수
  const [totalCount, setTotalCount] = useState<number>(0); // 전체 검색 결과 수
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null); // 무한 스크롤용 참조
  
  // 구독 상태 변경 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [targetUserStatus, setTargetUserStatus] = useState<'Y' | 'N'>('N');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // 컴포넌트 마운트 시 초기화 작업
  useEffect(() => {
    console.log('UserList 컴포넌트 마운트됨');
  }, []);

  // Function to fetch users based on search term
  const fetchUsers = async (searchName: string, resetData: boolean = true) => {
    if (!searchName) return;

    try {
      setIsLoading(true);
      const currentOffset = resetData ? 0 : offset;
      
      const url = `/api/users/search?real_name=${encodeURIComponent(searchName)}&limit=${limit}&offset=${currentOffset}`;
      console.log('요청 URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Transform API data to match User interface
      if (responseData.status === 'success' && responseData.data.users) {
        const transformedUsers: User[] = responseData.data.users.map((apiUser: any) => ({
          id: apiUser.id,
          real_name: apiUser.real_name,
          member_type: apiUser.member_type,
          company_name: apiUser.company_name,
          last_modified: apiUser.last_modified,
          verified_date: apiUser.verified_date,
          entry_count: apiUser.entry_count || 0,
          sold_count: apiUser.sold_count || 0,
          is_received: apiUser.is_received,
          status: apiUser.is_received === 'Y' ? 'enabled' : 'disabled',
          selected: false
        }));

        // 전체 결과 수 설정 (API에서 제공한다고 가정)
        if (responseData.data.total) {
          setTotalCount(responseData.data.total);
        }

        // 기존 데이터를 교체하거나 추가
        if (resetData) {
          setUsers(transformedUsers);
          setOffset(limit); // 다음 페이지 준비
        } else {
          setUsers(prev => [...prev, ...transformedUsers]);
          setOffset(currentOffset + limit); // 다음 페이지 준비
        }

        // 더 불러올 데이터가 있는지 여부 확인
        const nextOffset = resetData ? limit : currentOffset + limit;
        setHasMore(nextOffset < responseData.data.total);

        console.log('Transformed Users:', transformedUsers);
        console.log('Total Count:', responseData.data.total);
        console.log('Has More:', nextOffset < responseData.data.total);
      } else {
        // 검색 결과가 없을 경우
        if (resetData) {
          setUsers([]);
          setTotalCount(0);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (resetData) {
        setUsers([]);
        setTotalCount(0);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 더 불러오기 함수
  const loadMore = () => {
    if (isLoading || !hasMore || !searchTerm) return;
    console.log('더 불러오기 실행:', offset);
    fetchUsers(searchTerm, false);
  };

  // 무한 스크롤 구현
  const lastUserElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      }, { threshold: 0.5 });
      
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, searchTerm]
  );

  // Add this useEffect to listen for search events
  useEffect(() => {
    const handleSearch = (event: CustomEvent<string>) => {
      const searchTerm = event.detail;
      setSearchTerm(searchTerm);
      setOffset(0); // 새 검색에서는 오프셋 초기화
      fetchUsers(searchTerm, true);
    };

    window.addEventListener('search-users' as any, handleSearch as any);

    return () => {
      window.removeEventListener('search-users' as any, handleSearch as any);
    };
  }, []);

  // 선택된 사용자 수
  const selectedCount = users.filter(user => user.selected).length;

  // 체크박스 토글 처리
  const toggleSelect = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, selected: !user.selected } : user
    ));
  };

  // 전체 선택 토글
  const toggleSelectAll = () => {
    const allSelected = users.every(user => user.selected);
    setUsers(users.map(user => ({ ...user, selected: !allSelected })));
  };

  // NULL 값을 대시(-)로 표시하는 함수
  const formatField = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  };

  // 수신상태 클릭 핸들러
  const handleStatusClick = (userId: number, currentStatus: 'Y' | 'N') => {
    setTargetUserId(userId);
    setTargetUserStatus(currentStatus);
    setIsModalOpen(true);
  };

  // 다중 사용자 수신상태 변경 핸들러
  const handleBulkStatusClick = () => {
    const selectedUsers = users.filter(user => user.selected);
    if (selectedUsers.length === 0) return;
    
    // 다중 사용자 선택 시, 첫 번째 사용자의 상태값을 기준으로 반대 상태로 변경
    const firstUserStatus = selectedUsers[0].is_received;
    setTargetUserId(null); // null은 다중 사용자 모드를 의미
    setTargetUserStatus(firstUserStatus);
    setIsModalOpen(true);
  };

  // 모달 확인 처리
  const handleModalConfirm = async (note: string) => {
    if (!user?.id) {
      console.error('현재 로그인한 사용자 정보가 없습니다.');
      return;
    }
    
    setIsUpdatingStatus(true);
    
    try {
      // 단일 사용자 처리
      if (targetUserId) {
        await updateSingleUserStatus(targetUserId, note);
      } 
      // 다중 사용자 처리
      else {
        await updateMultipleUserStatus(note);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('구독 상태 변경 중 오류:', error);
      alert('구독 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 단일 사용자 수신상태 업데이트
  const updateSingleUserStatus = async (userId: number, note: string) => {
    const response = await fetch(`/api/users/toggle-subscription/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        manager_id: user?.id,
        note: note
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '구독 상태 변경에 실패했습니다.');
    }

    const responseData = await response.json();
    console.log('구독 상태 변경 성공:', responseData);

    // 변경된 상태 UI에 반영
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.is_received === 'Y' ? 'N' : 'Y';
        return {
          ...u,
          is_received: newStatus,
          status: newStatus === 'Y' ? 'enabled' : 'disabled'
        };
      }
      return u;
    }));
  };

  // 다중 사용자 수신상태 업데이트
  const updateMultipleUserStatus = async (note: string) => {
    const selectedUserIds = users.filter(u => u.selected).map(u => u.id);
    
    if (selectedUserIds.length === 0) {
      throw new Error('선택된 사용자가 없습니다.');
    }

    const response = await fetch('/api/users/bulk-toggle-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        user_ids: selectedUserIds,
        manager_id: user?.id,
        note: note
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '일괄 구독 상태 변경에 실패했습니다.');
    }

    const responseData = await response.json();
    console.log('일괄 구독 상태 변경 성공:', responseData);

    // 변경된 상태 UI에 반영 (성공한 항목들만)
    const successUserIds = responseData.data.results.success.map((item: any) => item.user_id);
    
    setUsers(users.map(u => {
      if (successUserIds.includes(u.id)) {
        const newStatus = u.is_received === 'Y' ? 'N' : 'Y';
        return {
          ...u, 
          is_received: newStatus,
          status: newStatus === 'Y' ? 'enabled' : 'disabled',
          selected: false // 선택 해제
        };
      }
      return u;
    }));
  };

  return (
    <div className="user-list-container">
      {/* 테이블 헤더 */}
      <div className="user-list-header">
        <div className="user-list-header-cell user-list-checkbox">
          <div 
            className={`user-list-checkbox-control ${users.every(user => user.selected) ? 'user-list-checkbox-checked' : ''}`}
            onClick={toggleSelectAll}
          ></div>
        </div>
        <div className="user-list-header-cell user-list-number">
          <div className="user-list-header-content">
            <span className="user-list-header-text">번호 ▲</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-name">
          <div className="user-list-header-content">
            <span className="user-list-header-text">이름</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-group">
          <div className="user-list-header-content">
            <span className="user-list-header-text">그룹</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-company">
          <div className="user-list-header-content">
            <span className="user-list-header-text">회사명</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-cert-date">
          <div className="user-list-header-content">
            <span className="user-list-header-text">인증일</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-last-date">
          <div className="user-list-header-content">
            <span className="user-list-header-text">최근활동일</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-listings">
          <div className="user-list-header-content">
            <span className="user-list-header-text">출품수</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-sales">
          <div className="user-list-header-content">
            <span className="user-list-header-text">판매수</span>
          </div>
        </div>
        <div className="user-list-header-cell user-list-status">
          <div className="user-list-header-content">
            <span className="user-list-header-text">수신상태</span>
          </div>
        </div>
      </div>

      {/* 테이블 바디 */}
      <div className="user-list-body">
        {users.length > 0 ? (
          users.map((user, index) => {
            // 마지막 아이템에 ref 연결 (무한 스크롤용)
            const isLastItem = index === users.length - 1;
            return (
              <div 
                key={user.id} 
                className="user-list-row"
                ref={isLastItem ? lastUserElementRef : null}
              >
                <div className="user-list-cell user-list-checkbox">
                  <div 
                    className={`user-list-checkbox-control ${user.selected ? 'user-list-checkbox-checked' : ''}`}
                    onClick={() => toggleSelect(user.id)}
                  ></div>
                </div>
                <div className="user-list-cell user-list-number">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">{user.id}</span>
                  </div>
                </div>
                <div className="user-list-cell user-list-name">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">{user.real_name}</span>
                  </div>
                </div>
                <div className="user-list-cell user-list-group">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">{formatField(user.member_type)}</span>
                  </div>
                </div>
                <div className="user-list-cell user-list-company">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">{formatField(user.company_name)}</span>
                  </div>
                </div>
                <div className="user-list-cell user-list-cert-date">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">
                      {user.verified_date ? user.verified_date.split(' ')[0] : '-'}
                    </span>
                  </div>
                </div>
                <div className="user-list-cell user-list-last-date">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">
                      {user.last_modified ? user.last_modified.split(' ')[0] : '-'}
                    </span>
                  </div>
                </div>
                <div className="user-list-cell user-list-listings">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">{formatField(user.entry_count)}</span>
                  </div>
                </div>
                <div className="user-list-cell user-list-sales">
                  <div className="user-list-cell-content">
                    <span className="user-list-cell-text">{formatField(user.sold_count)}</span>
                  </div>
                </div>
                <div 
                  className="user-list-cell user-list-status" 
                  onClick={() => handleStatusClick(user.id, user.is_received)}
                >
                  <div className={`user-list-cell-content ${user.status === 'enabled' ? 'user-list-status-enabled' : 'user-list-status-disabled'}`}>
                    <span className="user-list-cell-text user-list-status-clickable">{user.is_received === 'Y' ? '가능' : '불가'}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : searchTerm ? (
          <div className="user-list-no-data">
            검색 결과가 없습니다
          </div>
        ) : (
          <div className="user-list-no-data">
            검색어를 입력하세요
          </div>
        )}
        
        {/* 로딩 표시기 */}
        {isLoading && (
          <div className="user-list-loading">데이터 로딩 중...</div>
        )}
        
        {/* 더보기 버튼 (무한 스크롤과 함께 사용) */}
        {!isLoading && hasMore && users.length > 0 && (
          <div className="user-list-load-more" ref={loadMoreRef}>
            <button 
              className="user-list-load-more-button"
              onClick={loadMore}
            >
              더보기 ({users.length}/{totalCount})
            </button>
          </div>
        )}
      </div>

      {/* 테이블 푸터 */}
      <div className="user-list-footer">
        {selectedCount > 0 && (
          <button 
            className="user-list-bulk-action-button"
            onClick={handleBulkStatusClick}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? '처리중...' : '수신상태 일괄변경'}
          </button>
        )}
        <div className="user-list-footer-right">
          <span className="user-list-footer-text">{selectedCount} Selected</span>
          <span className="user-list-footer-text">{totalCount} Searching</span>
        </div>
      </div>

      {/* 수신상태 변경 모달 */}
      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          userCount={targetUserId ? 1 : users.filter(u => u.selected).length}
          currentStatus={targetUserStatus}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}