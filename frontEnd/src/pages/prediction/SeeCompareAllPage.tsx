import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useLocation } from "react-router-dom";
import CompareTableAll from "../../components/tables/BasicTables/CompareTableAll";

export default function SeeCompareAllPage() {
const location = useLocation();
  const data = location.state?.data || [];

  return (
    <div>
      <PageMeta title="Complete Prediction Table" description="Prediction page" />
      <PageBreadcrumb pageTitle="Complete Prediction Table" />

      <div className="space-y-5 sm:space-y-6">
       
      <CompareTableAll data={data} />

      </div>
    </div>
  );
}
