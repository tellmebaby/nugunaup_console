import React from "react";

export default function SimpleDataDisplay() {
  return (
    <div className="h-full w-full bg-white p-4 rounded-lg">
      <h2 className="font-semibold mb-4 text-center border-b pb-2">데이터 요약</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-medium text-blue-700 text-sm">일일 접속자</h3>
          <p className="text-2xl font-bold mt-1">324</p>
          <p className="text-xs text-blue-500 mt-1">전일 대비 +12%</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <h3 className="font-medium text-green-700 text-sm">신규 거래</h3>
          <p className="text-2xl font-bold mt-1">57</p>
          <p className="text-xs text-green-500 mt-1">전일 대비 +8%</p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <h3 className="font-medium text-purple-700 text-sm">수익</h3>
          <p className="text-2xl font-bold mt-1">₩26M</p>
          <p className="text-xs text-purple-500 mt-1">목표 달성률 92%</p>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-lg">
          <h3 className="font-medium text-amber-700 text-sm">신규 회원</h3>
          <p className="text-2xl font-bold mt-1">18</p>
          <p className="text-xs text-amber-500 mt-1">전주 대비 +5%</p>
        </div>
      </div>
      
      <div className="flex justify-center items-center mt-2">
        <div className="text-xs text-gray-500">마지막 업데이트: 2025-04-04 09:30</div>
      </div>
    </div>
  );
}