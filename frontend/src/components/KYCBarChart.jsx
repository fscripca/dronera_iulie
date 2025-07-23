import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const data = [
  { status: 'Pending', count: 20 },
  { status: 'Approved', count: 70 },
  { status: 'Rejected', count: 10 },
];

export default function KYCBarChart() {
  return (
    <div>
      <h2 className="text-xl mb-2">KYC Status</h2>
      <BarChart width={400} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}
