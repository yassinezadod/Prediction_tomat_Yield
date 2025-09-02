import { 
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ pour redirection
import { predictionService } from "../../../services/predictionService"; // ajuste le chemin si besoin

interface BasicTableOneProps {
  data: any[];
  columns: string[]; // Colonnes à afficher
}

export default function BasicTableCsv({ data, columns }: BasicTableOneProps) {
  const navigate = useNavigate();

  const seeAllData = () => {
    // ✅ redirection immédiate
    navigate("/see-all", { state: { data } });
  };

  const downloadResults = () => {
     
        predictionService.downloadResultsAsCSV(data, "prediction_results.csv");

  };
  

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Prediction Results
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.length} yield forecast{data.length > 1 ? "s" : ""} available
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={seeAllData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            See all
          </button>

          <button 
                      onClick={downloadResults}

          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
 <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  ><path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
    />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-md">
        <div className="max-w-full overflow-x-auto">
          <Table className="w-full text-sm text-center">
            {/* Header avec colonnes spécifiées */}
            {data.length > 0 && (
              <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
                <TableRow>
                  {columns.map((col, index) => {
                    const isLast = index === columns.length - 1;
                    return (
                      <TableCell
                        key={col}
                        isHeader
                        className={`px-5 py-3 font-semibold uppercase tracking-wide text-center 
                          ${isLast 
                            ? "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15 text-blue-700 dark:text-blue-300" 
                            : "text-gray-700 dark:text-gray-200"
                          }`}
                      >
                        {col}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHeader>
            )}

            {/* Rows */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((row, idx) => (
                <TableRow 
                  key={idx} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {columns.map((col, index) => {
                    const isLast = index === columns.length - 1;
                    return (
                      <TableCell
                        key={col}
                        className={`px-4 py-3 text-center 
                          ${isLast 
                            ? "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15 text-blue-700 dark:text-blue-300 font-medium" 
                            : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {row[col] as string}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
