import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";

interface MonthlySalesChartProps {
  testsPerMonth: { month: string; count: number }[];
}

export default function TestsPerMonthChart({ testsPerMonth }: MonthlySalesChartProps) {
  // Mapping mois pour le graphique
  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  
  // Créer un tableau de 12 valeurs initialisé à 0
  const seriesData = new Array(12).fill(0);

  // Remplir les valeurs à partir des données du backend
  testsPerMonth.forEach(({ month, count }) => {
    const monthIndex = parseInt(month.split("-")[1], 10) - 1; // "2025-09" => 8
    seriesData[monthIndex] = count;
  });

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: { type: "bar", height: 180, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "39%", borderRadius: 5 } },
    dataLabels: { enabled: false },
    xaxis: { categories: monthLabels },
    yaxis: { title: { text: undefined } },
    tooltip: { y: { formatter: (val: number) => `${val}` } },
  };

  const series = [{ name: "Tests", data: seriesData }];

//   return 
// }
  
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
Monthly Test Activity        </h3>
        <div className="relative inline-block">
          
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />;
        </div>
      </div>
    </div>
  );
}

