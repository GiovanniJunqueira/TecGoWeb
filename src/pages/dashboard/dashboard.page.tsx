import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import type { DashboardSummary } from "@/entities/dashboard/dashboard.entity";
import { toast } from "sonner";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(currentMonth());

  async function load(targetMonth = month) {
    try {
      setLoading(true);
      setError(false);
      const data = await DashboardService.getSummary(targetMonth);
      setSummary(data);
    } catch {
      setError(true);
      toast.error("Não foi possível carregar o dashboard");
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
        <Label className="text-2xl font-semibold">Visão geral da escolinha</Label>
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Mês</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {loading && <div>Carregando...</div>}

      {!loading && error && (
        <div className="rounded border p-4 flex flex-col items-start gap-3">
          <span className="text-sm text-muted-foreground">
            Não foi possível carregar os indicadores do dashboard.
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
              <span className="text-sm text-muted-foreground">Total de alunos</span>
              <span className="text-2xl font-bold">{summary.totalPlayers}</span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Jogos no mês</span>
              <span className="text-2xl font-bold">{summary.totalGames}</span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos no mês</span>
              <span className="text-2xl font-bold">
                {summary.totalPaymentsThisMonth}
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos em dia</span>
              <span className="text-2xl font-bold text-emerald-500">
                {summary.totalPaymentsPaidThisMonth}
              </span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos pendentes</span>
              <span className="text-2xl font-bold text-red-500">
                {summary.totalPaymentsPendingThisMonth}
              </span>
            </div>
          </section>
        </>
      )}
    </LayoutContent>
  );
}
