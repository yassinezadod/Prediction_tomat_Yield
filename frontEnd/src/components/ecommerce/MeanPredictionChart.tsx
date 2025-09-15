import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface MeanPredictionChartProps {
  history: {
    date: string;
    mean_pred: number | null;
  }[];
}

export default function MeanPredictionChart({ history }: MeanPredictionChartProps) {
  const dates = history.map(h => new Date(h.date).toLocaleDateString());
  const meanPreds = history.map(h => h.mean_pred ?? 0);
const options: ApexOptions = {
  chart: { type: "line", height: 250, toolbar: { show: false } },
  stroke: { curve: "smooth" },
  xaxis: { categories: dates },
  yaxis: {
    title: { text: "Mean Prediction" },
    labels: {
      formatter: (val: number) => val.toFixed(2), // ← arrondi à 2 chiffres
    },
  },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: (val: number) => val.toFixed(2), // ← arrondi à 2 chiffres
    },
  },
};

  const series = [{ name: "Mean Prediction", data: meanPreds }];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Mean Prediction Over Time</h3>
      <Chart options={options} series={series} type="line" height={250} />
    </div>
  );
}
