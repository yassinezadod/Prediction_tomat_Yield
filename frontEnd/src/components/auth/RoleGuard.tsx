// src/components/auth/RoleGuard.tsx

import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'user')[];
  fallback?: React.ReactNode;
}

/**
 * Composant pour contrôler l'affichage basé sur les rôles
 * Affiche le contenu seulement si l'utilisateur a le bon rôle
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { user } = useAuth();

  // Si pas d'utilisateur connecté, ne rien afficher
  if (!user) {
    return <>{fallback}</>;
  }

  // Si le rôle de l'utilisateur est dans les rôles autorisés
  if (allowedRoles.includes(user.role || 'user')) {
    return <>{children}</>;
  }

  // Sinon, afficher le fallback ou rien
  return <>{fallback}</>;
};

export default RoleGuard;