import { api } from "@/config";
import type { Payment, PaymentMethod } from "@/entities/payment/payment.entity";

export interface PaymentSearchParams {
  month?: string;
  pending?: boolean;
  search?: string;
}

export class PaymentService {
  public static async create(playerId: string, month: string): Promise<Payment> {
    const { data } = await api.post<Payment>("/api/payments/create", null, {
      params: { playerId, month },
    });
    return data;
  }

  public static async markAsPaid(id: string, paymentMethod: PaymentMethod, paidAt?: string): Promise<Payment> {
    const { data } = await api.put<Payment>(`/api/payments/${id}/pay`, { paymentMethod, paidAt: paidAt || undefined });
    return data;
  }

  public static async editPayment(id: string, payload: { paidAt?: string; amount?: number }): Promise<Payment> {
    const { data } = await api.put<Payment>(`/api/payments/${id}/edit`, payload);
    return data;
  }

  public static async search(params: PaymentSearchParams): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>("/api/payments", { params });
    return data;
  }

  public static async getByPlayer(playerId: string): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>(`/api/payments/player/${playerId}`);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/payments/${id}`);
  }
}
