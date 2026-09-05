import { api } from "@/config";
import type { Admin, AdminCreatePayload } from "@/entities/admin/admin.entity";

export class AdminService {
  public static async create(payload: AdminCreatePayload): Promise<Admin> {
    const { data } = await api.post<Admin>("/admin", payload);
    return data;
  }
}
