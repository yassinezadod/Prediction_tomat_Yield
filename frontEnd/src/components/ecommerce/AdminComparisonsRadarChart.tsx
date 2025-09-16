import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface Comparison {
  user_id: string;
  files: string[];
  description: string;
  global_metrics: { [key: string]: number };
  date: string;
}

interface AdminComparisonsRadarChartProps {
  comparisons: Comparison[];
}

export default function AdminComparisonsRadarChart({
  comparisons,
}: AdminComparisonsRadarChartProps) {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Admin Comparisons</h3>
        <p className="text-gray-500">Aucune comparaison disponible</p>
      </div>
    );
  }

  const metrics = ["MAE", "MSE", "RMSE", "R2"];

  const series = comparisons.slice(0, 5).map((comp, index) => ({
    name: comp.description || `Comparison ${index + 1}`,
    data: metrics.map((m) => Number(comp.global_metrics[m] ?? 0)),
  }));

  const options: ApexOptions = {
    chart: { type: "radar", toolbar: { show: false } },
    xaxis: { categories: metrics },
    yaxis: {
      show: false, // ❌ Désactive l'affichage permanent des valeurs
      min: 0,
      max:
        Math.max(
          ...comparisons.flatMap((c) =>
            metrics.map((m) => Number(c.global_metrics[m] ?? 0))
          )
        ) * 1.2,
    },
    stroke: { width: 2 },
    fill: { opacity: 0.3 },
    legend: { position: "bottom" },
    colors: ["#00b894", "#0984e3", "#fd79a8", "#e17055", "#6c5ce7"],
    markers: { size: 4 },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => val.toFixed(3), // Affiche les valeurs au survol
      },
    },
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Admin Comparisons (Metrics)</h3>
      <Chart options={options} series={series} type="radar" height={350} />
    </div>
  );
}
