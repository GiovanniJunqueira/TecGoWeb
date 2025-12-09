import { api } from "@/config";
import type { Payment } from "@/entities/payment/payment.entity";

export class PaymentService {
  public static async create(playerId: string, month: string): Promise<Payment> {
    const { data } = await api.post<Payment>("/api/payments/create", null, {
      params: { playerId, month },
    });
    return data;
  }

  public static async markAsPaid(id: string): Promise<Payment> {
    const { data } = await api.put<Payment>(`/api/payments/${id}/pay`);
    return data;
  }

  public static async getByMonth(month: string): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>(`/api/payments/month/${month}`);
    return data;
  }

  public static async getByPlayer(playerId: string): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>(`/api/payments/player/${playerId}`);
    return data;
  }

  public static async getPendingByMonth(month: string): Promise<Payment[]> {
    const { data } = await api.get<Payment[]>(`/api/payments/month/${month}/pending`);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/payments/${id}`);
  }
}
