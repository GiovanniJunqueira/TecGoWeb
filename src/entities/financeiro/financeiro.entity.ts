import type { Sale } from "@/entities/product/product.entity";
import type { PaymentMethod } from "@/entities/payment/payment.entity";

export type LedgerType = "ENTRADA" | "SAIDA";

export interface LedgerCategory {
  id: string;
  name: string;
  type: LedgerType;
  active: boolean;
}

export interface LedgerEntry {
  id: string;
  type: LedgerType;
  categoryId: string;
  categoryName: string;
  amount: number;
  date: string;
  description: string | null;
  paymentMethod: PaymentMethod | null;
}

export interface LedgerEntryPayload {
  categoryId: string;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: PaymentMethod;
}

export interface LedgerCategoryTotal {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
}

export interface FinanceiroSummary {
  mensalidadesRecebidas: number;
  mensalidadesPendentesQtd: number;
  mensalidadesPendentesEstimativa: number;
  vendasTotal: number;
  vendasQtd: number;
  receitaTotalMes: number;
  vendasRecentes: Sale[];
  outrasEntradasTotal: number;
  entradasPorCategoria: LedgerCategoryTotal[];
  saidasTotal: number;
  saidasPorCategoria: LedgerCategoryTotal[];
  totalEntradasMes: number;
  saldoMes: number;
}
