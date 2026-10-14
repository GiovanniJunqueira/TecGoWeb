import { api } from "@/config";
import type {
  FinanceiroSummary,
  LedgerCategory,
  LedgerEntry,
  LedgerEntryPayload,
  LedgerType,
} from "@/entities/financeiro/financeiro.entity";

export class FinanceiroService {
  public static async getSummary(month?: string): Promise<FinanceiroSummary> {
    const { data } = await api.get<FinanceiroSummary>("/api/financeiro/resumo", {
      params: { month: month || undefined },
    });
    return data;
  }

  public static async findCategories(type: LedgerType): Promise<LedgerCategory[]> {
    const { data } = await api.get<LedgerCategory[]>("/api/financeiro/categorias", { params: { type } });
    return data;
  }

  public static async createCategory(payload: { name: string; type: LedgerType }): Promise<LedgerCategory> {
    const { data } = await api.post<LedgerCategory>("/api/financeiro/categorias", payload);
    return data;
  }

  public static async updateCategory(id: string, name: string): Promise<LedgerCategory> {
    const { data } = await api.put<LedgerCategory>(`/api/financeiro/categorias/${id}`, { name });
    return data;
  }

  public static async deactivateCategory(id: string): Promise<void> {
    await api.put(`/api/financeiro/categorias/${id}/inativar`);
  }

  public static async findEntries(params: {
    month?: string;
    type?: LedgerType;
    categoryId?: string;
  }): Promise<LedgerEntry[]> {
    const { data } = await api.get<LedgerEntry[]>("/api/financeiro/lancamentos", {
      params: {
        month: params.month || undefined,
        type: params.type || undefined,
        categoryId: params.categoryId || undefined,
      },
    });
    return data;
  }

  public static async createEntry(payload: LedgerEntryPayload): Promise<LedgerEntry> {
    const { data } = await api.post<LedgerEntry>("/api/financeiro/lancamentos", payload);
    return data;
  }

  public static async updateEntry(id: string, payload: LedgerEntryPayload): Promise<LedgerEntry> {
    const { data } = await api.put<LedgerEntry>(`/api/financeiro/lancamentos/${id}`, payload);
    return data;
  }

  public static async deleteEntry(id: string): Promise<void> {
    await api.delete(`/api/financeiro/lancamentos/${id}`);
  }
}
