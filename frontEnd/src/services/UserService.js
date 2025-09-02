import api from './api';

class UserService {
  // Obtenir tous les utilisateurs
  async getAllUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtenir un utilisateur par ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Supprimer un utilisateur
  async deleteUser(id, password) {
    try {
      const response = await api.delete(`/users/${id}`, {
        data: { password }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mettre à jour le mot de passe
  async updatePassword(id, oldPassword, newPassword) {
    try {
      const response = await api.put(`/users/${id}/updatepassword`, {
        old_password: oldPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data.message || 'Une erreur est survenue',
        status: error.response.status
      };
    }
    return {
      message: 'Une erreur inattendue est survenue',
      status: 0
    };
  }
}

export default new UserService();