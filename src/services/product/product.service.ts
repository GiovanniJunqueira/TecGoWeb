import { api } from "@/config";
import type { Product } from "@/entities/product/product.entity";

export interface ProductFormPayload {
  name: string;
  description: string;
  price: number;
  photoFile?: File | null;
}

export class ProductService {
  public static async findAll(status: "ATIVOS" | "INATIVOS" = "ATIVOS"): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/api/products", { params: { status } });
    return data;
  }

  public static async findById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/api/products/${id}`);
    return data;
  }

  public static async create(payload: ProductFormPayload): Promise<Product> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    if (payload.photoFile) {
      formData.append("photo", payload.photoFile);
    }

    const { data } = await api.post<Product>("/api/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  public static async update(id: string, payload: ProductFormPayload): Promise<Product> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("price", String(payload.price));
    if (payload.photoFile) {
      formData.append("photo", payload.photoFile);
    }

    const { data } = await api.put<Product>(`/api/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  public static async deactivate(id: string): Promise<void> {
    await api.put(`/api/products/${id}/inativar`);
  }

  public static async reactivate(id: string): Promise<void> {
    await api.put(`/api/products/${id}/reativar`);
  }
}
