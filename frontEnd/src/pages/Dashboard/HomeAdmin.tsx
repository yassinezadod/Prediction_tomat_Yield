import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart copy";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { AdminDashboardResponse, AdminUserHistoryItem } from "../../types";
import { dashboardService } from "../../services/DashboardService ";
import AdminKPIs from "../../components/ecommerce/AdminKPIs";
import HistorySection from "../../components/ecommerce/HistorySection";
import TestsPerMonthChart from "../../components/ecommerce/TestsPerMonthChart";
import MeanPredictionChart from "../../components/ecommerce/MeanPredictionChart";
import PredictionRangeChart from "../../components/ecommerce/PredictionRangeChart";
import RowsPerFileChart from "../../components/ecommerce/RowsPerFileChart";
import HistoryAdminUsers from "../../components/ecommerce/HistoryAdminUsers";

export default function HomeAdmin() {
    const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [usersHistory, setUsersHistory] = useState<AdminUserHistoryItem[]>([]);

    useEffect(() => {
  // Charger le dashboard général
  dashboardService
    .getAdminDashboard()
    .then((res) => {
      console.log("Dashboard admin:", res);
      setData(res);
    })
    .catch((err) => console.error("Erreur dashboard admin:", err));

  // Charger l'historique des utilisateurs
  dashboardService
    .getAdminUsersHistory()
    .then((res) => {
      console.log("Historique des utilisateurs:", res.users_history);
      setUsersHistory(res.users_history);
    })
    .catch((err) =>
      console.error("Erreur récupération historique users:", err)
    );
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
              <AdminKPIs kpis={data.kpis} />
            </div>
          )}
          
        </div>


        {/* // History Table*/}
   <div className="col-span-12">
          {data && (
            <div className="rounded-2xl bg-white shadow-md p-6">
              <HistoryAdminUsers history={usersHistory} />
            </div>
          )}
        </div> 

      </div>
    </>
    
  );
}


