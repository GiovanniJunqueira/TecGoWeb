import type { PaymentPlan } from "@/entities/paymentplan/payment-plan.entity";

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

export interface PlayerReport {
  id: string;
  firstname: string;
  lastname: string;
  registrationId?: string | null;
  turma?: string | null;
  birthDate?: string | null;
  rg?: string | null;
  cpf?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  college?: string | null;
  paymentPlanName?: string | null;
  responsibleNames?: string | null;
  aulaGrupoName?: string | null;
  isDeleted: boolean;
}
