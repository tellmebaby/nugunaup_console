import React, { useState, useEffect } from "react";
import UserDetail from "./UserDetail";

export default function Widget3_2() {
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // 사용자 선택 이벤트 리스너
    useEffect(() => {
        // 이벤트 핸들러 정의
        const handleUserSelect = (event: Event) => {
            const customEvent = event as CustomEvent<number>;
            const userId = customEvent.detail;
            console.log('Widget3-2: 사용자 선택 이벤트 감지:', userId);
            
            // 상태 업데이트
            setSelectedUserId(userId);
        };
      
        // 이벤트 리스너 등록
        console.log('Widget3-2: 이벤트 리스너 등록 중...');
        window.addEventListener('select-user', handleUserSelect);
        console.log('Widget3-2: 이벤트 리스너 등록 완료');
      
        // 컴포넌트 언마운트시 이벤트 리스너 제거
        return () => {
            console.log('Widget3-2: 이벤트 리스너 제거 중...');
            window.removeEventListener('select-user', handleUserSelect);
            console.log('Widget3-2: 이벤트 리스너 제거 완료');
        };
    }, []);

    // 디버깅용 로그
    console.log('Widget3-2 렌더링, 선택된 사용자 ID:', selectedUserId);

    return <UserDetail selectedUserId={selectedUserId} />;
}