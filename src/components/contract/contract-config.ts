import type { School } from "@/entities/school/scholl.entity";

/**
 * Dados da escola que aparecem na ficha e no contrato. O modelo padrão usa o que estiver no
 * cadastro da escola; o que o cadastro não tem (representante legal, seguradora...) vem dos
 * ajustes por escola abaixo. Uma escola com modelo de contrato próprio ganha um template novo.
 */
export interface ContractConfig {
  title: string;
  legalName: string;
  addressLine: string;
  phone?: string;
  cnpj?: string;
  legalRepresentative?: string;
  city: string;
  state: string;
  unitName?: string;
  dueDay: number;
  insuranceCompany?: string;
  insuranceCoverage?: string;
  adjustmentMonth: string;
  paymentMethod: string;
  forum: string;
}

const SCHOOL_OVERRIDES: Record<string, Partial<ContractConfig>> = {
  // Tubarões da Bola
  "a7dadde2-49f4-499d-82c4-1d5cb79cddc7": {
    title: "E.F. Tubarões da Bola",
    legalName: "Escola de Futebol Tubarões da Bola",
    addressLine: "Rua Dr. Armando Fajardo, 20 – Jd. São Bernardo – São Paulo/SP",
    phone: "(11) 99440-0950",
    cnpj: "45.419.567/0001-35",
    legalRepresentative: "Marco Aurelio Junqueira da Silva",
    unitName: "Vila Friburgo",
    insuranceCompany: "SEGASP",
    insuranceCoverage: "R$ 1.000,00",
  },
};

function validOrUndefined(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "0" ? trimmed : undefined;
}

export function getContractConfig(school: School | null): ContractConfig {
  const name = school?.name?.trim() || "Escola de Futebol";
  const city = validOrUndefined(school?.city) ?? "";
  const address = validOrUndefined(school?.address);

  const defaults: ContractConfig = {
    title: name,
    legalName: name,
    addressLine: [address, city].filter(Boolean).join(" – "),
    cnpj: validOrUndefined(school?.cnpj),
    city,
    state: "SP",
    dueDay: 10,
    adjustmentMonth: "Abril",
    paymentMethod: "Pix",
    forum: city ? `${city}/SP` : "",
  };

  return { ...defaults, ...(school?.id ? SCHOOL_OVERRIDES[school.id] : undefined) };
}
