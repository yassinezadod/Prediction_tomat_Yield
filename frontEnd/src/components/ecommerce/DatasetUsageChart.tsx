import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState } from "react";
interface DatasetUsageChartProps {
  history: { dataset: string[] }[];
}

export default function DatasetUsageChart({ history }: DatasetUsageChartProps) {
  const datasetCounts: Record<string, number> = {};

  history.forEach(h => {
    h.dataset.forEach(d => {
      datasetCounts[d] = (datasetCounts[d] || 0) + 1;
    });
  });

  const labels = Object.keys(datasetCounts);
  const series = Object.values(datasetCounts);

  const options: ApexOptions = {
    labels,
    chart: { type: "pie" },
    legend: { position: "bottom" }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Dataset Usage</h3>
      <Chart options={options} series={series} type="pie" height={250} />
    </div>
  );
}
