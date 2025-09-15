import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { UserDashboardResponse } from "../../types";
import { dashboardService } from "../../services/DashboardService ";
import HistorySection from "../../components/ecommerce/HistorySection";
import UserKPIs from "../../components/ecommerce/UserKPIs";
import TestsPerMonthChart from "../../components/ecommerce/TestsPerMonthChart";

// Nouveaux charts
import MeanPredictionChart from "../../components/ecommerce/MeanPredictionChart";
import PredictionRangeChart from "../../components/ecommerce/PredictionRangeChart";
import DatasetUsageChart from "../../components/ecommerce/DatasetUsageChart";
import RowsPerFileChart from "../../components/ecommerce/RowsPerFileChart";

export default function Home() {
  const [data, setData] = useState<UserDashboardResponse | null>(null);

  useEffect(() => {
    dashboardService
      .getUserDashboard()
      .then(setData)
      .catch((err) => console.error("Erreur dashboard user:", err));
  }, []);

  return (
    <>
      <PageMeta
        title="React.js User Dashboard"
        description="Dashboard utilisateur avec KPIs, graphiques et historique."
      />

      <div className="grid grid-cols-12 gap-6">
        {/* KPIs */}
        <div className="col-span-12">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <UserKPIs kpis={data.kpis} />
            </div>
          )}
        </div>
{/* History Table */}
        <div className="col-span-12">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <HistorySection history={data.history} />
            </div>
          )}
        </div>
        {/* Tests per Month */}
        <div className="col-span-12 xl:col-span-12">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <TestsPerMonthChart testsPerMonth={data.tests_per_month} />
            </div>
          )}
        </div>

        {/* Mean Prediction Over Time */}
        <div className="col-span-12 xl:col-span-6">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <MeanPredictionChart history={data.history} />
            </div>
          )}
        </div>

        {/* Prediction Range per File */}
        <div className="col-span-12 xl:col-span-6">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <PredictionRangeChart history={data.history} />
            </div>
          )}
        </div>

        {/* Rows per File */}
        <div className="col-span-12 xl:col-span-6">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <RowsPerFileChart history={data.history} />
            </div>
          )}
        </div>

        {/* Dataset Usage */}
        <div className="col-span-12 xl:col-span-6">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <DatasetUsageChart history={data.history} />
            </div>
          )}
        </div>

        
      </div>
    </>
  );
}
