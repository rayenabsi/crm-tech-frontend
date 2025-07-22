export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  enabled: boolean;
}

export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  TECH_AGENT = 'TECH_AGENT',
  SALES_AGENT = 'SALES_AGENT'
}
