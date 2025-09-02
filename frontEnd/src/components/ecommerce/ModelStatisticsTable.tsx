import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { predictionService } from "../../services/predictionService";

interface Statistic {
  name: string;
  prediction: number;
  actual: number;
}

export default function ModelStatisticsTable({
  predictionsFile,
  actualFile,
}: {
  predictionsFile: File;
  actualFile: File;
}) {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
  try {
    setLoading(true);
    setError(null);

    const data = await predictionService.compareCSVsAsJSON(
      predictionsFile,
      actualFile
    );

    if (!data || !data.statistics) {
      throw new Error("Réponse invalide du serveur (statistics manquant)");
    }

    const { predictions, actual } = data.statistics;

    // On prend les clés communes (mean, std, min, max, etc.)
    const parsed: Statistic[] = Object.keys(predictions).map((key) => ({
      name: key,
      prediction: Number(predictions[key]),
      actual: Number(actual[key]),
    }));

    setStatistics(parsed);
  } catch (err: any) {
    console.error("❌ Erreur récupération statistiques:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (predictionsFile && actualFile) {
      fetchStatistics();
    }
  }, [predictionsFile, actualFile]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Prediction Statistics
      </h3>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && statistics.length > 0 && (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Statistic
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Predictions
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actual
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {statistics.map((stat) => (
                <TableRow key={stat.name}>
                  <TableCell className="py-3">{stat.name}</TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {stat.prediction.toFixed(4)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {stat.actual.toFixed(4)}
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
