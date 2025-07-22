export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateClientRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
