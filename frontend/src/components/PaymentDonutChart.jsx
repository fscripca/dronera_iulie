import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Stripe EUR', value: 60000 },
  { name: 'MetaMask ETH', value: 40000 },
];

const COLORS = ['#FF6384', '#36A2EB'];

export default function PaymentDonutChart() {
  return (
    <div>
      <h2 className="text-xl mb-2">Payment Breakdown</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx={200}
          cy={150}
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
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
