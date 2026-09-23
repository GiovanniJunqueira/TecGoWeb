import type { Sale } from "@/entities/product/product.entity";

export interface FinanceiroSummary {
  mensalidadesRecebidas: number;
  mensalidadesPendentesQtd: number;
  mensalidadesPendentesEstimativa: number;
  vendasTotal: number;
  vendasQtd: number;
  receitaTotalMes: number;
  vendasRecentes: Sale[];
}
