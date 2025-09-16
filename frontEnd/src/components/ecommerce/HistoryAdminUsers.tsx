import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { AdminUserHistoryItem } from "../../types";
import { useNavigate } from "react-router-dom";
import Badge from "../ui/badge/Badge";

interface HistorySectionProps {
  history: AdminUserHistoryItem[];
}

export default function HistoryAdminUsers({ history }: HistorySectionProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            User History
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/history/all", { state: { data: history } })}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Name
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Email
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Total Predictions
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Total Logins
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 ">
            {history.length > 0 ? (
              history.slice(0, 5).map((h, idx) => (
                <TableRow key={idx}>
                  <TableCell className="py-3">
                    <p className="font-medium text-center text-gray-800 text-theme-sm dark:text-white/90">
                      {h.name}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                    {h.email}
                  </TableCell>
                  <TableCell className="py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                     
                         <Badge
                    size="sm"
                    color={
                      
                       "success"
                      
                    }
                  >
                    {h.total_predictions}
                  </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                   

                     <Badge
                    size="sm"
                    color={
                      
                       "warning"
                      
                    }
                  >
                   {h.total_logins}
                  </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
               
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
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
