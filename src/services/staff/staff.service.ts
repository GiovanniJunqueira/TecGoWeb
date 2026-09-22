import { api } from "@/config";
import type { Permission, StaffMember, StaffRoleType, StaffStatus } from "@/entities/staff/staff.entity";

export interface StaffCreatePayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  staffRole: StaffRoleType;
  customRoleLabel: string | null;
  phone: string | null;
  document: string | null;
  admissionDate: string | null;
  salary: number | null;
  notes: string | null;
  permissions: Permission[];
}

export interface StaffUpdatePayload {
  firstname: string;
  lastname: string;
  password?: string;
  staffRole: StaffRoleType;
  customRoleLabel: string | null;
  phone: string | null;
  document: string | null;
  admissionDate: string | null;
  salary: number | null;
  notes: string | null;
  status: StaffStatus;
  permissions: Permission[];
}

export class StaffService {
  public static async findAll(): Promise<StaffMember[]> {
    const { data } = await api.get<StaffMember[]>("/api/staff");
    return data;
  }

  public static async findById(id: string): Promise<StaffMember> {
    const { data } = await api.get<StaffMember>(`/api/staff/${id}`);
    return data;
  }

  public static async create(payload: StaffCreatePayload): Promise<StaffMember> {
    const { data } = await api.post<StaffMember>("/api/staff", payload);
    return data;
  }

  public static async update(id: string, payload: StaffUpdatePayload): Promise<StaffMember> {
    const { data } = await api.put<StaffMember>(`/api/staff/${id}`, payload);
    return data;
  }

  public static async delete(id: string): Promise<void> {
    await api.delete(`/api/staff/${id}`);
  }
}
