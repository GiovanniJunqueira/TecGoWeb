import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cake } from "lucide-react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import { PlayerService } from "@/services/player/player.service";
import type { Birthday } from "@/entities/player/profile-player.entity";
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
  const [birthdays, setBirthdays] = useState<Birthday[] | null>(null);
  const navigate = useNavigate();

  // Aniversariantes do dia: independente do mês escolhido; se não carregar, o quadro só não aparece.
  useEffect(() => {
    PlayerService.birthdaysToday()
      .then((data) => setBirthdays(data ?? []))
      .catch(() => setBirthdays(null));
  }, []);

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

      {birthdays && (
        <section className="rounded-xl border p-4 bg-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cake className="size-5 text-pink-600 dark:text-pink-400" />
            <span className="font-semibold">Aniversariantes de hoje</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
            </span>
          </div>
          {birthdays.length === 0 ? (
            <span className="text-sm text-muted-foreground">Nenhum aluno faz aniversário hoje.</span>
          ) : (
            <ul className="divide-y">
              {birthdays.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/atletas/${b.id}`)}
                    className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-0.5 py-2 text-left hover:opacity-80"
                  >
                    <span className="font-medium">{b.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {b.age} anos{b.turma ? ` · ${b.turma}` : ""}
                      {b.phoneNumber ? ` · ${b.phoneNumber}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {loading && <div>Carregando...</div>}

      {!loading && error && (
        <div className="rounded-xl border p-4 flex flex-col items-start gap-3">
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
            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Total de alunos</span>
              <span className="text-2xl font-bold">{summary.totalPlayers}</span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Jogos no mês</span>
              <span className="text-2xl font-bold">{summary.totalGames}</span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos no mês</span>
              <span className="text-2xl font-bold">
                {summary.totalPaymentsThisMonth}
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos em dia</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.totalPaymentsPaidThisMonth}
              </span>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-2 bg-card">
              <span className="text-sm text-muted-foreground">Pagamentos pendentes</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.totalPaymentsPendingThisMonth}
              </span>
            </div>
          </section>
        </>
      )}
    </LayoutContent>
  );
}
