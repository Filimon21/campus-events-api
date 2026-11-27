export interface User {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  refreshHash: string | null;
}