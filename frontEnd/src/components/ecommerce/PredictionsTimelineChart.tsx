// components/ecommerce/PredictionsTimelineChart.tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface PredictionsTimelineChartProps {
  timeline: { date: string; count: number }[];
}

export default function PredictionsTimelineChart({ timeline }: PredictionsTimelineChartProps) {
  const dates = timeline.map(t => t.date);
  const counts = timeline.map(t => t.count);

  const options: ApexOptions = {
    chart: { type: "area", height: 250, toolbar: { show: false } },
    xaxis: { categories: dates, title: { text: "Date" } },
    yaxis: { title: { text: "Predictions" } },
    colors: ["#00b894"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
  };

  const series = [{ name: "Predictions", data: counts }];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Predictions Timeline</h3>
      <Chart options={options} series={series} type="area" height={250} />
    </div>
  );
}
