src/
├── app/
│   ├── page.tsx                # 메인 페이지
│   └── layout.tsx              # 루트 레이아웃
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # 헤더 컴포넌트
│   │   ├── DashboardLayout.tsx # 대시보드 레이아웃
│   │   └── LayoutWrapper.tsx   # Context Provider 래퍼
│   │
│   ├── widgets/
│   │   ├── Widget1.tsx         # 위젯 1-1
│   │   ├── Widget2.tsx         # 위젯 2-1
│   │   ├── Widget3.tsx         # 위젯 3-1
│   │   └── index.ts            # 위젯 내보내기
│   │
│   └── ui/                     # 공통 UI 컴포넌트 (필요시)
│
├── context/
│   └── WidgetContext.tsx       # 위젯 상태 관리 컨텍스트
│
├── hooks/                      # 커스텀 훅 (필요시)
│
├── styles/                     # 스타일 파일 (필요시)
│
└── utils/                      # 유틸리티 함수 (필요시)