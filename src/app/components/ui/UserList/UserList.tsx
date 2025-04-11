"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import SubscriptionModal from '../../ui/SubscriptionModal';
import UserListHeader from './UserListHeader';
import UserListRow from './UserListRow';
import UserListFooter from './UserListFooter';
import { User, UserListProps, SortField, SortDirection } from './types';
import './styles.css';

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
  
  // Add sorting state - Default to sorting by ID descending
  const [sortField, setSortField] = useState<SortField | null>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');
  
  // Subscription status change modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [targetUserStatus, setTargetUserStatus] = useState<'Y' | 'N'>('N');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // UserList.tsx에 데이터 소스 상태 추가
  const [dataSource, setDataSource] = useState<'search' | 'members'>('search');

  // 정렬 필요 여부를 나타내는 새로운 상태 추가
  const [needsLocalSort, setNeedsLocalSort] = useState<boolean>(false);

  // 검색 API 호출 필요 여부를 나타내는 상태 추가
const [needsSearchFetch, setNeedsSearchFetch] = useState<boolean>(false);


 // Function to fetch users based on search term and sort
 const fetchUsers = async (searchName: string, resetData: boolean = true) => {
  if (!searchName) return;

  try {
    setIsLoading(true);
    
    const currentOffset = resetData ? 0 : offset;
    
    // Build the sort query string
    const sortQueryString = buildSortQueryString();
    
    const url = `/api/users/search?real_name=${encodeURIComponent(searchName)}&limit=${limit}&offset=${currentOffset}${sortQueryString}`;
    
    console.log('Fetching users with URL:', url);
    
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

      // Update total count
      if (responseData.data.total) {
        setTotalCount(responseData.data.total);
      }

      // Replace or add data
      if (resetData) {
        setUsers(transformedUsers);
        setOffset(limit); // Prepare for next page
      } else {
        // 중복 항목 필터링 로직 추가
        setUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUniqueUsers = transformedUsers.filter(u => !existingIds.has(u.id));
          console.log(`Filtered out ${transformedUsers.length - newUniqueUsers.length} duplicate users`);
          return [...prev, ...newUniqueUsers];
        });
        setOffset(currentOffset + limit); // Prepare for next page
      }

      // Check if there's more data to load
      const nextOffset = resetData ? limit : currentOffset + limit;
      setHasMore(nextOffset < responseData.data.total);
    } else {
      // No search results
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

// handleSort를 일반 함수로 선언
function handleSort(field: SortField) {
  console.log('정렬 요청:', field, '데이터 소스:', dataSource);
  
  // 이전 정렬 상태 저장
  const prevSortField = sortField;
  const prevSortDirection = sortDirection;
  
  if (sortField === field) {
    // 같은 필드 - 방향 전환
    if (sortDirection === 'DESC') {
      setSortDirection('ASC');
    } else if (sortDirection === 'ASC') {
      // 정렬 초기화
      setSortField(null);
      setSortDirection(null);
      // sortField가 null이 되면 아래 로직 실행하지 않음
      if (dataSource === 'search') {
        setNeedsSearchFetch(true);
      }
      return;
    }
  } else {
    // 새 필드 - DESC로 설정
    setSortField(field);
    setSortDirection('DESC');
  }
  
  // 정렬 상태가 실제로 변경됐는지 확인
  const sortChanged = prevSortField !== field || 
    (prevSortField === field && prevSortDirection !== 
      (sortDirection === 'DESC' ? 'ASC' : 'DESC'));
  
  // dataSource에 따라 다른 정렬 로직 적용
  if (dataSource === 'search' && sortChanged) {
    console.log('API를 통한 검색 결과 정렬 트리거');
    setNeedsSearchFetch(true);
  } else if (dataSource === 'members') {
    console.log('로컬에서 멤버 데이터 정렬 트리거');
    // 정렬 필요 상태 활성화
    setNeedsLocalSort(true);
  }
}

// sortUsersLocally 함수 - 직접 호출하지 않고 useEffect에서만 사용
const sortUsersLocally = useCallback(() => {
  if (!sortField) return; // 정렬 필드가 없으면 실행하지 않음
  
  console.log('로컬 정렬 실행:', sortField, sortDirection);
  
  const sortedUsers = [...users].sort((a, b) => {
    // null 값 처리
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // 문자열 변환 및 비교
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    
    // 정렬 방향에 따라 비교
    if (sortDirection === 'ASC') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    }
  });
  
  console.log('정렬된 사용자 데이터:', sortedUsers);
  setUsers(sortedUsers);
  // 정렬 완료 후 정렬 필요 상태 비활성화
  setNeedsLocalSort(false);
}, [users, sortField, sortDirection]);

  // Function to build the sort query string
  const buildSortQueryString = () => {
    if (!sortField || !sortDirection) return '';
    return `&order_by=${sortField}&order_direction=${sortDirection}`;
  };

 

  // Load more function
  const loadMore = () => {
    if (isLoading || !hasMore || !searchTerm) return;
    fetchUsers(searchTerm, false);
  };

  // Infinite scroll implementation
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

  // useEffect 수정 - 정렬 필요 상태에 의존
  useEffect(() => {
    if (needsLocalSort && dataSource === 'members') {
      console.log('정렬 필요 상태에 따른 로컬 정렬 실행');
      sortUsersLocally();
    }
  }, [needsLocalSort, dataSource, sortUsersLocally]);
    
  // search-users 이벤트 핸들러 수정
  useEffect(() => {
    const handleSearch = (event: CustomEvent<string>) => {
      const searchTerm = event.detail;
      console.log('검색 이벤트 수신:', searchTerm);
      
      // 검색 모드로 전환
      setDataSource('search');
      setSearchTerm(searchTerm);
      setOffset(0);
      
      // 즉시 검색 API 호출을 위해 needsSearchFetch도 설정
      setNeedsSearchFetch(true);
      
      // fetchUsers를 직접 호출하지 않고, useEffect에서 처리하도록 함
    };
    
    window.addEventListener('search-users' as any, handleSearch as any);
    
    return () => {
      window.removeEventListener('search-users' as any, handleSearch as any);
    };
  }, []);  // 의존성 배열을 비워 최초 1회만 실행되도록 함

  // Re-fetch when search needs update
  useEffect(() => {
    if (needsSearchFetch && dataSource === 'search' && searchTerm) {
      console.log('검색 필요 상태에 따른 API 호출');
      setOffset(0);
      fetchUsers(searchTerm, true);
      // API 호출 후 상태 초기화
      setNeedsSearchFetch(false);
    }
  }, [needsSearchFetch, dataSource, searchTerm, setOffset, fetchUsers]);

  // Initial search if initialSearchTerm is provided
  useEffect(() => {
    if (initialSearchTerm) {
      fetchUsers(initialSearchTerm, true);
    }
  }, [initialSearchTerm]);

  // UserList.tsx 내부 - useEffect 추가
  useEffect(() => {
    // 멤버 표시 이벤트 처리
    const handleDisplayUsers = (event: CustomEvent<any>) => {
      console.log('display-users 이벤트 받음:', event.detail);

      // 데이터 소스를 즉시 'members'로 설정
      setDataSource('members');
      console.log('dataSource를 members로 설정했습니다!');
      
      // API 응답 구조 확인
      const responseData = event.detail;
      
      // users 배열이 어디에 있는지 확인
      let memberData: any[] = [];
      
      if (responseData.data && responseData.data.users) {
        // {data: {users: []}} 구조인 경우
        memberData = responseData.data.users;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // {data: []} 구조인 경우
        memberData = responseData.data;
      } else if (Array.isArray(responseData)) {
        // 직접 배열이 전달된 경우
        memberData = responseData;
      }
      
      console.log('처리할 멤버 데이터:', memberData);
      
      if (Array.isArray(memberData) && memberData.length > 0) {
        // API 응답을 User 인터페이스에 맞게 변환
        const transformedUsers: User[] = memberData.map((apiUser: any) => ({
          id: apiUser.id,
          real_name: apiUser.real_name || apiUser.username || '이름 없음',
          member_type: apiUser.member_type || '',
          company_name: apiUser.company_name || '',
          last_modified: apiUser.last_modified || null,
          verified_date: apiUser.verified_date || null,
          entry_count: apiUser.entry_count || 0,
          sold_count: apiUser.sold_count || 0,
          is_received: apiUser.is_received || 'N',
          status: apiUser.is_received === 'Y' ? 'enabled' : 'disabled',
          selected: false
        }));
  
        console.log('변환된 사용자 데이터:', transformedUsers);
        
        // 한 번에 상태 업데이트
        setUsers(transformedUsers);
        setTotalCount(transformedUsers.length);
        setHasMore(false);
        setSearchTerm('태그 멤버');
        setDataSource('members');
      } else {
        console.error('멤버 데이터를 찾을 수 없거나 빈 배열입니다:', responseData);
      }
    };
  
    window.addEventListener('display-users' as any, handleDisplayUsers as any);
  
    return () => {
      window.removeEventListener('display-users' as any, handleDisplayUsers as any);
    };
  }, [setUsers, setTotalCount, setSearchTerm, setDataSource, setHasMore]); // 의존성 추가


  useEffect(() => {
    // "태그 멤버" 검색어가 감지되면 자동으로 members 모드로 전환
    if (searchTerm === '태그 멤버') {
      console.log('태그 멤버 검색어 감지, members 모드로 전환');
      setDataSource('members');
    }
  }, [searchTerm]);

  
  // Selected users count
  const selectedCount = users.filter(user => user.selected).length;

  // Toggle checkbox handler
  const toggleSelect = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, selected: !user.selected } : user
    ));
  };

  // Toggle select all handler
  const toggleSelectAll = () => {
    const allSelected = users.every(user => user.selected);
    setUsers(users.map(user => ({ ...user, selected: !allSelected })));
  };

  // Status click handler
  const handleStatusClick = (userId: number, currentStatus: 'Y' | 'N') => {
    setTargetUserId(userId);
    setTargetUserStatus(currentStatus);
    setIsModalOpen(true);
  };

  // 행 클릭 핸들러
  const handleRowClick = (userId: number) => {
    console.log('행 클릭 - 사용자 ID:', userId);
    
    // 사용자 상세 정보 이벤트 발생
    try {
      const selectUserEvent = new CustomEvent('select-user', { 
        detail: userId,
        bubbles: true,
        cancelable: true
      });
      const dispatched = window.dispatchEvent(selectUserEvent);
      console.log('사용자 선택 이벤트 발생 성공:', userId, '이벤트 전파됨:', dispatched);
    } catch (error) {
      console.error('이벤트 발생 중 오류:', error);
    }
  };
  

  // Bulk status change handler
  const handleBulkStatusClick = () => {
    const selectedUsers = users.filter(user => user.selected);
    if (selectedUsers.length === 0) return;
    
    // When multiple users are selected, use the first user's status to determine the opposite
    const firstUserStatus = selectedUsers[0].is_received;
    setTargetUserId(null); // null means multiple user mode
    setTargetUserStatus(firstUserStatus);
    setIsModalOpen(true);
  };

  // Modal confirm handler
  const handleModalConfirm = async (note: string) => {
    if (!user?.id) {
      console.error('No logged in user information');
      return;
    }
    
    setIsUpdatingStatus(true);
    
    try {
      // Handle single user
      if (targetUserId) {
        await updateSingleUserStatus(targetUserId, note);
      } 
      // Handle multiple users
      else {
        await updateMultipleUserStatus(note);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error changing subscription status:', error);
      alert('An error occurred while changing subscription status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Single user status update
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
      throw new Error(errorData.message || 'Failed to change subscription status');
    }

    const responseData = await response.json();

    // Update UI with the changed status
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

  // Multiple user status update
  const updateMultipleUserStatus = async (note: string) => {
    const selectedUserIds = users.filter(u => u.selected).map(u => u.id);
    
    if (selectedUserIds.length === 0) {
      throw new Error('No users selected');
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
      throw new Error(errorData.message || 'Failed to change bulk subscription status');
    }

    const responseData = await response.json();

    // Update UI with changed statuses (only successful ones)
    const successUserIds = responseData.data.results.success.map((item: any) => item.user_id);
    
    setUsers(users.map(u => {
      if (successUserIds.includes(u.id)) {
        const newStatus = u.is_received === 'Y' ? 'N' : 'Y';
        return {
          ...u, 
          is_received: newStatus,
          status: newStatus === 'Y' ? 'enabled' : 'disabled',
          selected: false // Deselect
        };
      }
      return u;
    }));
  };

  // 기존 컴포넌트 내부에 새로운 메서드 추가
 // UserList.tsx에서 handleAddMembersToNote 함수 수정
const handleAddMembersToNote = async () => {
  const selectedUsers = users.filter(user => user.selected);
  if (selectedUsers.length === 0) return;

  try {
    // 중복 요청 방지를 위한 상태 확인
    if (isUpdatingStatus) {
      console.log('이미 요청 처리 중입니다. 무시합니다.');
      return;
    }

    // 진행 상태 설정
    setIsUpdatingStatus(true);

    // 선택된 사용자 ID 배열 생성
    const selectedUserIds = selectedUsers.map(u => u.id);
    console.log('노트에 추가할 선택된 사용자 IDs:', selectedUserIds);

    // 노트에 멤버 추가 이벤트 디스패치 - 한 번만 발생하도록 함
    const event = new CustomEvent('add-members-to-note', { 
      detail: selectedUserIds 
    });
    
    // 이벤트 디스패치 후 바로 사용자 선택 해제
    window.dispatchEvent(event);
    setUsers(users.map(u => ({ ...u, selected: false })));

    // 상태 업데이트 지연 (사용자에게 시각적 피드백)
    setTimeout(() => {
      setIsUpdatingStatus(false);
    }, 1500);

  } catch (error) {
    console.error('노트에 멤버 추가 중 오류:', error);
    alert(error instanceof Error ? error.message : '멤버 추가에 실패했습니다.');
    setIsUpdatingStatus(false);
  }
};

    // 노트에서 멤버 삭제 메서드
    const handleRemoveMembersFromNote = async () => {
      const selectedUsers = users.filter(user => user.selected);
      if (selectedUsers.length === 0) return;
  
      try {
        // 삭제할 사용자 확인
        if (!confirm(`선택한 ${selectedUsers.length}명의 사용자를 노트에서 삭제하시겠습니까?`)) {
          return;
        }
        
        // 선택된 사용자 ID 배열 생성
        const selectedUserIds = selectedUsers.map(u => u.id);
  
        // 노트에서 멤버 삭제 이벤트 디스패치
        const event = new CustomEvent('remove-members-from-note', { 
          detail: selectedUserIds 
        });
        window.dispatchEvent(event);
  
        // UI에서 즉시 삭제된 사용자 제거
        setUsers(users.filter(user => !user.selected));
        setTotalCount(prev => prev - selectedUsers.length);
  
      } catch (error) {
        console.error('노트에서 멤버 삭제 중 오류:', error);
        alert(error instanceof Error ? error.message : '멤버 삭제에 실패했습니다.');
      }
    };


  return (
    <div className="user-list-container">
      {/* Table Header Component */}
      <UserListHeader
        onSelectAll={toggleSelectAll}
        allSelected={users.length > 0 && users.every(user => user.selected)}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Table Body */}
      <div className="user-list-body">
        {users.length > 0 ? (
          users.map((user, index) => {
            // Connect ref to last item (for infinite scroll)
            const isLastItem = index === users.length - 1;
            return (
              <UserListRow
              key={user.id}
              user={user}
              onToggleSelect={toggleSelect}
              onStatusClick={handleStatusClick}
              onRowClick={handleRowClick} // 행 클릭 핸들러 함수 전달
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
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="user-list-loading">데이터 로딩 중...</div>
        )}
        
        {/* Load more button (used with infinite scroll) */}
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

      {/* 검색어에 따라 다른 Footer 렌더링 */}
      {searchTerm === '태그 멤버' ? (
        <UserListFooter
          selectedCount={selectedCount}
          totalCount={totalCount}
          onBulkStatusChange={handleBulkStatusClick}
          isNoteMemberView={true} // 강제로 true로 설정
          onRemoveMembersFromNote={handleRemoveMembersFromNote}
          isUpdatingStatus={isUpdatingStatus}
        />
      ) : (
        <UserListFooter
          selectedCount={selectedCount}
          totalCount={totalCount}
          onBulkStatusChange={handleBulkStatusClick}
          isNoteMemberView={false}
          onAddMembersToNote={handleAddMembersToNote}
          isUpdatingStatus={isUpdatingStatus}
        />
      )}

      {/* Subscription Status Change Modal */}
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