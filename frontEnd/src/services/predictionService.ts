// src/services/predictionService.ts
import { apiClient } from "./api";
import Papa from "papaparse";

class PredictionService {



  /**
 * Compare deux fichiers CSV (prédictions vs réels) et retourne la réponse JSON du backend
 */
async compareCSVsAsJSON(predictionsFile: File, actualFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("predictions_file", predictionsFile);
  formData.append("actual_file", actualFile);

  // Le backend renvoie un JSON → donc pas besoin de Papa.parse
  const response = await apiClient.postFormData<any>(
    "/predict/compare",
    formData,          { responseType: "json" }   //  au lieu de "text"


  );

  return response; // { total_rows, comparisons, global_metrics, statistics, columns_used }
}


/**
 * Télécharge directement le fichier CSV de comparaison depuis le backend
 */
async downloadCompareCSV(predictionFile: File, actualFile: File): Promise<void> {
    const formData = new FormData();
    formData.append("predictions_file", predictionFile);
    formData.append("actual_file", actualFile);

    // Le backend renvoie du CSV (text/csv)
    const csvResponse = await apiClient.postFormData<string>(
      "/predict/compare/download",
      formData,
      { responseType: "text" }
    );

    // Création d'un fichier et déclenchement du téléchargement
    const blob = new Blob([csvResponse], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "compare_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Alternative méthode si l'API retourne un Blob au lieu d'un string
  async downloadCompareCSVAsBlob(predictionFile: File, actualFile: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("predictions_file", predictionFile);
      formData.append("actual_file", actualFile);
      
      // Si le backend renvoie directement un blob
      const blob = await apiClient.postFormData<Blob>(
        "/predict/compare/download",
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "compare_results.csv");
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }
  
  /**
   * Envoie un fichier CSV au backend et retourne les résultats sous forme de tableau JSON
   */
  async uploadCSVAndGetResults(file: File): Promise<any[]> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.postFormData<string>(
      "/predict/csv/download",
      formData,
      { responseType: "text" }
    );

    // Le backend renvoie un CSV → on doit parser
    const parsed = Papa.parse(response, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data as any[];
  }

   /**
   * Télécharge le template CSV depuis le backend
   */
  async downloadTemplate(): Promise<void> {
    const response = await apiClient.get<Blob>("/predict/csv/template", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_prediction.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // ❌ ANCIENNE MÉTHODE - Ne fonctionne pas bien avec les commentaires du backend
  downloadResultsAsCSV(data: any[], filename: string = "prediction_results.csv") {
    if (!data || data.length === 0) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // ❌ PROBLÉMATIQUE - Cette méthode recrée un CSV à partir des données JSON
  // Elle perd les métadonnées du backend
  downloadCompareResultsAsCSV(data: any[], filename: string = "comparaison_results.csv") {
    if (!data || data.length === 0) return;

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

 /**
   * Compare deux fichiers CSV (prédictions vs réels) et retourne un tableau JSON
   * IMPORTANT: Cette méthode parse le CSV et ignore les commentaires/métadonnées
   */
  async compareCSVs(predictionsFile: File, actualFile: File): Promise<any[]> {
    const formData = new FormData();
    formData.append("predictions_file", predictionsFile);
    formData.append("actual_file", actualFile);

    // Backend renvoie un CSV (text/csv)
    const response = await apiClient.postFormData<string>(
      "/predict/compare/download",
      formData,
      { responseType: "text" }
    );

    // Parser le CSV reçu - Les commentaires (#) sont ignorés par Papa.parse
    const parsed = Papa.parse(response, {
      header: true,
      skipEmptyLines: true,
      comments: "#" // Ignore les lignes commençant par #
    });

    return parsed.data as any[];
  }

  /**
   * ✅ SOLUTION: Méthode qui garde le CSV original du backend avec ses métadonnées
   * Stocke le CSV original lors de la comparaison pour le téléchargement
   */
  private originalCSVResponse: string | null = null;

  async compareCSVsWithOriginal(predictionsFile: File, actualFile: File): Promise<{data: any[], originalCsv: string}> {
    const formData = new FormData();
    formData.append("predictions_file", predictionsFile);
    formData.append("actual_file", actualFile);

    // Backend renvoie un CSV (text/csv)
    const response = await apiClient.postFormData<string>(
      "/predict/compare/download",
      formData,
      { responseType: "text" }
    );

    // Sauvegarder le CSV original
    this.originalCSVResponse = response;

    // Parser le CSV pour l'affichage
    const parsed = Papa.parse(response, {
      header: true,
      skipEmptyLines: true,
      comments: "#"
    });

    return {
      data: parsed.data as any[],
      originalCsv: response
    };
  }

  /**
   * ✅ Télécharge le CSV original avec métadonnées
   */
  downloadOriginalCompareCSV(originalCsv: string, filename: string = "compare_results.csv") {
    if (!originalCsv) return;

    const blob = new Blob([originalCsv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const predictionService = new PredictionService();