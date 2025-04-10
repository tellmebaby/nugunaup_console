"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNote } from '../../context/NoteContext';
import { getAuthHeaders } from '../../utils/auth';
import '../../styles/TodoListStyle.css';

// Todo 항목 인터페이스
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

// 노트 데이터 인터페이스
interface NoteData {
  id: number;
  content: string;
  updated_at: string;
  note1: Record<number, string> | string;
  note2: Record<number, boolean> | string;
  member_ids?: number[] | string | null;
}


export default function TodoListWidget() {
  const { user } = useAuth();
  const { selectedNoteId, selectedTagName } = useNote(); // NoteContext 사용
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 입력 필드 상태
  const [inputValue, setInputValue] = useState('');
  const [isInputExceeded, setIsInputExceeded] = useState(false);
  const [hasNoNotes, setHasNoNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 멤버 관련 상태
  const [noteMemberIds, setNoteMemberIds] = useState<number[]>([]);

  // 입력값이 변경될 때마다 글자 수 체크
  useEffect(() => {
    setIsInputExceeded(inputValue.length > 15);
  }, [inputValue]);

  // 노트 데이터 불러오기
  const fetchNoteData = async (noteId?: number | null) => {
    if (!user || !user.id) {
      setError("사용자 정보를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }
    
    setError(null); // 에러 상태 초기화
    
    // noteId가 제공되지 않았다면 selectedNoteId 사용
    const targetNoteId = noteId !== undefined ? noteId : selectedNoteId;
    
    // 특정 노트 ID가 있는 경우
    if (targetNoteId) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/manager-notes/get/${targetNoteId}`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error(`노트 데이터 조회 실패: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        if (responseData.status === 'success' && responseData.data) {
          processNoteData(responseData.data);
        } else if (responseData.status === 'error') {
          console.error('노트 데이터 조회 오류:', responseData.message);
          setHasNoNotes(true);
        } else {
          setHasNoNotes(true);
        }
      } catch (error) {
        console.error('노트 조회 오류:', error);
        setHasNoNotes(true);
        setError("노트 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // 노트 ID가 없는 경우 기본 최신 진행 중인 노트 조회
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/manager-notes/latest-ongoing?creator_id=${user.id}`, 
          {
            method: 'GET',
            headers: getAuthHeaders()
          }
        );

        // 응답이 없는 경우 처리
        if (!response.ok) {
          console.warn(`최근 노트 조회 실패: ${response.status}`);
          setHasNoNotes(true);
          setNoteData(null);
          setTodos([]);
          setIsLoading(false);
          return;
        }

        let responseData;
        try {
          // 응답 JSON 파싱 시도
          responseData = await response.json();
        } catch (parseError) {
          console.error('응답 파싱 오류:', parseError);
          setHasNoNotes(true);
          setError("서버 응답을 처리할 수 없습니다.");
          setIsLoading(false);
          return;
        }

        // 노트가 없는 경우 정상적으로 처리
        if (responseData.status === 'info' && responseData.message === '게시물이 없습니다.') {
          console.log('사용자에게 노트가 없음');
          setHasNoNotes(true);
          setNoteData(null);
          setTodos([]);
          return;
        }

        // 노트 데이터 처리
        if (responseData.data) {
          processNoteData(responseData.data);
        } else {
          // 노트 자체가 없는 경우
          console.log('노트 데이터가 없음');
          setHasNoNotes(true);
          setNoteData(null);
          setTodos([]);
        }
      } catch (error) {
        console.error('노트 데이터 불러오기 오류:', error);
        setHasNoNotes(true);
        setError("노트 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleViewMembers = async () => {
    if (noteMemberIds.length === 0) return;
  
    try {
      // 벌크 사용자 정보 조회 API 호출
      const response = await fetch('/api/users/bulk-get', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_ids: noteMemberIds
        })
      });
  
      if (!response.ok) {
        throw new Error(`사용자 정보 조회 실패: ${response.status}`);
      }
  
      const responseData = await response.json();
      
      // 응답 데이터 구조 확인을 위한 로그
      console.log('멤버 정보 응답:', responseData);
  
      // 사용자 배열 추출 (responseData 구조에 따라 달라질 수 있음)
      let users = [];
      if (responseData.data && responseData.data.users) {
        users = responseData.data.users;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        users = responseData.data;
      }
  
      console.log('전송할 사용자 데이터:', users);
      
      // 사용자 배열을 직접 이벤트로 전달
      if (users.length > 0) {
        const userListEvent = new CustomEvent('display-users', { 
          detail: users
        });
        window.dispatchEvent(userListEvent);
      } else {
        alert('사용자 정보를 찾을 수 없습니다.');
      }
  
    } catch (error) {
      console.error('멤버 보기 실패:', error);
      alert(error instanceof Error ? error.message : '멤버 정보를 불러오는 데 실패했습니다.');
    }
  };
  
  // 노트 데이터 처리 함수
  const processNoteData = async (fetchedNoteData: NoteData) => {

    // member_ids 파싱 추가
    let parsedMemberIds: number[] = [];
    if (fetchedNoteData.member_ids) {
      try {
        // 문자열로 저장된 경우 파싱
        parsedMemberIds = typeof fetchedNoteData.member_ids === 'string' 
          ? JSON.parse(fetchedNoteData.member_ids) 
          : fetchedNoteData.member_ids;
      } catch (e) {
        console.error('member_ids 파싱 오류:', e);
        parsedMemberIds = [];
      }
    }

    // 멤버 정보 설정
    setNoteMemberIds(parsedMemberIds);

    // 노트 데이터 설정
    setNoteData(fetchedNoteData);
    
    // note1에서 할일 배열 파싱
    let todoItems: TodoItem[] = [];
    
    if (fetchedNoteData.note1) {
      try {
        // 문자열인 경우 파싱 시도
        const parsedData = typeof fetchedNoteData.note1 === 'string' 
          ? JSON.parse(fetchedNoteData.note1) 
          : fetchedNoteData.note1;
        
        console.log('서버에서 받은 note1 파싱 결과:', parsedData);
        
        // 배열 형태인 경우 (새 형식)
        if (Array.isArray(parsedData)) {
          todoItems = parsedData.map(item => ({
            id: parseInt(item.id), 
            text: item.text,
            completed: item.completed
          }));
        } 
        // 객체 형태인 경우 (이전 형식)
        else if (typeof parsedData === 'object') {
          todoItems = Object.entries(parsedData).map(([id, text]) => ({
            id: Number(id),
            text: text as string,
            completed: false // 기본값
          }));
          
          // note2에서 완료 상태 적용
          if (fetchedNoteData.note2 && typeof fetchedNoteData.note2 === 'string') {
            try {
              const completedData = JSON.parse(fetchedNoteData.note2);
              if (typeof completedData === 'object') {
                todoItems = todoItems.map(todo => ({
                  ...todo,
                  completed: completedData[todo.id.toString()] || false
                }));
              }
            } catch (e) {
              console.error('note2 파싱 오류:', e);
            }
          }
        }


      } catch (e) {
        console.error('note1 파싱 오류:', e, fetchedNoteData.note1);
        // 파싱 오류가 발생해도 빈 배열로 처리하여 UI는 정상 표시
        todoItems = [];
      }
    }

    setTodos(todoItems);
    setHasNoNotes(false);
    
    // 디버깅: 노트 데이터 로깅
    console.log('로드된 노트 데이터:', {
      id: fetchedNoteData.id,
      content: fetchedNoteData.content,
      note1: fetchedNoteData.note1,
      note2: fetchedNoteData.note2,
      todoItems
    });
  };


  // 새 노트 생성 함수
  const createNewNote = async () => {
    if (!user || !user.id) return;
    
    try {
      setIsLoading(true);
      
      // 기본 노트 내용 설정
      const noteContent = selectedTagName || "할 일 목록";
      
      // 새 노트 생성 API 호출
      const response = await fetch('/api/manager-notes/create', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creator_id: user.id,
          content: noteContent,
          note1: JSON.stringify([])
        })
      });
      
      if (!response.ok) {
        throw new Error(`노트 생성 실패: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.status === 'success' && responseData.data && responseData.data.id) {
        // 새로 생성된 노트 ID로 데이터 다시 불러오기
        await fetchNoteData(responseData.data.id);
      } else {
        setHasNoNotes(true);
        setError("새 노트를 생성할 수 없습니다.");
      }
    } catch (error) {
      console.error('노트 생성 오류:', error);
      setHasNoNotes(true);
      setError("새 노트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 노트가 변경될 때마다 데이터 다시 불러오기
  useEffect(() => {
    console.log('선택된 노트 ID 변경:', selectedNoteId);
    if (selectedNoteId) {
      fetchNoteData(selectedNoteId);
    } else {
      // 선택된 노트가 없으면 기본 노트 데이터 불러오기
      fetchNoteData(null);
    }
  }, [selectedNoteId, user]);

  // 서버로 노트 데이터 업데이트
  const updateNoteData = async () => {
    if (!noteData || !user) return;
    
    try {
      setIsSaving(true);
      
      // 배열 형태로 변환 (서버 처리가 더 쉬울 수 있음)
      const todoArray = todos.map(todo => ({
        id: todo.id.toString(),
        text: todo.text,
        completed: todo.completed
      }));
      
      console.log('서버에 보낼 할일 배열:', todoArray);
      
      // 업데이트 요청 데이터 - 이중 JSON 문자열화 사용
      const updateData = {
        note1: JSON.stringify(todoArray),
        note2: "[]" // 완료 상태는 배열 내부에 포함되므로 빈 배열로 설정
      };
      
      console.log('노트 업데이트 데이터:', updateData);
      
      // API 호출
      const response = await fetch(`/api/manager-notes/update/${noteData.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`업데이트 실패: ${response.status}, ${errorText}`);
      }
      
      // 응답 데이터 파싱
      const responseText = await response.text();
      console.log('원본 응답 텍스트:', responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
        console.log('노트 업데이트 응답:', responseData);
      } catch (parseError) {
        console.error('응답 파싱 오류:', parseError);
        throw new Error('서버 응답을 파싱할 수 없습니다');
      }
      
      // 성공 시 노트 데이터 업데이트
      if (responseData.status === 'success') {
        // 서버에서 반환한 업데이트된 데이터가 있으면 사용
        if (responseData.data) {
          console.log('서버에서 업데이트된 데이터:', responseData.data);
          
          // 서버에서 받은 note1과 note2를 적용
          setNoteData(responseData.data);
          
          // 전체 노트 데이터 다시 로드
          await fetchNoteData(noteData.id);
        }
      } else {
        console.error('노트 업데이트 실패:', responseData);
        throw new Error(responseData.message || '업데이트에 실패했습니다');
      }
    } catch (error) {
      console.error('노트 업데이트 오류:', error);
      setError("할 일 목록을 저장하는 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 할 일 토글 함수
  const toggleTodo = async (id: number) => {
    // 토글할 할 일 찾기
    const todoToToggle = todos.find(todo => todo.id === id);
    if (!todoToToggle) return;
    
    // 상태 변경
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    // UI 상태 업데이트
    setTodos(updatedTodos);
    
    // 서버에 직접 업데이트
    try {
      // 배열 형태로 변환
      const todoArray = updatedTodos.map(todo => ({
        id: todo.id.toString(),
        text: todo.text,
        completed: todo.completed
      }));
      
      console.log('서버에 보낼 할일 배열 (토글):', todoArray);
      
      // 직접 API 호출
      const updateData = {
        note1: JSON.stringify(todoArray),
        note2: "[]" // 완료 상태는 배열 내부에 포함되므로 빈 배열로 설정
      };
      
      if (!noteData) {
        console.error('노트 데이터가 없습니다');
        return;
      }
      
      const response = await fetch(`/api/manager-notes/update/${noteData.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`할 일 상태 변경 실패: ${response.status}`);
      }
      
      // 응답 확인
      const responseText = await response.text();
      console.log('할 일 상태 변경 응답:', responseText);
      
    } catch (error) {
      console.error('할 일 상태 업데이트 오류:', error);
      // 오류 시 상태 되돌리기
      setTodos(todos);
      setError("할 일 상태를 변경하는 중 오류가 발생했습니다.");
    }
  };

  // 할 일 추가 함수
  const addTodo = async () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput === '' || trimmedInput.length > 15) return;
    
    // 노트가 없는 경우 새 노트 생성
    if (!noteData) {
      await createNewNote();
      if (!noteData) {
        setInputValue(''); // 입력값 초기화
        return; // 노트 생성에 실패한 경우
      }
    }
    
    // 새 ID 생성 (기존 ID 중 가장 큰 값 + 1 또는 1)
    const newTodoId = todos.length > 0 
      ? Math.max(...todos.map(todo => todo.id)) + 1 
      : 1;
    
    const newTodo: TodoItem = {
      id: newTodoId,
      text: inputValue.trim(),
      completed: false
    };
    
    // 기존 todos에 새 할 일 추가
    const updatedTodos = [...todos, newTodo];
    // 상태 업데이트
    setTodos(updatedTodos);
    setInputValue('');
    
    // 서버에 즉시 업데이트 - 위에서 업데이트한 todos 배열 대신 
    // updatedTodos 배열을 직접 사용하여 서버에 저장
    try {
      // 배열 형태로 변환
      const todoArray = updatedTodos.map(todo => ({
        id: todo.id.toString(),
        text: todo.text,
        completed: todo.completed
      }));
      
      console.log('서버에 보낼 할일 배열 (추가):', todoArray);
      
      // 직접 API 호출
      const updateData = {
        note1: JSON.stringify(todoArray),
        note2: "[]" // 완료 상태는 배열 내부에 포함되므로 빈 배열로 설정
      };
      
      if (!noteData) {
        console.error('노트 데이터가 없습니다');
        return;
      }
      
      const response = await fetch(`/api/manager-notes/update/${noteData.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`할 일 추가 실패: ${response.status}`);
      }
      
      // 응답 확인
      const responseText = await response.text();
      console.log('할 일 추가 응답:', responseText);
      
      // 전체 노트 데이터 새로고침
      await fetchNoteData(noteData.id);
      
    } catch (error) {
      console.error('할 일 추가 오류:', error);
      // 오류 시 상태 되돌리기
      setTodos(todos);
      setInputValue(newTodo.text); // 입력값 복원
      setError("할 일을 추가하는 중 오류가 발생했습니다.");
    }
  };

  // 할 일 삭제 함수
  const deleteTodo = async (id: number) => {
    const prevTodos = [...todos]; // 이전 상태 저장
    const updatedTodos = todos.filter(todo => todo.id !== id);
    
    // UI 상태 업데이트
    setTodos(updatedTodos);
    
    // 서버에 직접 업데이트
    try {
      // 배열 형태로 변환
      const todoArray = updatedTodos.map(todo => ({
        id: todo.id.toString(),
        text: todo.text,
        completed: todo.completed
      }));
      
      console.log('서버에 보낼 할일 배열 (삭제):', todoArray);
      
      // 직접 API 호출
      const updateData = {
        note1: JSON.stringify(todoArray),
        note2: "[]" // 완료 상태는 배열 내부에 포함되므로 빈 배열로 설정
      };
      
      if (!noteData) {
        console.error('노트 데이터가 없습니다');
        return;
      }
      
      const response = await fetch(`/api/manager-notes/update/${noteData.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`할 일 삭제 실패: ${response.status}`);
      }
      
      // 응답 확인
      const responseText = await response.text();
      console.log('할 일 삭제 응답:', responseText);
      
    } catch (error) {
      console.error('할 일 삭제 오류:', error);
      // 오류 시 상태 되돌리기
      setTodos(prevTodos);
      setError("할 일을 삭제하는 중 오류가 발생했습니다.");
    }
  };

  // 입력 값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // isInputExceeded 상태는 useEffect에서 업데이트됨
  };

  // 키보드 엔터 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '' && inputValue.length <= 15) {
      addTodo();
    }
  };


  // 기존 컴포넌트 내부에 새로운 메서드 추가
  const addSelectedUsersToNote = async (selectedUserIds: number[]) => {
    if (!noteData || !user) return;

    try {
      // 기존 노트의 member_ids 파싱 (존재하면)
      let existingMemberIds: number[] = [];
      if (noteData.member_ids) {
        try {
          // 문자열로 저장된 경우 파싱
          existingMemberIds = typeof noteData.member_ids === 'string' 
            ? JSON.parse(noteData.member_ids) 
            : noteData.member_ids;
        } catch (e) {
          console.error('기존 member_ids 파싱 오류:', e);
          existingMemberIds = [];
        }
      }

      // 중복 제거 및 새 멤버 추가
      const updatedMemberIds = Array.from(
        new Set([...existingMemberIds, ...selectedUserIds])
      );

      // API 호출 데이터 준비
      const updateData = {
        member_ids: JSON.stringify(updatedMemberIds)
      };

      console.log('업데이트할 멤버 IDs:', updateData);

      // API 호출
      const response = await fetch(`/api/manager-notes/update/${noteData.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`멤버 추가 실패: ${response.status}, ${errorText}`);
      }

      // 성공 시 노트 데이터 다시 불러오기
      await fetchNoteData(noteData.id);

      // 사용자에게 알림
      alert(`${selectedUserIds.length}명의 사용자를 노트에 추가했습니다.`);

    } catch (error) {
      console.error('노트에 멤버 추가 중 오류:', error);
      alert(error instanceof Error ? error.message : '멤버 추가에 실패했습니다.');
    }
  };

  // 외부에서 멤버 추가 기능을 사용할 수 있도록 노출
  useEffect(() => {
    // 멤버 추가 이벤트 리스너 등록
    const handleAddMembersToNote = (event: CustomEvent<number[]>) => {
      const selectedUserIds = event.detail;
      addSelectedUsersToNote(selectedUserIds);
    };

    window.addEventListener('add-members-to-note' as any, handleAddMembersToNote as any);

    // 클린업
    return () => {
      window.removeEventListener('add-members-to-note' as any, handleAddMembersToNote as any);
    };
  }, [noteData, user]);




  // 로딩 상태일 때
  if (isLoading) {
    return (
      <div className="tag-detail-container">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  // 노트가 없을 때
  if (hasNoNotes) {
    return (
      <div className="tag-detail-container">
        <div className="tag-detail-title">
          <span className="tag-name">{selectedTagName || '할 일 목록'}</span>
          <span className="tag-date">{new Date().toISOString().split('T')[0]}</span>
        </div>
        
        <div className="detail-body">
          <div className="no-notes-message">
            {error ? (
              <span className="error-message">{error}</span>
            ) : (
              <>
                <span>{selectedTagName ? `'${selectedTagName}' 태그에 연결된 노트가 없습니다.` : '태그를 생성해주세요'}</span>
                <button 
                  className="create-note-button" 
                  onClick={createNewNote}
                  style={{
                    marginTop: '15px',
                    padding: '8px 12px',
                    border: '1px solid #8E8E8E',
                    borderRadius: '5px',
                    background: '#E8E7E7',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  새 노트 만들기
                </button>
              </>
            )}
          </div>
          
          {/* 새 할 일 입력 */}
          <div className="todo-bottom" style={{ position: 'relative' }}>
            {/* 글자 수 초과 경고 메시지 - 위치 및 스타일 수정 */}
            {isInputExceeded && inputValue.trim().length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: '-22px',
                  left: '0',
                  width: '100%',
                  padding: '3px 5px',
                  backgroundColor: '#FFE5E5',
                  color: '#FF0000',
                  fontSize: '11px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  zIndex: 100,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                15자 이내로 입력해주세요 ({inputValue.length}/15)
              </div>
            )}
            
            <input
              type="text"
              className="todo-input"
              placeholder="할 일을 입력해 주세요..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              ref={inputRef}
              style={{
                border: isInputExceeded ? '1px solid #FF0000' : 'none'
              }}
            />
            <button 
              className="submit-button" 
              onClick={addTodo}
              disabled={inputValue.trim() === '' || inputValue.length > 15}
            >
              <span className="submit-text">입력</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 현재 날짜 포맷팅
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="tag-detail-container">
      {error && (
        <div 
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            padding: '5px',
            backgroundColor: '#FFE5E5',
            color: '#FF0000',
            fontSize: '11px',
            textAlign: 'center',
            zIndex: 101,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </div>
      )}
      
      <div className="tag-detail-title">
        <span className="tag-name">{selectedTagName || noteData?.content || '태스크'}</span>
        <span className="tag-date">{noteData?.updated_at ? noteData.updated_at.split(' ')[0] : formattedDate}</span>
      </div>
      
      <div className="detail-body">
        <div className="detail-head">
          <div className="reg-date">
            {isSaving && <span className="saving-indicator">저장 중...</span>}
          </div>
          <div className="todo-count">
            <span className="todo-count-text">
              {todos.filter(todo => todo.completed).length}/{todos.length}
            </span>
          </div>
        </div>
        
        {/* 할 일 목록 */}
        <div className="todo-list">
          {todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <div 
                className={`check-box ${todo.completed ? 'checked' : ''}`} 
                onClick={() => toggleTodo(todo.id)}
              ></div>
              <div className="todo-description">
                <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                  {todo.text}
                </span>
                <button 
                  className="delete-todo-button" 
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="삭제"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        

        {/* 멤버 정보 영역 */}
        <div className="note-member-info" style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '5px 10px',
          borderTop: '1px solid #E8E7E7'
        }}>
        </div>

        {/* 새 할 일 입력 */}
        <div className="todo-bottom" style={{ position: 'relative' }}>
          {/* 글자 수 초과 경고 메시지 - 위치 및 스타일 수정 */}
          {isInputExceeded && inputValue.trim().length > 0 && (
            <div 
            style={{
              position: 'absolute',
              top: '-22px',
              left: '0',
              width: '100%',
              padding: '3px 5px',
              backgroundColor: '#FFE5E5',
              color: '#FF0000',
              fontSize: '11px',
              borderRadius: '4px',
              textAlign: 'center',
              zIndex: 100,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            15자 이내로 입력해주세요 ({inputValue.length}/15)
          </div>
        )}
        
        <input
          type="text"
          className="todo-input"
          placeholder="할 일을 입력해 주세요..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          style={{
            border: isInputExceeded ? '1px solid #FF0000' : 'none'
          }}
        />
        <button 
          className="submit-button" 
          onClick={addTodo}
          disabled={inputValue.trim() === '' || inputValue.length > 15}
        >
          <span className="submit-text">입력</span>
        </button>
      </div>
      {noteMemberIds.length > 0 && (
        <div className="note-member-info">
          <button 
            className="member-button"
            onClick={handleViewMembers}
          >
            태그 멤버 보기 ({noteMemberIds.length})
          </button>
        </div>
      )}
    </div>
  </div>
);
}