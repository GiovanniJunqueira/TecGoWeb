import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlayerService } from "@/services/player/player.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Tab = "ativos" | "inativos";

function daysSince(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function PlayerListPage() {
  const [tab, setTab] = useState<Tab>("ativos");
  const [players, setPlayers] = useState<ProfilePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  async function load(targetTab: Tab = tab, targetPage = 0) {
    try {
      setLoading(true);
      const data =
        targetTab === "ativos"
          ? await PlayerService.findAll({ page: targetPage, size: 10, sort: "firstname,asc" })
          : await PlayerService.findAllInactive({ page: targetPage, size: 10, sort: "firstname,asc" });
      setPlayers(data?.content ?? data ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setPage(data?.number ?? targetPage);
    } catch {
      toast.error("Falha ao buscar atletas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const onInactivate = async (id: string) => {
    try {
      await PlayerService.softDelete(id);
      toast.success("Atleta marcado como inativo");
      load(tab, page);
    } catch {
      toast.error("Não foi possível inativar o atleta");
    }
  };

  const onReactivate = async (id: string) => {
    try {
      await PlayerService.reactivate(id);
      toast.success("Atleta reativado");
      load(tab, page);
    } catch {
      toast.error("Não foi possível reativar o atleta");
    }
  };

  const onHardDelete = async (id: string) => {
    try {
      await PlayerService.hardDelete(id);
      toast.success("Atleta excluído permanentemente");
      load(tab, page);
    } catch {
      toast.error("Não foi possível excluir o atleta");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Atletas</Label>
        <Button onClick={() => navigate("/atletas/matricular")}>Novo atleta</Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm ${
            tab === "ativos" ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"
          }`}
          onClick={() => setTab("ativos")}
        >
          Ativos
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            tab === "inativos" ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"
          }`}
          onClick={() => setTab("inativos")}
        >
          Inativos
        </button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Matrícula</th>
              {tab === "inativos" && <th className="text-left p-3">Inativo há</th>}
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={tab === "inativos" ? 4 : 3}>
                  Carregando...
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={tab === "inativos" ? 4 : 3}>
                  {tab === "ativos" ? "Nenhum atleta encontrado" : "Nenhum atleta inativo"}
                </td>
              </tr>
            ) : (
              players.map((p) => {
                const days = daysSince(p.inactiveSince);
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      {p.firstname} {p.lastname}
                    </td>
                    <td className="p-3">{p.registrationId || "-"}</td>
                    {tab === "inativos" && (
                      <td className="p-3">
                        {days !== null ? `${days} dia${days === 1 ? "" : "s"}` : "-"}
                      </td>
                    )}
                    <td className="p-3 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/atletas/${p.id}`)}>
                        Ver
                      </Button>
                      {tab === "ativos" ? (
                        <Button variant="destructive" size="sm" onClick={() => onInactivate(p.id)}>
                          Inativar
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => onReactivate(p.id)}>
                            Reativar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => onHardDelete(p.id)}>
                            Excluir permanentemente
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 0 || loading}
            onClick={() => load(tab, page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => load(tab, page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </LayoutContent>
  );
}
