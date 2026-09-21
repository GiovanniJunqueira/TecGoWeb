import { api } from "@/config";
import type { DashboardSummary } from "@/entities/dashboard/dashboard.entity";

export class DashboardService {
  public static async getSummary(month?: string): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>("/api/dashboard/summary", {
      params: { month: month || undefined },
    });
    return data;
  }
}
