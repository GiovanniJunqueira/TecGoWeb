import { api } from "@/config";
import type { FinanceiroSummary } from "@/entities/financeiro/financeiro.entity";

export class FinanceiroService {
  public static async getSummary(month?: string): Promise<FinanceiroSummary> {
    const { data } = await api.get<FinanceiroSummary>("/api/financeiro/resumo", {
      params: { month: month || undefined },
    });
    return data;
  }
}
