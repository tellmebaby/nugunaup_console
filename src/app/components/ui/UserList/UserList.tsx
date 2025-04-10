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

  // Function to handle sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Same field - toggle direction
      if (sortDirection === 'DESC') {
        setSortDirection('ASC');
      } else if (sortDirection === 'ASC') {
        // Reset sorting
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // New field - set to DESC
      setSortField(field);
      setSortDirection('DESC');
    }
    
    // Reset offset and reload data with new sort
    setOffset(0);
    fetchUsers(searchTerm, true);
  };

  // Function to build the sort query string
  const buildSortQueryString = () => {
    if (!sortField || !sortDirection) return '';
    return `&order_by=${sortField}&order_direction=${sortDirection}`;
  };

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

  // Search event listener
  useEffect(() => {
    const handleSearch = (event: CustomEvent<string>) => {
      const searchTerm = event.detail;
      setSearchTerm(searchTerm);
      setOffset(0); // Reset offset for new search
      fetchUsers(searchTerm, true);
    };

    window.addEventListener('search-users' as any, handleSearch as any);

    return () => {
      window.removeEventListener('search-users' as any, handleSearch as any);
    };
  }, [sortField, sortDirection]); // Added sort as dependency to include current sort in searches

  // Re-fetch when sort changes
  useEffect(() => {
    if (searchTerm) {
      setOffset(0);
      fetchUsers(searchTerm, true);
    }
  }, [sortField, sortDirection]);

  // Initial search if initialSearchTerm is provided
  useEffect(() => {
    if (initialSearchTerm) {
      fetchUsers(initialSearchTerm, true);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    const handleDisplayUsers = (event: CustomEvent<User[]>) => {
      const users = event.detail;
      setUsers(users.map(user => ({
        ...user,
        selected: false
      })));
      setOffset(0);
      setTotalCount(users.length);
    };
  
    window.addEventListener('display-users' as any, handleDisplayUsers as any);
  
    return () => {
      window.removeEventListener('display-users' as any, handleDisplayUsers as any);
    };
  }, []);

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
  const handleAddMembersToNote = async () => {
    const selectedUsers = users.filter(user => user.selected);
    if (selectedUsers.length === 0) return;

    try {
      // 선택된 사용자 ID 배열 생성
      const selectedUserIds = selectedUsers.map(u => u.id);

      // 노트에 멤버 추가 이벤트 디스패치
      const event = new CustomEvent('add-members-to-note', { 
        detail: selectedUserIds 
      });
      window.dispatchEvent(event);

      // 사용자 선택 해제
      setUsers(users.map(u => ({ ...u, selected: false })));

    } catch (error) {
      console.error('노트에 멤버 추가 중 오류:', error);
      alert(error instanceof Error ? error.message : '멤버 추가에 실패했습니다.');
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

      {/* Table Footer Component */}
      <UserListFooter
        selectedCount={selectedCount}
        totalCount={totalCount}
        onBulkStatusChange={handleBulkStatusClick}

        onAddMembersToNote={handleAddMembersToNote} // 새로운 prop 추가
        isUpdatingStatus={isUpdatingStatus}
      />

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