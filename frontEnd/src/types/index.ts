// src/types/index.ts

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  verified?: boolean;
  firstname?: string;
  lastname?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
  
}
// 🔹 Définition du type de réponse attendu depuis l'API Flask
export interface UserCountResponse {
  total_users: number;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  bio?: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  access_token: string;
  user?: User;
}

export interface ForgotPasswordRequest {
  email: string;
  new_password: string;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ReverifyRequest {
  email: string;
}

// Course Types
export interface Course {
  _id?: string;
  courseID: string;
  title: string;
  description: string;
  credits: number;
  term: string;
}

// Email Types
export interface EmailRequest {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  name: string;
  company_name: string;
  sender_mail_id: string;
  button?: string;
  url?: string;
  attachments?: File[];
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}



// Ajoutez cette interface à votre fichier types.ts

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updatePassword: (passwords: UpdatePasswordRequest) => Promise<void>;
  updateUser: (userData: Partial<User>, password: string) => Promise<void>; // Nouvelle méthode
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
}



// Interfaces pour typer les données
export interface UserKpis {
  total_files: number;
  last_file: string | null;
  last_date: string | null;
  mean_pred: number | null;
}

export interface UserHistoryItem {
  dataset: string[];
  date: string;
  rows: number;
  mean_pred: number | null;
  min_pred: number | null;
  max_pred: number | null;
  download_link: string;
}
// Interfaces pour typer les données
export interface UserKpis {
  total_files: number;
  last_file: string | null;
  last_date: string | null;
  mean_pred: number | null;
}

export interface UserHistoryItem {
  dataset: string[];
  date: string;
  rows: number;
  mean_pred: number | null;
  min_pred: number | null;
  max_pred: number | null;
  download_link: string;
}

// Nouvelle interface pour les tests par mois
export interface TestsPerMonth {
  month: string;  // "2025-09"
  count: number;
}
export interface UserDashboardResponse {
  kpis: UserKpis;
  history: UserHistoryItem[];
  tests_per_month: TestsPerMonth[]; // <-- ajouté ici

}


// export interface AdminKpis {
//   total_users: number;
//   total_datasets: number;
//   last_dataset: {
//     file: string | null;
//     user_id: string | null;
//     date: string | null;
//   } | null;
//   problematic_datasets: number;
// }

// export interface AdminDatasetItem {
//   user_id: string;
//   datasets: string[];
//   date: string;
//   rows: number;
//   error: Record<string, number> | null;
// }

// export interface AdminDashboardResponse {
//   kpis: AdminKpis;
//   datasets: AdminDatasetItem[];
// }
// --- KPIs pour l’admin ---
export interface AdminKpis {
  total_users: number;
  total_datasets: number;
  total_predictions: number;
  total_logins: number;
  admin_predictions_count: number; // nombre de prédictions faites par l'admin connecté
  admin_logins_count: number;      // nombre de logins faits par l'admin connecté
  last_dataset: {
    file: string | null;
    user_id: string | null;
    date: string | null;
  } | null;
  top_active_users: {
    user_id: string;
    count: number;
  }[];
}

// --- Élément d’un dataset ---
export interface AdminDatasetItem {
  user_id: string;
  datasets: string[];
  date: string;
  rows: number;
  action_type: string;
}

// --- Élément d’un item de comparaison ---
export interface AdminComparisonItem {
  user_id: string;
  files: string[];
  description: string;
  global_metrics: Record<string, number>;
  statistics: Record<string, any>;
  columns_used: Record<string, any>;
  date: string;
}

// --- Élément de la timeline ---
export interface AdminTimelineItem {
  date: string;
  count: number;
}

// --- Réponse complète de l’API pour le dashboard admin ---
// --- Réponse complète de l’API pour le dashboard admin ---
export interface AdminDashboardResponse {
  kpis: AdminKpis;
  datasets: AdminDatasetItem[];
  comparisons: AdminComparisonItem[];
  timeline: AdminTimelineItem[];
  admin_activity: AdminActivityItem[];   // ✅ ajouté ici
}
// --- Élément de l’activité admin (logins par mois) ---
export interface AdminActivityItem {
  month: string; // ex: "2025-09"
  count: number;
}

export interface UserHistoryLog {
  action_type: string;
  description: string;
  date: string;
  files: string[];
  metrics: Record<string, number>;
}

export interface AdminUserHistoryItem {
  user_id: string;
  email: string;
  name: string;
  total_predictions: number;
  total_logins: number;
  history: UserHistoryLog[];
}

export interface AdminUsersHistoryResponse {
  users_history: AdminUserHistoryItem[];
}
