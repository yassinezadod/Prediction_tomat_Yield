import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { UserHistoryItem } from "../../types";
import Button from "../../components/ui/button/Button";
import { AngleLeftIcon } from "../../icons";

export default function HistoryAll() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ récupérer les données envoyées depuis HistorySection
  const history: UserHistoryItem[] = location.state?.data || [];

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] gap-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4">
      
      {/* Header avec Grid */}
      <div className="w-full grid grid-cols-[1fr_auto] gap-4 items-center min-w-0">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 truncate">
            User History (Full)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {history.length} record(s)
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button
            size="md"
            variant="outline"
            startIcon={<AngleLeftIcon className="size-5" />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Table container */}
      <div className="min-w-0 min-h-0 w-full h-full rounded-xl border border-gray-200 dark:border-white/[0.05] overflow-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 pl-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Dataset
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Date
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Rows
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Mean Pred
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Min Pred
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Max Pred
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Download
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {history.length > 0 ? (
              history.map((h, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {h.dataset.join(", ")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(h.date).toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {h.rows}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {h.mean_pred !== null && h.mean_pred !== undefined
                      ? h.mean_pred.toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {h.min_pred !== null && h.min_pred !== undefined
                      ? h.min_pred.toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {h.max_pred !== null && h.max_pred !== undefined
                      ? h.max_pred.toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell className="py-3">
                    <a
                      href={h.download_link}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Download
                    </a>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  className="py-4 px-4 text-center text-gray-500 dark:text-gray-400" 
                >
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
