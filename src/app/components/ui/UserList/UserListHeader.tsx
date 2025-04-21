import React from 'react';
import { SortField, SortDirection } from './types';

interface UserListHeaderProps {
  onSelectAll: () => void;
  allSelected: boolean;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const UserListHeader: React.FC<UserListHeaderProps> = ({
  onSelectAll,
  allSelected,
  sortField,
  sortDirection,
  onSort
}) => {
  // Helper function to get the sort icon based on sort direction
  const getSortIcon = (field: SortField) => {
    if (sortField !== field || !sortDirection) return '';
    return sortDirection === 'ASC' ? ' ▲' : ' ▼';
  };

  return (
    <div className="user-list-header">
      <div className="user-list-header-cell user-list-checkbox">
        <div 
          className={`user-list-checkbox-control ${allSelected ? 'user-list-checkbox-checked' : ''}`}
          onClick={onSelectAll}
        ></div>
      </div>
      <div 
        className="user-list-header-cell user-list-number"
        onClick={() => onSort('id')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            번호{getSortIcon('id')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-name"
        onClick={() => onSort('real_name')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            이름{getSortIcon('real_name')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-nickname"
        onClick={() => onSort('nickname')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            유형{getSortIcon('nickname')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-group"
        onClick={() => onSort('member_type')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            그룹{getSortIcon('member_type')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-company"
        onClick={() => onSort('company_name')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            회사명{getSortIcon('company_name')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-cert-date"
        onClick={() => onSort('verified_date')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            인증일{getSortIcon('verified_date')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-last-date"
        onClick={() => onSort('last_modified')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            최근활동일{getSortIcon('last_modified')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-listings"
        onClick={() => onSort('entry_count')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            출품수{getSortIcon('entry_count')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-sales"
        onClick={() => onSort('sold_count')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            판매수{getSortIcon('sold_count')}
          </span>
        </div>
      </div>
      <div 
        className="user-list-header-cell user-list-status"
        onClick={() => onSort('is_received')}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-list-header-content">
          <span className="user-list-header-text">
            수신{getSortIcon('is_received')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserListHeader;