import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { predictionService } from '../../services/predictionService';
// Composant ModelMetricsTable optimisé
interface Metric {
  name: string;
  value: number;
}

interface ModelMetricsTableProps {
  data: any; // Les données JSON de l'API
  loading: boolean;
  error: string | null;
}

export default function ModelMetricsTable({ 
  data, 
  loading, 
  error 
}: ModelMetricsTableProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  // ✅ Plus besoin d'appel API - on utilise les données passées en props
  useEffect(() => {
    if (data && data.global_metrics) {
      const parsed: Metric[] = Object.entries(data.global_metrics).map(
        ([key, value]) => ({
          name: key,
          value: Number(value),
        })
      );
      setMetrics(parsed);
    }
  }, [data]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Prediction Metrics
      </h3>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && metrics.length > 0 && (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Global Metrics
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Value
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {metrics.map((metric) => (
                <TableRow key={metric.name}>
                  <TableCell className="py-3">{metric.name}</TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {metric.value.toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && !error && metrics.length === 0 && data && (
        <p className="text-gray-500">Aucune métrique disponible</p>
      )}
    </div>
  );
}
