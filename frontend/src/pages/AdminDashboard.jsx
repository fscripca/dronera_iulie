import React from 'react';
import SalesLineChart from '../components/SalesLineChart';
import PhasePieChart from '../components/PhasePieChart';

export default function AdminDashboard() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <SalesLineChart />
        <PhasePieChart />
      </div>
    </div>
  );
}
