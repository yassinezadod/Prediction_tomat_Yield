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
// Page principale optimisée
// Page principale optimisée
export default function PredictionPageComparaison() {
  const [predictionFile, setPredictionFile] = useState<File | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [originalCsv, setOriginalCsv] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  // ✅ Nouveaux states pour les données partagées
  const [apiData, setApiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Appel unique qui récupère toutes les données nécessaires
  useEffect(() => {
    const fetchAllData = async () => {
      if (!predictionFile || !actualFile) return;

      setLoading(true);
      setApiError(null);
      
      try {
        // ✅ Appel parallèle des deux APIs
        const [comparisonResult, jsonResult] = await Promise.all([
          predictionService.compareCSVsWithOriginal(predictionFile, actualFile),
          predictionService.compareCSVsAsJSON(predictionFile, actualFile)
        ]);

        // Stocker les résultats de la comparaison (pour le chart et table)
        setCsvData(comparisonResult.data);
        setOriginalCsv(comparisonResult.originalCsv);
        
        // ✅ Stocker les données JSON (pour metrics et statistics)
        setApiData(jsonResult);
        
        console.log("CSV Data:", comparisonResult.data);
        console.log("JSON Data:", jsonResult);

      } catch (err) {
        console.error("Erreur API:", err);
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du traitement des fichiers";
        setApiError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [predictionFile, actualFile]);

  return (
    <div>
      <PageMeta title="Yield Prediction" description="Prediction page" />
      <PageBreadcrumb pageTitle="Yield Prediction" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DropZoneCSVComparePrediction
          onFilesAccepted={(files) => setPredictionFile(files[0])}
        />
        <DropZoneCSVCompareReel
          onFilesAccepted={(files) => setActualFile(files[0])}
        />
      </div>

      {/* Chart */}
      {csvData.length > 0 && (
        <div className="col-span-12 mt-6">
          <ModelComparaisonChart csvData={csvData} />
        </div>
      )}

      {/* ✅ Passer les données API aux composants */}
      {apiData && predictionFile && actualFile && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mt-6">
          <ModelMetricsTable 
            data={apiData}
            loading={loading}
            error={apiError}
          />
          <ModelStatisticsTable 
            data={apiData}
            loading={loading}
            error={apiError}
          />
        </div>
      )}

      <div className="space-y-5 sm:space-y-6 mt-6">
        {loading && (
          <div className="text-blue-500 font-semibold">Analyse en cours...</div>
        )}

        {apiError && (
          <div className="text-red-500 font-semibold">Erreur: {apiError}</div>
        )}

        {csvData.length > 0 && (
          <CompareTableCsv
            data={csvData}
            originalCsv={originalCsv}
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