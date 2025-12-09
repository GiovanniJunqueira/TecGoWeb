import { api } from "@/config";
import type { Teacher, TeacherStatus } from "@/entities/teacher/teacher.entity";

export class TeacherService {
  public static async findAll(params?: {
    name?: string;
    status?: TeacherStatus;
  }): Promise<Teacher[]> {
    const { data } = await api.get<Teacher[]>("/api/teachers", { params });
    return data;
  }

  public static async findById(id: string): Promise<Teacher> {
    const { data } = await api.get<Teacher>(`/api/teachers/${id}`);
    return data;
  }

  public static async create(payload: Omit<Teacher, "id">): Promise<Teacher> {
    const { data } = await api.post<Teacher>("/api/teachers", payload);
    return data;
  }

  public static async update(id: string, payload: Omit<Teacher, "id">): Promise<Teacher> {
    const { data } = await api.put<Teacher>(`/api/teachers/${id}`, payload);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/teachers/${id}`);
  }
}
