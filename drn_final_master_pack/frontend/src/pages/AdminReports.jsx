import React from 'react';

export default function AdminReports() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Reports</h2>
      <button className="bg-green-600 text-white p-2 rounded mb-2">Export CSV</button>
      <table className="w-full border">
        <thead>
          <tr>
            <th>User</th>
            <th>Tokens</th>
            <th>Payments</th>
            <th>KYC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>1000 DRN</td>
            <td>✔ Paid</td>
            <td>✔ Passed</td>
            <td><button className="bg-blue-500 text-white p-1 rounded">Resend Email</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
