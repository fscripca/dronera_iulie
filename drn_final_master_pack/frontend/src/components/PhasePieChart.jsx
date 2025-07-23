import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Phase 1', value: 20000000 },
  { name: 'Phase 2', value: 32000000 },
  { name: 'Phase 3', value: 33333333 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function PhasePieChart() {
  return (
    <div>
      <h2 className="text-xl mb-2">Token Phase Distribution</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx={200}
          cy={150}
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
