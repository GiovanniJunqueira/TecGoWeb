import { api } from "@/config";
import type { Sale, SaleCreatePayload } from "@/entities/product/product.entity";

export class SaleService {
  public static async findAll(month?: string): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>("/api/products/sales", {
      params: { month: month || undefined },
    });
    return data;
  }

  public static async create(payload: SaleCreatePayload): Promise<Sale> {
    const { data } = await api.post<Sale>("/api/products/sales", payload);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/products/sales/${id}`);
  }
}
