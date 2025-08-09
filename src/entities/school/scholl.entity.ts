export class School {
  id?: number;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  logoUrl: string;
  active: boolean;

  constructor(data: School) {
    this.id = data.id;
    this.name = data.name;
    this.cnpj = data.cnpj;
    this.address = data.address;
    this.city = data.city;
    this.logoUrl = data.logoUrl;
    this.active = data.active;
  }
}
