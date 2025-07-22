import axiosInstance from "@/app/core/services/axios-instance";
import {CreateSubscriptionRequest} from "@/app/core/models/request/subscription-request.model";
import {Subscription} from "@/app/core/models/subscription.model";

export const createSubscription = async (request: CreateSubscriptionRequest) => {
  const res = await axiosInstance.post<Subscription>('/subscriptions', request);
  return res.data;
};

export const getAllSubscriptions = async () => {
  const res = await axiosInstance.get<Subscription[]>('/subscriptions/');
  return res.data;
};

export const getSubscriptionsByUser = async (userId: number) => {
  const res = await axiosInstance.get<Subscription[]>(`/subscriptions/user/${userId}`);
  return res.data;
};
