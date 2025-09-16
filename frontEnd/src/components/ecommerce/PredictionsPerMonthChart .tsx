import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface TimelineItem {
  date: string; // "2025-01-05"
  count: number;
}

interface PredictionsPerMonthChartProps {
  timeline: TimelineItem[];
}

export default function PredictionsPerMonthChart({ timeline }: PredictionsPerMonthChartProps) {
  // Labels des mois
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  
  // Tableau 12 mois initialisé à 0
  const seriesData = new Array(12).fill(0);

  // Remplir les valeurs par mois
  timeline.forEach(({ date, count }) => {
    const monthIndex = new Date(date).getMonth(); // 0 = Jan, 11 = Dec
    seriesData[monthIndex] += count;
  });

  const options: ApexOptions = {
    colors: ["#10b981"], // vert tailwind
    chart: { type: "bar", height: 200, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "45%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: monthLabels },
    yaxis: { title: { text: undefined } },
    tooltip: { y: { formatter: (val: number) => `${val} predictions` } },
  };

  const series = [{ name: "Predictions", data: seriesData }];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-md dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Predictions
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={200} />
        </div>
      </div>
    </div>
  );
}
