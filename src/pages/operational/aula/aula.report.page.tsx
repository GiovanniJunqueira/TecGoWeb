import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AulaGrupoService, AulaSessaoService } from "@/services/aula/aula.service";
import type { AulaGrupo, AulaSessao } from "@/entities/aula/aula.entity";
import { toast } from "sonner";

export default function AulaReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState<AulaGrupo | null>(null);
  const [sessoes, setSessoes] = useState<AulaSessao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const [grupos, sessoesData] = await Promise.all([
          AulaGrupoService.findAll(),
          AulaSessaoService.findByGrupo(id),
        ]);
        setGrupo(grupos.find((g) => g.id === id) ?? null);
        setSessoes((sessoesData ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)));
      } catch {
        toast.error("Não foi possível carregar o relatório");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <LayoutContent className="gap-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #aula-print-report, #aula-print-report * { visibility: visible; }
          #aula-print-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Relatório de Frequência</Label>
        <div className="space-x-2">
          <Button onClick={() => window.print()}>Imprimir</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !grupo ? (
        <div>Grupo não encontrado.</div>
      ) : (
        <div id="aula-print-report" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{grupo.name}</h2>
            <p className="text-sm text-muted-foreground">
              {grupo.players.length} aluno(s) — {sessoes.length} aula(s) registrada(s)
            </p>
          </div>

          <table className="w-full text-sm border">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-2 text-left border">Aluno</th>
                {sessoes.map((s) => (
                  <th key={s.id} className="p-2 text-center border">
                    {s.date}
                  </th>
                ))}
                <th className="p-2 text-center border">Total presenças</th>
              </tr>
            </thead>
            <tbody>
              {grupo.players.map((player) => {
                const total = sessoes.filter((s) =>
                  s.presencas.some((p) => p.playerId === player.id && p.present === true)
                ).length;
                return (
                  <tr key={player.id}>
                    <td className="p-2 border">
                      {player.firstname} {player.lastname}
                    </td>
                    {sessoes.map((s) => {
                      const presenca = s.presencas.find((p) => p.playerId === player.id);
                      const mark =
                        presenca?.present === true ? "P" : presenca?.present === false ? "F" : "-";
                      return (
                        <td key={s.id} className="p-2 text-center border">
                          {mark}
                        </td>
                      );
                    })}
                    <td className="p-2 text-center border font-medium">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="text-xs text-muted-foreground">
            P = presente, F = faltou, - = chamada não realizada
          </p>
        </div>
      )}
    </LayoutContent>
  );
}
