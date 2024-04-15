export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  companyId: number;
  email: string;
  expiresIn: number;
  expiresAt: number;
}
