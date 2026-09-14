import { api } from "@/config";
import type { PlayerFormData } from "@/validators";

export class PlayerService {
  public static async create(payload: PlayerFormData) {
    const { data } = await api.post("/player/createPlayer", payload);
    return data;
  }

  public static async findAll(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }) {
    const { page = 0, size = 10, sort = "firstname,asc", search } = params || {};
    const { data } = await api.get("/player/findAll", {
      params: { page, size, sort, search: search || undefined },
    });
    return data;
  }

  public static async findById(id: string) {
    const { data } = await api.get(`/player/findById/${id}`);
    return data;
  }

  public static async update(id: string, payload: PlayerFormData) {
    const { data } = await api.put(`/player/${id}`, payload);
    return data;
  }

  public static async softDelete(id: string) {
    const { data } = await api.delete(`/player/deletPlayer/${id}`);
    return data;
  }

  public static async findAllInactive(params?: {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }) {
    const { page = 0, size = 10, sort = "firstname,asc", search } = params || {};
    const { data } = await api.get("/player/findAllInativos", {
      params: { page, size, sort, search: search || undefined },
    });
    return data;
  }

  public static async reactivate(id: string) {
    const { data } = await api.put(`/player/reativar/${id}`);
    return data;
  }

  public static async hardDelete(id: string) {
    await api.delete(`/player/excluirPermanente/${id}`);
  }
}
