import { api } from "@/config";
import type { Responsible } from "@/entities/responsible/responsible.entity";

export class ResponsibleService {
  public static async findAll(params?: {
    name?: string;
    studentName?: string;
  }): Promise<Responsible[]> {
    const { data } = await api.get<Responsible[]>("/api/responsibles", { params });
    return data;
  }

  public static async findById(id: string): Promise<Responsible> {
    const { data } = await api.get<Responsible>(`/api/responsibles/${id}`);
    return data;
  }

  public static async create(payload: Omit<Responsible, "id">): Promise<Responsible> {
    const { data } = await api.post<Responsible>("/api/responsibles", payload);
    return data;
  }

  public static async update(id: string, payload: Omit<Responsible, "id">): Promise<Responsible> {
    const { data } = await api.put<Responsible>(`/api/responsibles/${id}`, payload);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/responsibles/${id}`);
  }

  public static async findByPlayer(playerId: string): Promise<Responsible[]> {
    const { data } = await api.get<Responsible[]>(`/api/responsibles/by-player/${playerId}`);
    return data;
  }

  public static async updateForPlayer(
    playerId: string,
    payload: { responsibleIds: string[] }
  ): Promise<void> {
    await api.put(`/api/responsibles/by-player/${playerId}`, payload);
  }
}
