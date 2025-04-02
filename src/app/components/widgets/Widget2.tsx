import React from 'react';

export default function Widget2() {
  return (
    <div className="h-full w-full">
      <h2 className="font-semibold mb-4">Widget 2-1</h2>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium text-green-700">Revenue Metrics</h3>
        <p className="text-2xl font-bold mt-2">$24,680</p>
        <p className="text-sm text-green-500 mt-1">+8% from last month</p>
      </div>
    </div>
  );
}