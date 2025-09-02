// src/services/authService.ts

import { apiClient } from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ForgotPasswordRequest,
  UpdatePasswordRequest,
  ReverifyRequest,
  User 
} from '../types';

class AuthService {


// Supprimer utilisateur par email (admin)
// Supprimer utilisateur par email (admin)
  // Supprimer utilisateur par email (admin)
  async deleteUserAdminByEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/users/admin/by-email/${encodeURIComponent(email)}`);
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erreur lors de la suppression de l\'utilisateur'
      );
    }
  }

//  Mettre à jour utilisateur par email (admin)
  async updateUserAdminByEmail(email: string, updates: Partial<User>): Promise<{ message: string, user: User }> {
    try {
      const response = await apiClient.put<{ message: string; user: User }>(
        `/users/admin/by-email/${encodeURIComponent(email)}`,
        updates
      );
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Erreur lors de la mise à jour de l\'utilisateur'
      );
    }
  }

   // Mettre à jour un utilisateur (Admin) sans password
  async updateUserAdmin(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/admin/${id}`, userData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour par admin');
    }
  }

  // Supprimer un utilisateur (Admin) sans password
  async deleteUserAdmin(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/users/admin/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression par admin');
    }
  }
  // Connexion
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/users/login', credentials);
      
      if (response.access_token) {
        apiClient.setAuthToken(response.access_token);
      }
      
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  }

  // Inscription
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/users', userData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await apiClient.post('/users/signout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      apiClient.clearAuthToken();
    }
  }

  // Mot de passe oublié
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/users/forgot_password', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  }

  // Renvoyer email de vérification
  async reverifyEmail(data: ReverifyRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/users/reverify', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du renvoi de l\'email');
    }
  }

  // Récupérer tous les utilisateurs (Admin)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Utilisateur non trouvé');
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id: string, userData: Partial<User & { password: string }>): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, userData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  }

  // Mettre à jour le mot de passe
  async updatePassword(id: string, passwords: UpdatePasswordRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/users/${id}/updatepassword`, passwords);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id: string, password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/users/${id}`, {
        data: { password }
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Sauvegarder l'utilisateur dans le localStorage
  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export const authService = new AuthService();