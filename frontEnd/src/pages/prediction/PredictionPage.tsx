import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DropzoneCSVComponent from "../../components/form/form-elements/DropZoneCSV";
import PageMeta from "../../components/common/PageMeta";
import BasicTableCsv from "../../components/tables/BasicTables/BasicTableCsv";
import { predictionService } from "../../services/predictionService";
import ModelPredictionChart from "./ModelPredictionChart";

export default function PredictionPage() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    setLoading(true);
    try {
      const result = await predictionService.uploadCSVAndGetResults(files[0]);
      setCsvData(result);
    } catch (err) {
      console.error("Erreur API Prediction:", err);
      alert("Erreur lors du traitement du fichier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta title="Yield Prediction" description="Prediction page" />
      <PageBreadcrumb pageTitle="Yield Prediction" />

      <div className="space-y-5 sm:space-y-6">
        {/* ✅ on passe un callback qui reçoit les fichiers */}
        <DropzoneCSVComponent onFilesAccepted={handleFileUpload} />

        {loading && (
          <div className="text-blue-500 font-semibold">Analyse en cours...</div>
        )}

         {/* Chart */}
              {csvData.length > 0 && (
                <div className="col-span-12 mt-6">
                  <ModelPredictionChart csvData={csvData} />
                </div>
              )}

        {/* ✅ Table uniquement si backend a renvoyé des données */}
        {csvData.length > 0 && <BasicTableCsv data={csvData} columns={["Semaine", "Jour apres plantation", "Prediction_Rendement"]} // On choisit seulement ces colonnes
 />}
      </div>
    </div>
  );
}
