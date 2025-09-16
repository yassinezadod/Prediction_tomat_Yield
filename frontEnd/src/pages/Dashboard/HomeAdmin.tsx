
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { AdminDashboardResponse, AdminUserHistoryItem } from "../../types";
import { dashboardService } from "../../services/DashboardService ";
import AdminKPIs from "../../components/ecommerce/AdminKPIs";

import HistoryAdminUsers from "../../components/ecommerce/HistoryAdminUsers";
import PredictionsTimelineChart from "../../components/ecommerce/PredictionsTimelineChart";
import TopActiveUsersChart from "../../components/ecommerce/TopActiveUsersChart";
import AdminComparisonsRadarChart from "../../components/ecommerce/AdminComparisonsRadarChart";
import PredictionsPerMonthChart from "../../components/ecommerce/PredictionsPerMonthChart ";
import AdminActivityChart from "../../components/ecommerce/AdminActivityChart";
import ComparisonsTable from "../../components/ecommerce/ComparisonsTable";
export default function HomeAdmin() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [usersHistory, setUsersHistory] = useState<AdminUserHistoryItem[]>([]);

  useEffect(() => {
    dashboardService.getAdminDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error(err));

    dashboardService.getAdminUsersHistory()
      .then((res) => setUsersHistory(res.users_history))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <PageMeta
        title="React.js User Dashboard"
        description="Dashboard utilisateur avec KPIs, graphiques et historique."
      />

      <div className="grid grid-cols-12 gap-6">

        {/* KPIs */}
        {data && (
          <div className="col-span-12">
            <div className="rounded-2xl bg-white shadow-md p-6">
              <AdminKPIs kpis={data.kpis} />
            </div>
          </div>
        )}

        {/* Graphiques principaux */}
        {data && (
          <>
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-2xl bg-white shadow-md p-6">
                <PredictionsPerMonthChart timeline={data.timeline} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-2xl bg-white shadow-md p-6">
                <AdminActivityChart adminActivity={data.admin_activity} />
              </div>
            </div>
          </>
        )}

       

     
        

        {/* Comparisons Table */}
        {data && (
        <div className="col-span-12">
          <div className="rounded-2xl bg-white shadow-md p-6">
              <ComparisonsTable comparisons={data.comparisons} />
          </div>
        </div>
    )}


{/* Graphiques principaux */}
        {data && (
          <>
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-2xl bg-white shadow-md p-6">
              <AdminComparisonsRadarChart comparisons={data.comparisons} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-2xl bg-white shadow-md p-6">
 <HistoryAdminUsers history={usersHistory} />              </div>
            </div>
          </>
        )}



      
        

      </div>
    </>
  );
}
