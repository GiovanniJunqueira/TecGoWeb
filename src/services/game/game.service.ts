import { api } from "@/config";
import type { Game, GameCategory, GameType } from "@/entities/game/game.entity";

export interface GamePayload {
  type: GameType;
  category: GameCategory;
  opponent: string;
  date: string;
  homeScore: number;
  awayScore: number;
  location?: string;
  players: {
    playerId: string;
    goals: number;
    starter: boolean;
    notes?: string;
  }[];
}

export class GameService {
  public static async create(payload: GamePayload): Promise<Game> {
    const { data } = await api.post<Game>("/api/games", payload);
    return data;
  }

  public static async update(id: string, payload: GamePayload): Promise<Game> {
    const { data } = await api.put<Game>(`/api/games/${id}`, payload);
    return data;
  }

  public static async updateAttendance(
    id: string,
    entries: { playerId: string; attended: boolean }[]
  ): Promise<Game> {
    const { data } = await api.put<Game>(`/api/games/${id}/chamada`, entries);
    return data;
  }

  public static async findAll(params?: {
    type?: GameType;
    category?: GameCategory;
    startDate?: string;
    endDate?: string;
  }): Promise<Game[]> {
    const { data } = await api.get<Game[]>("/api/games", { params });
    return data;
  }

  public static async findById(id: string): Promise<Game> {
    const { data } = await api.get<Game>(`/api/games/${id}`);
    return data;
  }

  public static async findByPlayer(playerId: string): Promise<Game[]> {
    const { data } = await api.get<Game[]>(`/api/games/player/${playerId}`);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/games/${id}`);
  }
}
