import React from 'react';

export default function TokenGauge() {
  const progress = 75; // percent
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-xl mb-2">Token Buyback Progress</h2>
      <div className="w-full bg-gray-300 rounded-full h-4">
        <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-sm mt-1">{progress}% completed</p>
    </div>
  );
}
