import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface AdminActivityChartProps {
  adminActivity: { month: string; count: number }[];
}

export default function AdminActivityChart({ adminActivity }: AdminActivityChartProps) {
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const seriesData = new Array(12).fill(0);

  adminActivity.forEach(({ month, count }) => {
    const [year, monthStr] = month.split("-");
    const monthIndex = parseInt(monthStr, 10) - 1;
    seriesData[monthIndex] = count;
  });

  const options: ApexOptions = {
    colors: ["#ff914d"],
    chart: { type: "line", height: 180, toolbar: { show: false } },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: true },
    xaxis: { categories: monthLabels },
    yaxis: { title: { text: "Admin Logins" } },
    tooltip: { y: { formatter: (val: number) => `${val} logins` } },
  };

  const series = [{ name: "Admin Logins", data: seriesData }];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Admin Monthly Activity
      </h3>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="line" height={220} />
        </div>
      </div>
    </div>
  );
}
