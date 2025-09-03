//SeeAllPage.jsx - Page principale
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableAll from "../../components/tables/BasicTables/BasicTableAll";
import { useLocation } from "react-router-dom";
import { usePredictionCsv } from "../../context/PredictionCsvContext";

export default function SeeAllPage() {
  const { csvData } = usePredictionCsv();

  return (
    <div className="h-screen w-full max-w-full flex flex-col overflow-hidden">
      <PageMeta title="Complete Prediction Table" description="Prediction page" />
      
      {/* Breadcrumb avec largeur fixe */}
      <div className="w-full flex-shrink-0">
        <PageBreadcrumb pageTitle="Complete Prediction Table" />
      </div>

      {/* Conteneur principal avec largeur strictement contrôlée */}
      <div className="flex-1 w-full min-w-0 min-h-0 px-4">
        <BasicTableAll data={csvData} />
      </div>
    </div>
  );
}