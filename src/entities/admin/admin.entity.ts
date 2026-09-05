export interface AdminCreatePayload {
  email: string;
  password: string;
  phone: string;
  firstname: string;
  lastname: string;
  document: string;
  schoolId: string;
}

export interface Admin {
  id: string;
  email: string;
  role: string;
  phone: string;
  firstname: string;
  lastname: string;
  document: string;
  schoolId: string;
}
