"use client";

import React, { useState } from 'react';
import '../../styles/TodoListStyle.css';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoListWidget() {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: 1, text: '회원 데이터 분석', completed: true },
    { id: 2, text: '시스템 보안 점검', completed: false },
    { id: 3, text: '대시보드 레이아웃 수정', completed: false },
    { id: 4, text: '서버 용량 모니터링', completed: false },
    { id: 5, text: '새 위젯 추가 요청 검토', completed: false },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  
  const toggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const addTodo = () => {
    if (inputValue.trim() !== '') {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false
      };
      
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setInputValue('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };
  
  return (
    <div className="tag-detail-container">
      <div className="tag-detail-title">
        <span className="tag-name">태스크</span>
        <span className="tag-date">{formattedDate}</span>
      </div>
      
      <div className="detail-body">
        <div className="detail-head">
          <div className="reg-date">
            {/* 왼쪽 헤더 영역 */}
          </div>
          <div className="todo-count">
            <span className="todo-count-text">{completedCount}/{totalCount}</span>
          </div>
        </div>
        
        {/* 할 일 목록 */}
        {todos.map((todo, index) => (
          <div key={todo.id} className="todo-item" style={{ order: index + 1 }}>
            <div 
              className={`check-box ${todo.completed ? 'checked' : ''}`} 
              onClick={() => toggleTodo(todo.id)}
            ></div>
            <div className="todo-description">
              <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                {todo.text}
              </span>
            </div>
          </div>
        ))}
        
        {/* 새 할 일 입력 */}
        <div className="todo-bottom">
          <input
            type="text"
            className="todo-input"
            placeholder="Todo..."
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