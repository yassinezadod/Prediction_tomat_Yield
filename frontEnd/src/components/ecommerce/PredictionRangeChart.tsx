import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface PredictionRangeChartProps {
  history: {
    dataset: string[];
    mean_pred: number | null;
    min_pred: number | null;
    max_pred: number | null;
  }[];
}

export default function PredictionRangeChart({ history }: PredictionRangeChartProps) {
  const categories = history.map(h => h.dataset[0]); // premier fichier de chaque dataset
  const minPreds = history.map(h => h.min_pred ?? 0);
  const meanPreds = history.map(h => h.mean_pred ?? 0);
  const maxPreds = history.map(h => h.max_pred ?? 0);

 const options: ApexOptions = {
  chart: { type: "bar", stacked: false, toolbar: { show: false } },
  plotOptions: { bar: { columnWidth: "40%" } },
  xaxis: { categories },
  yaxis: {
    labels: {
      formatter: (val: number) => val.toFixed(2), // arrondi
    },
    title: { text: "Prediction Value" },
  },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: (val: number) => val.toFixed(2), // arrondi
    },
  },
};


  const series = [
    { name: "Min Prediction", data: minPreds },
    { name: "Mean Prediction", data: meanPreds },
    { name: "Max Prediction", data: maxPreds },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Prediction Range per File</h3>
      <Chart options={options} series={series} type="bar" height={250} />
    </div>
  );
}
