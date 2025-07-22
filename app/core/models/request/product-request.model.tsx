export interface CreateProductRequest {
  providerId: string;
  name: string;
  description?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
}
