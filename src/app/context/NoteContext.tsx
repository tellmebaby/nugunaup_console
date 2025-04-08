"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 노트 컨텍스트 타입 정의
interface NoteContextType {
  selectedNoteId: number | null;
  selectedTagName: string | null;
  setSelectedNote: (noteId: number | null, tagName: string | null) => void;
}

// 컨텍스트 생성
const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Provider 컴포넌트
export function NoteProvider({ children }: { children: ReactNode }) {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);

  // 선택된 노트 정보 설정 함수
  const setSelectedNote = (noteId: number | null, tagName: string | null) => {
    setSelectedNoteId(noteId);
    setSelectedTagName(tagName);
  };

  return (
    <NoteContext.Provider value={{ selectedNoteId, selectedTagName, setSelectedNote }}>
      {children}
    </NoteContext.Provider>
  );
}

// 커스텀 훅
export function useNote() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNote must be used within a NoteProvider');
  }
  return context;
}