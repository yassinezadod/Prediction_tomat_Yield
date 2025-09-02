import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../ui/button/Button";
import { AngleLeftIcon } from "../../../icons";

interface BasicTableOneProps {
  data: any[];
}

export default function CompareTableAll() {
  const location = useLocation();
  const navigate = useNavigate();
  // ✅ Récupérer les données passées via state
  const data = location.state?.data || [];
  return (
<div className="w-full h-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
  {/* Header */}
  <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Prediction Details
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {data.length} yield forecast{data.length > 1 ? "s" : ""} available
      </p>
    </div>

    <div className="flex items-center gap-3">
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
  <div className="w-full h-[75vh] overflow-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
    <Table className="w-full text-sm">
      {/* Header dynamique */}
      {data.length > 0 && (
        <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
          <TableRow>
            {Object.keys(data[0]).map((key) => (
              <TableCell
                key={key}
                isHeader
                className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap"
              >
                {key}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
      )}

      {/* Rows */}
      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {data.map((row: any, idx: number) => (
          <TableRow key={idx}>
            {Object.values(row).map((val, i) => (
              <TableCell
                key={i}
                className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                {String(val)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
</div>


  );
}
