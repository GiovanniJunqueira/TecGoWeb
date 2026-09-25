import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AulaGrupoService } from "@/services/aula/aula.service";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";

export default function AulaGrupoListPage() {
  const [grupos, setGrupos] = useState<AulaGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameSearch, setNameSearch] = useState("");
  const navigate = useNavigate();
  const deleteDialog = useConfirmDialog();

  async function load() {
    try {
      setLoading(true);
      const data = await AulaGrupoService.findAll();
      setGrupos(data ?? []);
    } catch {
      toast.error("Falha ao buscar grupos de aula");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await AulaGrupoService.delete(id);
      toast.success("Grupo removido");
      await load();
    } catch {
      toast.error("Não foi possível remover o grupo");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Aulas</Label>
        <Button onClick={() => navigate("/aulas/novo")}>Novo grupo</Button>
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <Label className="text-sm">Buscar por nome do grupo</Label>
        <Input
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          placeholder="Ex: Manhã 8h"
        />
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome do grupo</th>
              <th className="text-left p-3">Alunos</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredGrupos = grupos.filter(
                (g) => !nameSearch || g.name.toLowerCase().includes(nameSearch.toLowerCase())
              );

              if (loading) {
                return (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      Carregando...
                    </td>
                  </tr>
                );
              }

              if (filteredGrupos.length === 0) {
                return (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      Nenhum grupo cadastrado
                    </td>
                  </tr>
                );
              }

              return filteredGrupos.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-3">{g.name}</td>
                  <td className="p-3">{g.players.length}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/aulas/${g.id}`)}>
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/aulas/editar/${g.id}`)}
                    >
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteDialog.open(g.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Excluir grupo de aula?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
