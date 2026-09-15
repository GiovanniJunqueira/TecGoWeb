import { api } from "@/config";
import type { AulaGrupo, AulaSessao } from "@/entities/aula/aula.entity";

export interface AulaGrupoPayload {
  name: string;
  playerIds: string[];
}

export class AulaGrupoService {
  public static async create(payload: AulaGrupoPayload): Promise<AulaGrupo> {
    const { data } = await api.post<AulaGrupo>("/api/aulas/grupos", payload);
    return data;
  }

  public static async findAll(): Promise<AulaGrupo[]> {
    const { data } = await api.get<AulaGrupo[]>("/api/aulas/grupos");
    return data;
  }

  public static async update(id: string, payload: AulaGrupoPayload): Promise<AulaGrupo> {
    const { data } = await api.put<AulaGrupo>(`/api/aulas/grupos/${id}`, payload);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/aulas/grupos/${id}`);
  }
}

export class AulaSessaoService {
  public static async create(grupoId: string, date: string): Promise<AulaSessao> {
    const { data } = await api.post<AulaSessao>(`/api/aulas/grupos/${grupoId}/sessoes`, { date });
    return data;
  }

  public static async findByGrupo(grupoId: string): Promise<AulaSessao[]> {
    const { data } = await api.get<AulaSessao[]>(`/api/aulas/grupos/${grupoId}/sessoes`);
    return data;
  }

  public static async findById(sessaoId: string): Promise<AulaSessao> {
    const { data } = await api.get<AulaSessao>(`/api/aulas/sessoes/${sessaoId}`);
    return data;
  }

  public static async updatePresenca(
    sessaoId: string,
    entries: { playerId: string; present: boolean }[]
  ): Promise<AulaSessao> {
    const { data } = await api.put<AulaSessao>(`/api/aulas/sessoes/${sessaoId}/chamada`, entries);
    return data;
  }

  public static async delete(sessaoId: string): Promise<void> {
    await api.delete(`/api/aulas/sessoes/${sessaoId}`);
  }
}
