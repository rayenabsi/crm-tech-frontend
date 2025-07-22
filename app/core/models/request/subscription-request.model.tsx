import {PaymentMethod, SubscriptionPeriod} from "@/app/core/models/subscription.model";

export interface CreateSubscriptionRequest {
  period: SubscriptionPeriod;
  providerId: number;
  productIds: number[];
  billing: {
    amount: number;
    paymentMethod: PaymentMethod;
    currency: string;
    transactionId?: string;
  };
}
