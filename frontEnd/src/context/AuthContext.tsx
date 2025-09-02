// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  UpdatePasswordRequest, 
  ForgotPasswordRequest,
  AuthContextType 
} from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation au chargement du composant
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = authService.getToken();
      const storedUser = authService.getCurrentUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      // En cas d'erreur, nettoyer le localStorage
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.access_token && response.user) {
        setToken(response.access_token);
        setUser(response.user);
        authService.setCurrentUser(response.user);
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.register(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);
    authService.logout();
    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  const updatePassword = async (passwords: UpdatePasswordRequest): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setIsLoading(true);
      await authService.updatePassword(user.id, passwords);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Nouvelle méthode pour mettre à jour les informations utilisateur
  const updateUser = async (userData: Partial<User>, password: string): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateUser(user.id, { ...userData, password });
      
      // Mettre à jour l'utilisateur dans le contexte et le localStorage
      setUser(updatedUser);
      authService.setCurrentUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updatePassword,
    updateUser,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook pour vérifier si l'utilisateur est admin
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

// Hook pour vérifier si l'utilisateur est connecté
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};