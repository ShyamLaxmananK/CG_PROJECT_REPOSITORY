export type UserRole = 'CUSTOMER' | 'OWNER' | 'ADMIN';

export interface AuthUser {
  id: number | null;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  username?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface AuthApiResponse {
  token?: string;
  jwtToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<AuthUser> & {
    role?: UserRole | `ROLE_${UserRole}`;
    roles?: Array<UserRole | `ROLE_${UserRole}`>;
  };
  id?: number;
  userId?: number;
  fullName?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: UserRole | `ROLE_${UserRole}`;
  roles?: Array<UserRole | `ROLE_${UserRole}`>;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  role: `ROLE_${UserRole}`;
}
