import {Provider} from "@/app/core/models/provider.model";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  provider: Provider;
}
