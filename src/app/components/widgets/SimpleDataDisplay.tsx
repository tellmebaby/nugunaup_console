import React from 'react';

export default function SimpleDataDisplay() {
  // 샘플 데이터
  const data = [
    { id: 1, title: "항목 1", value: "100" },
    { id: 2, title: "항목 2", value: "200" },
    { id: 3, title: "항목 3", value: "300" },
    { id: 4, title: "항목 4", value: "400" },
    { id: 5, title: "항목 5", value: "500" }
  ];

  return (
    <div className="w-full h-full p-4">
      <h3 className="text-lg font-medium mb-4">단순 데이터 표시</h3>
      
      <div className="w-full">
        {data.map(item => (
          <div key={item.id} className="flex justify-between py-2 border-b">
            <span>{item.title}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}