import axiosInstance from "@/app/core/services/axios-instance";
import {Role, User} from "@/app/core/models/user.model";
import {CreateClientRequest, UpdateClientRequest} from "@/app/core/models/request/client-request.model";

export const createClient = async (request: CreateClientRequest) => {
  const res = await axiosInstance.post<User>('/users/client', request);
  return res.data;
};

export const updateClient = async (id: number, request: UpdateClientRequest) => {
  const res = await axiosInstance.put<User>(`/users/client/${id}`, request);
  return res.data;
};

export const deleteUser = async (id: number) => {
  await axiosInstance.delete(`/users/${id}`);
};

export const getUsersByRole = async (role: Role) => {
  const res = await axiosInstance.get<User[]>(`/users/role/${role}`);
  return res.data;
};

export const getAllClients = async () => {
  return getUsersByRole(Role.CLIENT);
};
