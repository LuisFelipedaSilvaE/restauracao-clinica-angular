import { UserRole } from './user-role.model';

export interface Usuario {
  id?: number;
  username: string;
  password?: string;
  role?: UserRole;
}
