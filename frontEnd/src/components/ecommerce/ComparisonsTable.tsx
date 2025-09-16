import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface ComparisonItem {
  user_id: string;               // plus besoin de _id
  description: string;
  files: string[];
  global_metrics: {
    MAE?: number;
    MSE?: number;
    RMSE?: number;
    R2?: number;
    MAPE?: number;
  };
  date: string;
}

interface ComparisonsTableProps {
  comparisons: ComparisonItem[]; // tableau avec le nouveau type
}

export default function ComparisonsTable({ comparisons }: ComparisonsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Comparisons Metrics (Admin)
        </h3>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">
                Files
              </TableCell>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">MAE</TableCell>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">MSE</TableCell>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">RMSE</TableCell>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">R²</TableCell>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">MAPE</TableCell>
              <TableCell isHeader className="py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">Date</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {comparisons.length > 0 ? (
              comparisons.map((comp, idx) => (
                <TableRow key={idx}> {/* utilisation de idx comme clé */}
                  <TableCell className="py-3 text-center">
                    {comp.files && comp.files.length > 0 ? (
                      comp.files.map((f, i) => (
                        <Badge key={i} size="sm" color="primary">{f}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No files</span>
                    )}
                  </TableCell>

                  <TableCell className="py-3 text-center">{comp.global_metrics?.MAE?.toFixed(3) ?? "—"}</TableCell>
                  <TableCell className="py-3 text-center">{comp.global_metrics?.MSE?.toFixed(3) ?? "—"}</TableCell>
                  <TableCell className="py-3 text-center">{comp.global_metrics?.RMSE?.toFixed(3) ?? "—"}</TableCell>
                  <TableCell className="py-3 text-center">{comp.global_metrics?.R2?.toFixed(3) ?? "—"}</TableCell>
                  <TableCell className="py-3 text-center">{comp.global_metrics?.MAPE?.toFixed(2) ?? "—"}%</TableCell>
                  <TableCell className="py-3 text-center text-gray-500 dark:text-gray-400">
                    {new Date(comp.date).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-4 text-center text-gray-500 dark:text-gray-400" >
                  No comparisons available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
