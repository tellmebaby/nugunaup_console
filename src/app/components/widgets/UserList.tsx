import React, { useState } from 'react';
import '../../styles/UserListStyle.css';

interface User {
  id: number;
  name: string;
  group: string;
  company: string;
  type: string;
  certDate: string;
  lastActiveDate: string;
  listings: number;
  sales: number;
  messageStatus: 'enabled' | 'disabled';
  selected?: boolean;
}

export default function UserList() {
  // 샘플 데이터
  const [users, setUsers] = useState<User[]>([
    {
      id: 3490,
      name: '홍길동',
      group: '인천',
      company: '길동넥서스',
      type: '대표',
      certDate: '2025.03.15',
      lastActiveDate: '2025.03.20',
      listings: 450,
      sales: 34,
      messageStatus: 'enabled'
    },
    {
      id: 3491,
      name: '김춘삼',
      group: '서울',
      company: '춘삼스',
      type: '대표',
      certDate: '2025.02.05',
      lastActiveDate: '2025.03.21',
      listings: 30,
      sales: 5,
      messageStatus: 'enabled'
    },
    {
      id: 3492,
      name: '고길동',
      group: '부산',
      company: '길동상사',
      type: '딜러',
      certDate: '2024.12.10',
      lastActiveDate: '2025.03.19',
      listings: 540,
      sales: 360,
      messageStatus: 'disabled',
      selected: true
    },
    {
      id: 4890,
      name: '오둘리',
      group: '대구',
      company: '깐따삐야',
      type: '대표',
      certDate: '2025.03.15',
      lastActiveDate: '2025.03.18',
      listings: 3500,
      sales: 560,
      messageStatus: 'enabled'
    }
  ]);

  // 선택된 사용자 수
  const selectedCount = users.filter(user => user.selected).length;
  
  // 전체 검색 결과 수
  const totalCount = users.length;

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
        <div className="user-list-header-cell user-list-type">
          <div className="user-list-header-content">
            <span className="user-list-header-text">유형</span>
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
        {users.map((user, index) => (
          <div key={user.id} className="user-list-row">
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
                <span className="user-list-cell-text">{user.name}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-group">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.group}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-company">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.company}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-type">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.type}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-cert-date">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.certDate}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-last-date">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.lastActiveDate}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-listings">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.listings}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-sales">
              <div className="user-list-cell-content">
                <span className="user-list-cell-text">{user.sales}</span>
              </div>
            </div>
            <div className="user-list-cell user-list-status">
              <div className={`user-list-cell-content ${user.messageStatus === 'enabled' ? 'user-list-status-enabled' : 'user-list-status-disabled'}`}>
                <span className="user-list-cell-text">{user.messageStatus === 'enabled' ? '가능' : '불가'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 테이블 푸터 */}
      <div className="user-list-footer">
        <div className="user-list-footer-item user-list-footer-selected">
          <span className="user-list-footer-text">{selectedCount} Selected</span>
        </div>
        <div className="user-list-footer-item user-list-footer-searching">
          <span className="user-list-footer-text">{totalCount} Searching</span>
        </div>
      </div>
    </div>
  );
}