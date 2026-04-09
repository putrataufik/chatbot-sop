export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  admin_level?: number;
  last_login?: string;
  created_at: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}