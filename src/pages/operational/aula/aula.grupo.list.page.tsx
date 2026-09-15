import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AulaGrupoService } from "@/services/aula/aula.service";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AulaGrupoListPage() {
  const [grupos, setGrupos] = useState<AulaGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Aulas</Label>
        <Button onClick={() => navigate("/aulas/novo")}>Novo grupo</Button>
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
            {loading ? (
              <tr>
                <td className="p-3" colSpan={3}>
                  Carregando...
                </td>
              </tr>
            ) : grupos.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={3}>
                  Nenhum grupo cadastrado
                </td>
              </tr>
            ) : (
              grupos.map((g) => (
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
                    <Button variant="destructive" size="sm" onClick={() => onDelete(g.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </LayoutContent>
  );
}
