// src/services/dashboardService.ts
import { AdminDashboardResponse, UserDashboardResponse } from "../types";
import { apiClient } from "./api";



class DashboardService {
  async getUserDashboard(): Promise<UserDashboardResponse> {
    return await apiClient.get<UserDashboardResponse>("/users/dashboard/user");
  }

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    return await apiClient.get<AdminDashboardResponse>("/users/dashboard/admin");
  }
}

export const dashboardService = new DashboardService();
