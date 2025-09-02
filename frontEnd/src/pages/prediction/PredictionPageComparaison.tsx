import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CompareTableCsv from "../../components/tables/BasicTables/CompareTableCsv";
import { predictionService } from "../../services/predictionService";
import DropZoneCSVCompareReel from "../../components/form/form-elements/DropZoneCSVCompareReel";
import DropZoneCSVComparePrediction from "../../components/form/form-elements/DropZoneCSVComparePrediction";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import ModelStatisticsTable from "../../components/ecommerce/ModelStatisticsTable";
import ModelMetricsTable from "../../components/ecommerce/ModelMetricsTable";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import ModelComparaisonChart from "./ModelComparaisonChart";

export default function PredictionPageComparaison() {
  const [predictionFile, setPredictionFile] = useState<File | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [originalCsv, setOriginalCsv] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Quand les 2 fichiers sont uploadés → appel au backend
  useEffect(() => {
    const fetchComparison = async () => {
      if (!predictionFile || !actualFile) return;

      setLoading(true);
      try {
        // ✅ Utiliser la nouvelle méthode qui garde le CSV original
        const result = await predictionService.compareCSVsWithOriginal(
          predictionFile,
          actualFile
        );
        setCsvData(result.data);
        setOriginalCsv(result.originalCsv);
              console.log("CSV Data:", result.data);

      } catch (err) {
        console.error("Erreur API Prediction:", err);
        alert("Erreur lors du traitement des fichiers");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [predictionFile, actualFile]);

  return (
    <div>
      <PageMeta title="Yield Prediction" description="Prediction page" />
      <PageBreadcrumb pageTitle="Yield Prediction" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Upload prédictions */}
        <DropZoneCSVComparePrediction
          onFilesAccepted={(files) => setPredictionFile(files[0])}
        />
        {/* Upload réels */}
        <DropZoneCSVCompareReel
          onFilesAccepted={(files) => setActualFile(files[0])}
        />
      </div>

      {/* ✅ Passer les données csvData et l'état loading au composant chart */}
{csvData.length > 0 && (
      <div className="col-span-12 mt-6">
        <ModelComparaisonChart 
          csvData={csvData} 
        />
      </div>
      )}

      {/* Afficher les metrics uniquement quand on a des résultats */}
      {csvData.length > 0 && predictionFile && actualFile && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mt-6">
          {/* Metrics */}
          <ModelMetricsTable 
            predictionsFile={predictionFile} 
            actualFile={actualFile} 
          />
          <ModelStatisticsTable 
            predictionsFile={predictionFile} 
            actualFile={actualFile} 
          />
        </div>
      )}

      <div className="space-y-5 sm:space-y-6 mt-6">
        {loading && (
          <div className="text-blue-500 font-semibold">Analyse en cours...</div>
        )}

        {/* ✅ Table affichée uniquement si on a des résultats */}
        {csvData.length > 0 && (
          <CompareTableCsv
            data={csvData}
            originalCsv={originalCsv} // ✅ Passer le CSV original
            predictionFile={predictionFile!}   
            actualFile={actualFile!}
            columns={[
              "Prediction_Rendement",
              "Rendement_Actual",
              "Erreur_Absolue",
            ]}
          />
        )}
      </div>
    </div>
  );
}