import axiosInstance from "@/app/core/services/axios-instance";
import {Product} from "@/app/core/models/product.model";
import {CreateProductRequest, UpdateProductRequest} from "@/app/core/models/request/product-request.model";

export const createProduct = async (request: CreateProductRequest) => {
  const res = await axiosInstance.post<Product>('/products', request);
  return res.data;
};

export const updateProduct = async (id: number, request: UpdateProductRequest) => {
  const res = await axiosInstance.put<Product>(`/products/${id}`, request);
  return res.data;
};

export const deleteProduct = async (id: number) => {
  await axiosInstance.delete(`/products/${id}`);
};

export const getAllProducts = async () => {
  const res = await axiosInstance.get<Product[]>('/products/');
  return res.data;
};

export const getProductsByProvider = async (providerId: number) => {
  const res = await axiosInstance.get<Product[]>(`/products/provider/${providerId}`);
  return res.data;
};
