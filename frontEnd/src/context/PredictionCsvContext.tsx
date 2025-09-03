import { createContext, useContext, useState, ReactNode } from "react";

interface PredictionCsvContextType {
  csvData: any[];
  setCsvData: (data: any[]) => void;
}

const PredictionCsvContext = createContext<PredictionCsvContextType | undefined>(undefined);

export const PredictionCsvProvider = ({ children }: { children: ReactNode }) => {
  const [csvData, setCsvData] = useState<any[]>([]);

  return (
    <PredictionCsvContext.Provider value={{ csvData, setCsvData }}>
      {children}
    </PredictionCsvContext.Provider>
  );
};

export const usePredictionCsv = () => {
  const context = useContext(PredictionCsvContext);
  if (!context) throw new Error("usePredictionCsv must be used inside a PredictionCsvProvider");
  return context;
};
