// src/services/usersService.ts
import { apiClient } from "./api";

// Type pour la réponse de l'API
export interface UserCountResponse {
  total_users: number;
}

class UsersService {
  /**
   * Récupérer le nombre total d'utilisateurs
   */
  async getUserCount(): Promise<UserCountResponse> {
    return await apiClient.get<UserCountResponse>("/users/count");
  }
}

export const usersService = new UsersService();
