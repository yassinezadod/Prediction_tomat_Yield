// src/services/predictionService.ts
import { apiClient } from "./api";
import Papa from "papaparse";

class PredictionService {




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

    //  ici on utilise postFormData car backend attend multipart/form-data
    const response = await apiClient.postFormData<string>(
      "/predict/csv/download",
      formData,    { responseType: "text" }

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
      responseType: "blob", // important pour récupérer un fichier
    });

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_prediction.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

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
   */
  async compareCSVs(predictionsFile: File, actualFile: File): Promise<any[]> {
    const formData = new FormData();
    formData.append("predictions_file", predictionsFile);
    formData.append("actual_file", actualFile);

    // ⚠️ backend renvoie un CSV (text/csv), donc on le récupère en texte
    const response = await apiClient.postFormData<string>(
      "/predict/compare/download",
      formData,    { responseType: "text" }

    );

    // Parser le CSV reçu
    const parsed = Papa.parse(response, {
      header: true,
      skipEmptyLines: true,
      comments: "#" // permet d’ignorer les lignes de métadonnées (commentaire ajouté dans le backend)
    });

    return parsed.data as any[];
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







  

}


export const predictionService = new PredictionService();
