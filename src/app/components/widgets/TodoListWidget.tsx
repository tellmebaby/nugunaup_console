"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  note1: Record<number, string>;
  note2: Record<number, boolean>;
}

export default function TodoListWidget() {
  const { user } = useAuth();
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [hasNoNotes, setHasNoNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 노트 데이터 불러오기
  const fetchNoteData = async () => {
    if (!user || !user.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/manager-notes/latest-ongoing?creator_id=${user.id}`, 
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      );

      const responseData = await response.json();

      if (responseData.status === 'info' && responseData.message === '진행 중인 게시물이 없습니다.') {
        setHasNoNotes(true);
        setNoteData(null);
        setTodos([]);
        return;
      }

      // 노트 데이터 처리
      if (responseData.data) {
        const fetchedNoteData = responseData.data;
        
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
          }
        }

        setTodos(todoItems);
        setHasNoNotes(false);
        
        // 디버깅: 노트 데이터 로깅
        console.log('로드된 노트 데이터:', {
          id: fetchedNoteData.id,
          note1: fetchedNoteData.note1,
          note2: fetchedNoteData.note2,
          todoItems
        });
      } else {
        // 노트 자체가 없는 경우
        setHasNoNotes(true);
        setNoteData(null);
        setTodos([]);
      }
    } catch (error) {
      console.error('노트 데이터 불러오기 오류:', error);
      setHasNoNotes(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchNoteData();
  }, [user]);

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
          await fetchNoteData();
        }
      } else {
        console.error('노트 업데이트 실패:', responseData);
        throw new Error(responseData.message || '업데이트에 실패했습니다');
      }
    } catch (error) {
      console.error('노트 업데이트 오류:', error);
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
    }
  };

  // 할 일 추가 함수
  const addTodo = async () => {
    if (inputValue.trim() === '') return;
    
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
      await fetchNoteData();
      
    } catch (error) {
      console.error('할 일 추가 오류:', error);
      // 오류 시 상태 되돌리기
      setTodos(todos);
      setInputValue(newTodo.text); // 입력값 복원
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
    }
  };

  // 키보드 엔터 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      addTodo();
    }
  };

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
        <div className="no-notes-message">
          <span>태그를 생성해주세요</span>
        </div>
      </div>
    );
  }

  // 현재 날짜 포맷팅
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="tag-detail-container">
      <div className="tag-detail-title">
        <span className="tag-name">{noteData?.content || '태스크'}</span>
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
        
        {/* 새 할 일 입력 */}
        <div className="todo-bottom">
          <input
            type="text"
            className="todo-input"
            placeholder="할 일을 입력해 주세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="submit-button" onClick={addTodo}>
            <span className="submit-text">입력</span>
          </button>
        </div>
      </div>
    </div>
  );
}