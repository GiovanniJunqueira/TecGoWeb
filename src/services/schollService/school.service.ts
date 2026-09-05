import { api } from "@/config";
import type { School } from "@/entities/school/scholl.entity";

export interface SchoolCreatePayload {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  logo?: File | null;
}

export class SchoolService {

  public static async get(): Promise<School> {
    const { data } = await api.get<School>("/school");
    return data;
  }

  public static async create(payload: SchoolCreatePayload): Promise<School> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("cnpj", payload.cnpj);
    formData.append("address", payload.address);
    formData.append("city", payload.city);
    if (payload.logo) {
      formData.append("logo", payload.logo);
    }

    const { data } = await api.post<School>("/school", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  public static async update(payload: Omit<SchoolCreatePayload, "cnpj">): Promise<School> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("address", payload.address);
    formData.append("city", payload.city);
    if (payload.logo) {
      formData.append("logo", payload.logo);
    }

    const { data } = await api.put<School>("/school", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

}
