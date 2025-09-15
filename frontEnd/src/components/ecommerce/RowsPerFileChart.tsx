import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface RowsPerFileChartProps {
  history: {
    dataset: string[];
    rows: number;
  }[];
}

export default function RowsPerFileChart({ history }: RowsPerFileChartProps) {
  // Utiliser le premier fichier de chaque dataset comme label
  const categories = history.map(h => h.dataset[0] ?? "Unknown");
  const rowsData = history.map(h => h.rows ?? 0);

  const options: ApexOptions = {
    chart: { type: "bar", height: 250, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 5 } },
    dataLabels: { enabled: false },
    xaxis: { categories },
    yaxis: { title: { text: "Number of Rows" } },
    tooltip: { y: { formatter: (val: number) => `${val} rows` } },
    colors: ["#34c38f"],
  };

  const series = [
    { name: "Rows", data: rowsData }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Rows per File</h3>
      <Chart options={options} series={series} type="bar" height={250} />
    </div>
  );
}
