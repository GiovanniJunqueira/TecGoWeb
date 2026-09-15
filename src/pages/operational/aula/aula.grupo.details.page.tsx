import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AulaGrupoService, AulaSessaoService } from "@/services/aula/aula.service";
import type { AulaGrupo, AulaSessao } from "@/entities/aula/aula.entity";
import { toast } from "sonner";

export default function AulaGrupoDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState<AulaGrupo | null>(null);
  const [sessoes, setSessoes] = useState<AulaSessao[]>([]);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [grupos, sessoesData] = await Promise.all([
        AulaGrupoService.findAll(),
        AulaSessaoService.findByGrupo(id),
      ]);
      setGrupo(grupos.find((g) => g.id === id) ?? null);
      setSessoes(sessoesData ?? []);
    } catch {
      toast.error("Não foi possível carregar o grupo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onCreateSessao = async () => {
    if (!id || !newDate) {
      toast.error("Selecione a data da aula");
      return;
    }
    try {
      setCreating(true);
      await AulaSessaoService.create(id, newDate);
      toast.success("Aula registrada com sucesso");
      setNewDate("");
      await load();
    } catch {
      toast.error("Não foi possível registrar a aula");
    } finally {
      setCreating(false);
    }
  };

  const onDeleteSessao = async (sessaoId: string) => {
    try {
      await AulaSessaoService.delete(sessaoId);
      toast.success("Aula removida");
      await load();
    } catch {
      toast.error("Não foi possível remover a aula");
    }
  };

  const presentCount = (s: AulaSessao) => s.presencas.filter((p) => p.present === true).length;

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">{grupo?.name ?? "Grupo de aula"}</Label>
        <div className="space-x-2">
          {id && (
            <>
              <Button variant="outline" onClick={() => navigate(`/aulas/editar/${id}`)}>
                Editar grupo
              </Button>
              <Button variant="outline" onClick={() => navigate(`/aulas/${id}/relatorio`)}>
                Gerar relatório
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate("/aulas")}>
            Voltar
          </Button>
        </div>
      </div>

      {grupo && (
        <p className="text-sm text-muted-foreground">
          {grupo.players.length} aluno(s) neste grupo
        </p>
      )}

      <section className="flex items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Nova aula (data)</Label>
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        </div>
        <Button onClick={onCreateSessao} disabled={creating}>
          {creating ? "Registrando..." : "Registrar aula"}
        </Button>
      </section>

      <section className="space-y-4">
        <Label className="text-lg font-semibold">Histórico de aulas (últimos 2 meses)</Label>
        <div className="overflow-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Presentes</th>
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
              ) : sessoes.length === 0 ? (
                <tr>
                  <td className="p-3" colSpan={3}>
                    Nenhuma aula registrada ainda
                  </td>
                </tr>
              ) : (
                sessoes.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.date}</td>
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
                      <Button variant="destructive" size="sm" onClick={() => onDeleteSessao(s.id)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </LayoutContent>
  );
}
