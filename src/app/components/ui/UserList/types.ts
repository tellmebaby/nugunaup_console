export interface User {
  id: number;
  real_name: string;
  nickname: string; // 유형 필드 추가
  member_type: string;
  company_name: string;
  last_modified: string | null;
  verified_date: string | null;
  entry_count: number;
  sold_count: number;
  is_received: 'Y' | 'N';
  status?: 'enabled' | 'disabled';
  selected?: boolean;
  phone?: string; // 전화번호 필드 추가
}

export interface UserListProps {
  searchTerm?: string;
  onSearch?: (term: string) => void;
}

// Sorting-related types
export type SortField = 'id' | 'real_name' | 'nickname' |'member_type' | 'company_name' | 
  'verified_date' | 'last_modified' | 'entry_count' | 'sold_count' | 'is_received';

export type SortDirection = 'ASC' | 'DESC' | null;