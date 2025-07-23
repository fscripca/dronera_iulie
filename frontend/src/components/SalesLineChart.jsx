import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { date: '2025-07-01', tokensSold: 5000 },
  { date: '2025-07-02', tokensSold: 8000 },
  { date: '2025-07-03', tokensSold: 6000 },
];

export default function SalesLineChart() {
  return (
    <div>
      <h2 className="text-xl mb-2">Sales Over Time</h2>
      <LineChart width={400} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="tokensSold" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
