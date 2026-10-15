import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinanceiroService } from "@/services/financeiro/financeiro.service";
import type { FinanceiroSummary, LedgerCategoryTotal, LedgerType } from "@/entities/financeiro/financeiro.entity";
import { LedgerEntryDialog } from "@/components/financeiro/ledger-entry-dialog";
import { toast } from "sonner";

const paymentMethodLabels: Record<string, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
};

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  if (!year || !m) return month;
  const label = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface ReportRow {
  label: string;
  total: number;
  count?: number;
}

function ReportTable({ title, rows, total, tone }: { title: string; rows: ReportRow[]; total: number; tone: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground">Nenhum lançamento neste mês</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <td className="p-3">
                    {row.label}
                    {row.count !== undefined && (
                      <span className="text-xs text-muted-foreground"> ({row.count})</span>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">{formatPrice(row.total)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-muted/50">
            <tr>
              <td className="p-3 font-semibold">Total</td>
              <td className={`p-3 text-right font-semibold whitespace-nowrap ${tone}`}>{formatPrice(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function toRows(items: LedgerCategoryTotal[]): ReportRow[] {
  return items.map((i) => ({ label: i.categoryName, total: i.total, count: i.count }));
}

export default function FinanceiroPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinanceiroSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonth());
  const [entryType, setEntryType] = useState<LedgerType | null>(null);

  async function load(targetMonth = month) {
    try {
      setLoading(true);
      setError(false);
      const data = await FinanceiroService.getSummary(targetMonth);
      setSummary(data);
    } catch {
      setError(true);
      toast.error("Não foi possível carregar o financeiro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const entradasRows: ReportRow[] = summary
    ? [
        { label: "Mensalidades", total: summary.mensalidadesRecebidas },
        { label: "Vendas de produtos", total: summary.vendasTotal, count: summary.vendasQtd },
        ...toRows(summary.entradasPorCategoria ?? []),
      ]
    : [];

  return (
    <LayoutContent className="gap-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #financeiro-print-report, #financeiro-print-report * { visibility: visible; }
          #financeiro-print-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <Label className="text-2xl font-semibold">Financeiro</Label>
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Mês</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setEntryType("ENTRADA")}>Nova entrada</Button>
        <Button variant="outline" onClick={() => setEntryType("SAIDA")}>
          Nova saída
        </Button>
        <Button variant="outline" onClick={() => navigate("/financeiro/lancamentos")}>
          Ver entradas e saídas
        </Button>
        <Button variant="outline" onClick={() => window.print()} disabled={!summary}>
          Imprimir relatório
        </Button>
      </div>

      {loading && <div>Carregando...</div>}

      {!loading && error && (
        <div className="rounded-xl border p-4 flex flex-col items-start gap-3">
          <span className="text-sm text-muted-foreground">
            Não foi possível carregar os dados financeiros.
          </span>
          <button
            className="text-sm underline underline-offset-4 text-primary"
            onClick={() => load()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && summary && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Total de entradas</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(summary.totalEntradasMes ?? 0)}
              </span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Total de saídas</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatPrice(summary.saidasTotal ?? 0)}</span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Saldo do mês</span>
              <span
                className={`text-2xl font-bold ${(summary.saldoMes ?? 0) < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {formatPrice(summary.saldoMes ?? 0)}
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Mensalidades recebidas</span>
              <span className="text-xl font-bold">{formatPrice(summary.mensalidadesRecebidas)}</span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">
                Mensalidades pendentes ({summary.mensalidadesPendentesQtd})
              </span>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                ~{formatPrice(summary.mensalidadesPendentesEstimativa)}
              </span>
              <span className="text-xs text-muted-foreground">
                Estimativa com base no valor atual do plano de cada aluno. Não entra no saldo.
              </span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">
                Vendas de produtos ({summary.vendasQtd})
              </span>
              <span className="text-xl font-bold">{formatPrice(summary.vendasTotal)}</span>
            </div>
          </section>

          <section id="financeiro-print-report" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Relatório do mês — {formatMonthLabel(month)}</h2>
              <p className="text-sm text-muted-foreground">
                Saldo: {formatPrice(summary.saldoMes ?? 0)} (entradas {formatPrice(summary.totalEntradasMes ?? 0)} − saídas{" "}
                {formatPrice(summary.saidasTotal ?? 0)})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReportTable
                title="Entradas por categoria"
                rows={entradasRows}
                total={summary.totalEntradasMes ?? 0}
                tone="text-emerald-600 dark:text-emerald-400"
              />
              <ReportTable
                title="Saídas por categoria"
                rows={toRows(summary.saidasPorCategoria ?? [])}
                total={summary.saidasTotal ?? 0}
                tone="text-red-600 dark:text-red-400"
              />
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-lg font-semibold">Vendas recentes</Label>
            <div className="overflow-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Produto</th>
                    <th className="text-left p-3">Comprador</th>
                    <th className="text-left p-3">Forma de pagto.</th>
                    <th className="text-left p-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.vendasRecentes.length === 0 ? (
                    <tr>
                      <td className="p-3" colSpan={5}>
                        Nenhuma venda neste mês
                      </td>
                    </tr>
                  ) : (
                    summary.vendasRecentes.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-3">{s.soldAt}</td>
                        <td className="p-3">{s.productName}</td>
                        <td className="p-3">{s.buyerName ?? "-"}</td>
                        <td className="p-3">
                          {paymentMethodLabels[s.paymentMethod] ?? s.paymentMethod}
                        </td>
                        <td className="p-3">{formatPrice(s.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <LedgerEntryDialog
        open={entryType !== null}
        type={entryType ?? "ENTRADA"}
        entry={null}
        onOpenChange={(open) => !open && setEntryType(null)}
        onSaved={() => load()}
      />
    </LayoutContent>
  );
}
