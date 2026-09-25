import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GameService } from "@/services/game/game.service";
import type { Game } from "@/entities/game/game.entity";
import { toast } from "sonner";

export default function GameAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await GameService.findById(id);
        setGame(data);
        const initial: Record<string, boolean> = {};
        data.players.forEach((p) => {
          if (p.playerId) initial[p.playerId] = p.attended ?? false;
        });
        setAttendance(initial);
      } catch {
        toast.error("Não foi possível carregar o jogo");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const toggle = (playerId: string) => {
    setAttendance((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await GameService.updateAttendance(
        id,
        Object.entries(attendance).map(([playerId, attended]) => ({ playerId, attended }))
      );
      toast.success("Chamada salva com sucesso");
      navigate(`/jogos/${id}`);
    } catch {
      toast.error("Não foi possível salvar a chamada");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Chamada do Jogo</Label>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !game ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {game.opponent} — {game.date}
          </p>

          <div className="overflow-auto rounded border max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Atleta</th>
                  <th className="p-3 text-left">Compareceu</th>
                </tr>
              </thead>
              <tbody>
                {game.players.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={2}>
                      Nenhum atleta escalado para este jogo
                    </td>
                  </tr>
                ) : (
                  game.players.map((p) => (
                    <tr key={p.playerId} className="border-t">
                      <td className="p-3">{p.playerName}</td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={p.playerId ? attendance[p.playerId] ?? false : false}
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
