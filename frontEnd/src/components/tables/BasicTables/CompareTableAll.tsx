import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface BasicTableOneProps {
  data: any[];
}

export default function CompareTableAll({ data }: BasicTableOneProps) {
  return (
<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
  <div className="max-w-full overflow-x-auto">
    <div className="max-h-[75vh] overflow-y-auto"> {/* ✅ scroll vertical aussi */}
      <Table className="min-w-max text-sm">
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
          {data.map((row, idx) => (
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
</div>

  );
}
