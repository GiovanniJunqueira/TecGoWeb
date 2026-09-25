import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlayerService } from "@/services/player/player.service";
import type { PlayerReport } from "@/entities/player/profile-player.entity";
import { REPORT_COLUMNS } from "@/components/player/print-players-dialog";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  ATIVOS: "Ativos",
  INATIVOS: "Inativos",
  TODOS: "Todos",
};

function formatCell(key: string, player: PlayerReport): string {
  switch (key) {
    case "matricula":
      return player.registrationId || "-";
    case "nascidos":
      return player.turma || "-";
    case "nascimento":
      return player.birthDate || "-";
    case "rg":
      return player.rg || "-";
    case "cpf":
      return player.cpf || "-";
    case "telefone":
      return player.phoneNumber || "-";
    case "endereco":
      return player.address || "-";
    case "responsavel":
      return player.responsibleNames || "-";
    case "plano":
      return player.paymentPlanName || "-";
    case "grupo":
      return player.aulaGrupoName || "-";
    case "instituicao":
      return player.college || "-";
    default:
      return "-";
  }
}

export default function PlayerReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [players, setPlayers] = useState<PlayerReport[]>([]);
  const [loading, setLoading] = useState(false);

  const status = searchParams.get("status") || "ATIVOS";
  const turma = searchParams.get("turma") || undefined;
  const aulaGrupoId = searchParams.get("aulaGrupoId") || undefined;
  const columns = (searchParams.get("columns") || "")
    .split(",")
    .filter(Boolean);
  const activeColumns = REPORT_COLUMNS.filter((c) => columns.includes(c.key));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await PlayerService.report({
          status: status as "ATIVOS" | "INATIVOS" | "TODOS",
          turma,
          aulaGrupoId,
        });
        setPlayers(data ?? []);
      } catch {
        toast.error("Não foi possível gerar o relatório");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, turma, aulaGrupoId]);

  const filterDescription = [
    statusLabels[status] ?? status,
    turma ? `Nascidos: ${turma}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <LayoutContent className="gap-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #player-print-report, #player-print-report * { visibility: visible; }
          #player-print-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Relatório de Atletas</Label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>Imprimir</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div id="player-print-report" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Lista de Atletas</h2>
            <p className="text-sm text-muted-foreground">
              {filterDescription} — {players.length} aluno(s)
            </p>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left border">Nome</th>
                {activeColumns.map((col) => (
                  <th key={col.key} className="p-2 text-left border">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td className="p-2 border" colSpan={activeColumns.length + 1}>
                    Nenhum aluno encontrado
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 border">
                      {p.firstname} {p.lastname}
                    </td>
                    {activeColumns.map((col) => (
                      <td key={col.key} className="p-2 border">
                        {formatCell(col.key, p)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </LayoutContent>
  );
}
