// src/services/dashboardService.ts
import { AdminDashboardResponse, AdminUsersHistoryResponse, UserDashboardResponse } from "../types";
import { apiClient } from "./api";



class DashboardService {
  async getUserDashboard(): Promise<UserDashboardResponse> {
    return await apiClient.get<UserDashboardResponse>("/users/dashboard/user");
  }

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    return await apiClient.get<AdminDashboardResponse>("/users/dashboard/admin");
  }


     // Récupérer l'historique complet de tous les users pour l'admin
  async getAdminUsersHistory(): Promise<AdminUsersHistoryResponse> {
    return apiClient.get<AdminUsersHistoryResponse>(
      "/users/dashboard/admin/users/history"
    ); // pas de .data ici
  }
}

export const dashboardService = new DashboardService();
