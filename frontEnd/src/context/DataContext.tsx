// DataContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface PredictionDataContextType {
  predictionFile: File | null;
  setPredictionFile: (file: File | null) => void;
  actualFile: File | null;
  setActualFile: (file: File | null) => void;
  csvData: any[];
  setCsvData: (data: any[]) => void;
  apiData: any;
  setApiData: (data: any) => void;
}

const PredictionDataContext = createContext<PredictionDataContextType | undefined>(undefined);

export const PredictionDataProvider = ({ children }: { children: ReactNode }) => {
  const [predictionFile, setPredictionFile] = useState<File | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [apiData, setApiData] = useState<any>(null);

  return (
    <PredictionDataContext.Provider value={{
      predictionFile, setPredictionFile,
      actualFile, setActualFile,
      csvData, setCsvData,
      apiData, setApiData
    }}>
      {children}
    </PredictionDataContext.Provider>
  );
};

export const usePredictionData = () => {
  const context = useContext(PredictionDataContext);
  if (!context) throw new Error("usePredictionData must be used inside a PredictionDataProvider");
  return context;
};
