export type TeacherStatus = "ACTIVE" | "INACTIVE";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  admissionDate: string;
  status: TeacherStatus;
  salary: number | null;
  notes: string | null;
}
