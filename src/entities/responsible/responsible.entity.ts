export interface ResponsibleStudentSummary {
  id: string;
  firstname: string;
  lastname: string;
  registrationId: string | null;
}

export interface Responsible {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  addressNumber: string;
  addressNeighborhood: string;
  addressComplement: string;
  postcode: string;
  students: ResponsibleStudentSummary[];
}
