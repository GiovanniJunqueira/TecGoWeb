import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FinanceiroService } from "@/services/financeiro/financeiro.service";
import type { FinanceiroSummary } from "@/entities/financeiro/financeiro.entity";
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

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinanceiroSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonth());

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

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Label className="text-2xl font-semibold">Financeiro</Label>
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Mês</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {loading && <div>Carregando...</div>}

      {!loading && error && (
        <div className="rounded border p-4 flex flex-col items-start gap-3">
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
            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Mensalidades recebidas</span>
              <span className="text-2xl font-bold text-emerald-500">
                {formatPrice(summary.mensalidadesRecebidas)}
              </span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">
                Mensalidades pendentes ({summary.mensalidadesPendentesQtd})
              </span>
              <span className="text-2xl font-bold text-red-500">
                ~{formatPrice(summary.mensalidadesPendentesEstimativa)}
              </span>
              <span className="text-xs text-muted-foreground">
                Estimativa com base no valor atual do plano de cada aluno
              </span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">
                Vendas de produtos ({summary.vendasQtd})
              </span>
              <span className="text-2xl font-bold">{formatPrice(summary.vendasTotal)}</span>
            </div>
          </section>

          <section className="rounded border p-4 bg-card">
            <span className="text-sm text-muted-foreground">Receita total do mês</span>
            <div className="text-3xl font-bold mt-1">{formatPrice(summary.receitaTotalMes)}</div>
          </section>

          <section className="space-y-4">
            <Label className="text-lg font-semibold">Vendas recentes</Label>
            <div className="overflow-auto rounded border">
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
    </LayoutContent>
  );
}
