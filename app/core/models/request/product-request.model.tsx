export interface CreateProductRequest {
  providerId: number;
  name: string;
  description?: string;
  price: number;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
}
