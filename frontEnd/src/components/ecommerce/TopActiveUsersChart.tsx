// components/ecommerce/TopActiveUsersChart.tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface TopActiveUsersChartProps {
  topUsers: { user_id: string; count: number }[];
}

export default function TopActiveUsersChart({ topUsers }: TopActiveUsersChartProps) {
  const labels = topUsers.map(u => u.user_id);
  const counts = topUsers.map(u => u.count);

  const options: ApexOptions = {
    chart: { type: "bar", height: 250, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 5 } },
    xaxis: { categories: labels, title: { text: "Users" } },
    colors: ["#0984e3"],
    dataLabels: { enabled: true },
  };

  const series = [{ name: "Predictions", data: counts }];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Top Active Users</h3>
      <Chart options={options} series={series} type="bar" height={250} />
    </div>
  );
}
