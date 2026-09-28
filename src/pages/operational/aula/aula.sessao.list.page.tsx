import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AulaGrupoService, AulaSessaoService } from "@/services/aula/aula.service";
import type { AulaGrupo, AulaSessao } from "@/entities/aula/aula.entity";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";

export default function AulaSessaoListPage() {
  const [sessoes, setSessoes] = useState<AulaSessao[]>([]);
  const [grupos, setGrupos] = useState<AulaGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [grupoId, setGrupoId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const navigate = useNavigate();
  const deleteDialog = useConfirmDialog();

  async function load() {
    try {
      setLoading(true);
      const data = await AulaSessaoService.findAll({
        grupoId: grupoId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSessoes(data ?? []);
    } catch {
      toast.error("Falha ao buscar aulas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadGrupos() {
      try {
        const data = await AulaGrupoService.findAll();
        setGrupos(data ?? []);
      } catch {
        toast.error("Falha ao carregar turmas");
      }
    }
    loadGrupos();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId, startDate, endDate]);

  const presentCount = (s: AulaSessao) => s.presencas.filter((p) => p.present === true).length;

  const onDelete = async (id: string) => {
    try {
      await AulaSessaoService.delete(id);
      toast.success("Aula removida");
      await load();
    } catch {
      toast.error("Não foi possível remover a aula");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Ver Aulas</Label>
        <Button onClick={() => navigate("/aulas/registrar")}>Registrar aula</Button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2 min-w-48">
          <Label className="text-sm">Turma</Label>
          <select
            className="border rounded px-2 py-1 text-sm h-9"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
          >
            <option value="">Todas</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Data inicial</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Data final</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Carregando..." : "Filtrar"}
        </Button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Turma</th>
              <th className="text-left p-3">Presentes</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            ) : sessoes.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  Nenhuma aula encontrada
                </td>
              </tr>
            ) : (
              sessoes.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.date}</td>
                  <td className="p-3">{s.grupoName}</td>
                  <td className="p-3">
                    {presentCount(s)} / {s.presencas.length}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/aulas/sessoes/${s.id}/chamada`)}
                    >
                      Fazer chamada
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteDialog.open(s.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Excluir aula?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
