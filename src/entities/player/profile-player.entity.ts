export interface ProfilePlayer {
  id: string;
  firstname: string;
  lastname: string;
  birthDate: string;
  rg?: string;
  cpf?: string;
  phoneNumber?: string;
  address?: string;
  addressNumber?: string;
  addressNeighborhood?: string;
  addressComplement?: string;
  postcode?: string;
  college?: string;
  collegeAddress?: string;
  collegeNeighborhood?: string;
  collegeComplement?: string;
  collegePostcode?: string;
  collegePhone?: string;
  collegeSeries?: string;
  collegeTime?: string;
  origin?: string;
  registrationId?: string;
  isDeleted?: boolean;
  inactiveSince?: string | null;
  turma?: string | null;
  paymentPlan?: PaymentPlan | null;
}

export type PaymentPlan = "PLANO_2X" | "PLANO_3X";
