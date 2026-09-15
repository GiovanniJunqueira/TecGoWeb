import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AulaSessaoService } from "@/services/aula/aula.service";
import type { AulaSessao } from "@/entities/aula/aula.entity";
import { toast } from "sonner";

export default function AulaChamadaPage() {
  const { sessaoId } = useParams<{ sessaoId: string }>();
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<AulaSessao | null>(null);
  const [presence, setPresence] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!sessaoId) return;
      try {
        setLoading(true);
        const data = await AulaSessaoService.findById(sessaoId);
        setSessao(data);
        const initial: Record<string, boolean> = {};
        data.presencas.forEach((p) => {
          if (p.playerId) initial[p.playerId] = p.present ?? false;
        });
        setPresence(initial);
      } catch {
        toast.error("Não foi possível carregar a aula");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessaoId]);

  const toggle = (playerId: string) => {
    setPresence((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const handleSave = async () => {
    if (!sessaoId) return;
    try {
      setSaving(true);
      await AulaSessaoService.updatePresenca(
        sessaoId,
        Object.entries(presence).map(([playerId, present]) => ({ playerId, present }))
      );
      toast.success("Chamada salva com sucesso");
      navigate(-1);
    } catch {
      toast.error("Não foi possível salvar a chamada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Chamada da Aula</Label>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !sessao ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {sessao.grupoName} — {sessao.date}
          </p>

          <div className="overflow-auto rounded border max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Aluno</th>
                  <th className="p-3 text-left">Presente</th>
                </tr>
              </thead>
              <tbody>
                {sessao.presencas.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={2}>
                      Nenhum aluno neste grupo
                    </td>
                  </tr>
                ) : (
                  sessao.presencas.map((p) => (
                    <tr key={p.playerId} className="border-t">
                      <td className="p-3">{p.playerName}</td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={p.playerId ? presence[p.playerId] ?? false : false}
                          onChange={() => p.playerId && toggle(p.playerId)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar chamada"}
            </Button>
          </div>
        </>
      )}
    </LayoutContent>
  );
}
