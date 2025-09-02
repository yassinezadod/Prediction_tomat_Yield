import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { predictionService } from '../../services/predictionService';

interface Metric {
  name: string;
  value: number;
}

export default function ModelMetricsTable({
  predictionsFile,
  actualFile,
}: {
  predictionsFile: File;
  actualFile: File;
}) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const fetchMetrics = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await predictionService.compareCSVsAsJSON(
      predictionsFile,
      actualFile
    );

    if (!data || !data.global_metrics) {
      throw new Error("Réponse invalide du serveur (global_metrics manquant)");
    }

    const parsed: Metric[] = Object.entries(data.global_metrics).map(
      ([key, value]) => ({
        name: key,
        value: Number(value),
      })
    );

    setMetrics(parsed);
  } catch (err: any) {
    console.error("❌ Erreur lors de la récupération des métriques:", err);
    setError(err.message || "Erreur inconnue");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (predictionsFile && actualFile) {
      fetchMetrics();
    }
  }, [predictionsFile, actualFile]);

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
    </div>
  );
}
