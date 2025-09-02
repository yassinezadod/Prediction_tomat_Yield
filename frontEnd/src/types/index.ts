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