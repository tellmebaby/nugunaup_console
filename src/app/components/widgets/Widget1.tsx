import React from 'react';

export default function Widget1() {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-48 transition-all duration-500 ease-in-out transform hover:scale-[1.01]">
      <h2 className="font-semibold mb-4">Widget 1-1</h2>
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-700">User Statistics</h3>
        <p className="text-2xl font-bold mt-2">12,345</p>
        <p className="text-sm text-blue-500 mt-1">+15% from last week</p>
      </div>
    </div>
  );
}