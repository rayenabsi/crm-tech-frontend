export interface CreateProductRequest {
  providerId: number;
  name: string;
  description?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
}
