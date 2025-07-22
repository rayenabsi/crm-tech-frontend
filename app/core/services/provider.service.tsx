import axiosInstance from "@/app/core/services/axios-instance";
import {Provider} from "@/app/core/models/provider.model";
import {CreateProviderRequest, UpdateProviderRequest} from "@/app/core/models/request/provider-request.model";

export const createProvider = async (request: CreateProviderRequest) => {
  const res = await axiosInstance.post<Provider>('/providers', request);
  return res.data;
};

export const updateProvider = async (id: number, request: UpdateProviderRequest) => {
  const res = await axiosInstance.put<Provider>(`/providers/${id}`, request);
  return res.data;
};

export const deleteProvider = async (id: number) => {
  await axiosInstance.delete(`/providers/${id}`);
};

export const getAllProviders = async () => {
  const res = await axiosInstance.get<Provider[]>('/providers/');
  return res.data;
};
