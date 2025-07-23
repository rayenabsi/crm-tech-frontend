import {User} from "@/app/core/models/user.model";
import {Provider} from "@/app/core/models/provider.model";
import {Product} from "@/app/core/models/product.model";

export interface Subscription {
  id: number;
  period: SubscriptionPeriod;
  startDate: number;
  endDate: number;
  status: SubscriptionStatus;
  billing: Billing;
  user: User;
  provider: Provider;
  products: Product[];
}

export interface Billing {
  id: number;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentDate: number;
  currency: string;
}

export enum SubscriptionPeriod {
  ONE_MONTH = 'ONE_MONTH',
  THREE_MONTHS = 'THREE_MONTHS',
  SIX_MONTHS = 'SIX_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
  TWO_YEARS = 'TWO_YEARS'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL'
}
