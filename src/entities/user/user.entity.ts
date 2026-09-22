import type { Permission } from "@/entities/staff/staff.entity";

export type Role = "MASTER" | "ADMIN" | "PLAYER" | "STAFF";

export class User {
  id: string;
  email: string;
  phone?: string;
  firstname?: string;
  lastname?: string;
  document?: string;
  role: Role;
  permissions?: Permission[];

  constructor(data: User) {
    this.id = data.id;
    this.email = data.email;
    this.phone = data.phone;
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.document = data.document;
    this.role = data.role;
    this.permissions = data.permissions;
  }
}

export type UserPayload = User;
