export type Role = "ADMIN" | "USER" | "RELATED";

export class User {
  id: string;
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  document: string;
  role: Role;

  constructor(data: User) {
    this.id = data.id;
    this.email = data.email;
    this.phone = data.phone;
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.document = data.document;
    this.role = data.role;
  }
}
