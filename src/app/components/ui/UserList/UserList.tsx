"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import SubscriptionModal from '../../ui/SubscriptionModal';
import UserListHeader from './UserListHeader';
import UserListRow from './UserListRow';
import UserListFooter from './UserListFooter';
import { User, UserListProps } from './types';
import './styles.css'; // 스타일 파일 분리하여 import

const UserList: React.FC<UserListProps> = ({ searchTerm: initialSearchTerm }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // 구독 상태 변경 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [targetUserStatus, setTargetUserStatus] = useState<'Y' | 'N'>('N');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Function to fetch users based on search term
  const fetchUsers = async (searchName: string, resetData: boolean = true) => {
    if (!searchName) return;

    try {
      setIsLoading(true);
      const currentOffset = resetData ? 0 : offset;
      
      const url = `/api/users/search?real_name=${encodeURIComponent(searchName)}&limit=${limit}&offset=${currentOffset}`;
      
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

        // 전체 결과 수 설정
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

  // 검색 이벤트 리스너
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

  // 초기 검색어가 있는 경우 자동 검색
  useEffect(() => {
    if (initialSearchTerm) {
      fetchUsers(initialSearchTerm, true);
    }
  }, [initialSearchTerm]);

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
      {/* 테이블 헤더 컴포넌트 */}
      <UserListHeader
        onSelectAll={toggleSelectAll}
        allSelected={users.length > 0 && users.every(user => user.selected)}
      />

      {/* 테이블 바디 */}
      <div className="user-list-body">
        {users.length > 0 ? (
          users.map((user, index) => {
            // 마지막 아이템에 ref 연결 (무한 스크롤용)
            const isLastItem = index === users.length - 1;
            return (
              <UserListRow
                key={user.id}
                user={user}
                onToggleSelect={toggleSelect}
                onStatusClick={handleStatusClick}
                forwardedRef={isLastItem ? lastUserElementRef : undefined}
              />
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

      {/* 테이블 푸터 컴포넌트 */}
      <UserListFooter
        selectedCount={selectedCount}
        totalCount={totalCount}
        onBulkStatusChange={handleBulkStatusClick}
        isUpdatingStatus={isUpdatingStatus}
      />

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
};

export default UserList;