import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerService } from "@/services/player/player.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";

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
  const [search, setSearch] = useState("");
  const [turmaFilter, setTurmaFilter] = useState("");
  const navigate = useNavigate();
  const hardDeleteDialog = useConfirmDialog();

  async function load(targetTab: Tab = tab, targetPage = 0, targetSearch = search, targetTurma = turmaFilter) {
    try {
      setLoading(true);
      const data =
        targetTab === "ativos"
          ? await PlayerService.findAll({ page: targetPage, size: 10, sort: "firstname,asc", search: targetSearch, turma: targetTurma })
          : await PlayerService.findAllInactive({ page: targetPage, size: 10, sort: "firstname,asc", search: targetSearch, turma: targetTurma });
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

      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-2 flex-1 max-w-sm">
          <Label className="text-sm">Buscar por nome ou matrícula</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(tab, 0, search, turmaFilter)}
            placeholder="Ex: João ou 230501"
          />
        </div>
        <div className="flex flex-col gap-2 max-w-48">
          <Label className="text-sm">Nascidos</Label>
          <Input
            value={turmaFilter}
            onChange={(e) => setTurmaFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(tab, 0, search, turmaFilter)}
            placeholder="Ex: Nascidos 12"
          />
        </div>
        <Button variant="outline" onClick={() => load(tab, 0, search, turmaFilter)} disabled={loading}>
          Buscar
        </Button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Matrícula</th>
              <th className="text-left p-3">Nascidos</th>
              {tab === "inativos" && <th className="text-left p-3">Inativo há</th>}
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={tab === "inativos" ? 5 : 4}>
                  Carregando...
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={tab === "inativos" ? 5 : 4}>
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
                    <td className="p-3">{p.turma || "-"}</td>
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
                          <Button variant="destructive" size="sm" onClick={() => hardDeleteDialog.open(p.id)}>
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

      <ConfirmDialog
        open={hardDeleteDialog.isOpen}
        onOpenChange={(open) => !open && hardDeleteDialog.close()}
        title="Excluir atleta permanentemente?"
        description="Essa ação não pode ser desfeita. Todos os dados do atleta serão apagados."
        confirmLabel="Excluir permanentemente"
        onConfirm={() => hardDeleteDialog.targetId && onHardDelete(hardDeleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
