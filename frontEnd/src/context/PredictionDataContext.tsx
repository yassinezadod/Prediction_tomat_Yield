import { createContext, useContext, useState, ReactNode } from "react";

interface PredictionData {
  csvData: any[];
}

interface PredictionDataContextType extends PredictionData {
  setCsvData: (data: any[]) => void;
}

const PredictionDataContext = createContext<PredictionDataContextType | undefined>(undefined);

export const PredictionDataProvider = ({ children }: { children: ReactNode }) => {
  const [csvData, setCsvData] = useState<any[]>([]);

  return (
    <PredictionDataContext.Provider value={{ csvData, setCsvData }}>
      {children}
    </PredictionDataContext.Provider>
  );
};

export const usePredictionData = () => {
  const context = useContext(PredictionDataContext);
  if (!context) throw new Error("usePredictionData must be used inside a PredictionDataProvider");
  return context;
};
