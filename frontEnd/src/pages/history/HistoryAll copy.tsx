import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { UserHistoryItem } from "../../types";

export default function HistoryAll() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ récupérer les données envoyées depuis HistorySection
  const history: UserHistoryItem[] = location.state?.data || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            User History (Full)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {history.length} record(s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)} // ✅ retour
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Back
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader>Dataset</TableCell>
              <TableCell isHeader>Date</TableCell>
              <TableCell isHeader>Rows</TableCell>
              <TableCell isHeader>Mean Pred</TableCell>
              <TableCell isHeader>Min Pred</TableCell>
              <TableCell isHeader>Max Pred</TableCell>
              <TableCell isHeader>Download</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {history.length > 0 ? (
              history.map((h, idx) => (
                <TableRow key={idx}>
                  <TableCell>{h.dataset.join(", ")}</TableCell>
                  <TableCell>{new Date(h.date).toLocaleString()}</TableCell>
                  <TableCell>{h.rows}</TableCell>
                  <TableCell>{h.mean_pred ?? "-"}</TableCell>
                  <TableCell>{h.min_pred ?? "-"}</TableCell>
                  <TableCell>{h.max_pred ?? "-"}</TableCell>
                  <TableCell>
                    {h.download_link ? (
                      <a
                        href={h.download_link}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell  className="text-center py-4 text-gray-500">
                  No history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
