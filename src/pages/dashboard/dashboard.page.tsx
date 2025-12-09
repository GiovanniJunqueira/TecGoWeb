import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import type { DashboardSummary } from "@/entities/dashboard/dashboard.entity";
import { toast } from "sonner";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await DashboardService.getSummary();
        setSummary(data);
      } catch {
        toast.error("Não foi possível carregar o dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">Visão geral da escolinha</Label>

      {loading && <div>Carregando...</div>}

      {!loading && summary && (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Total de alunos</span>
              <span className="text-2xl font-bold">{summary.totalPlayers}</span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Jogos cadastrados</span>
              <span className="text-2xl font-bold">{summary.totalGames}</span>
            </div>

            <div className="rounded border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos deste mês</span>
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
