import { api } from "@/config";
import type { PaymentPlan } from "@/entities/paymentplan/payment-plan.entity";

export interface PaymentPlanPayload {
  name: string;
  priceOnTime: number;
  priceLate: number;
}

export class PaymentPlanService {
  public static async findAll(status: "ATIVOS" | "INATIVOS" = "ATIVOS"): Promise<PaymentPlan[]> {
    const { data } = await api.get<PaymentPlan[]>("/api/payment-plans", { params: { status } });
    return data;
  }

  public static async findById(id: string): Promise<PaymentPlan> {
    const { data } = await api.get<PaymentPlan>(`/api/payment-plans/${id}`);
    return data;
  }

  public static async create(payload: PaymentPlanPayload): Promise<PaymentPlan> {
    const { data } = await api.post<PaymentPlan>("/api/payment-plans", payload);
    return data;
  }

  public static async update(id: string, payload: PaymentPlanPayload): Promise<PaymentPlan> {
    const { data } = await api.put<PaymentPlan>(`/api/payment-plans/${id}`, payload);
    return data;
  }

  public static async deactivate(id: string): Promise<void> {
    await api.put(`/api/payment-plans/${id}/inativar`);
  }

  public static async reactivate(id: string): Promise<void> {
    await api.put(`/api/payment-plans/${id}/reativar`);
  }
}
