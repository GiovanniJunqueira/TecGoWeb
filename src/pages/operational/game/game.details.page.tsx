import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GameService } from "@/services/game/game.service";
import type { Game, GameCategory } from "@/entities/game/game.entity";
import { toast } from "sonner";

const gameCategories: { value: GameCategory; label: string }[] = [
  { value: "SUB_9", label: "Sub-9" },
  { value: "SUB_11", label: "Sub-11" },
  { value: "SUB_13", label: "Sub-13" },
  { value: "SUB_15", label: "Sub-15" },
  { value: "SUB_17", label: "Sub-17" },
];

export default function GameDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await GameService.findById(id);
        setGame(data);
      } catch {
        toast.error("Não foi possível carregar o jogo");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const categoryLabel = game
    ? gameCategories.find((c) => c.value === game.category)?.label ?? game.category
    : "";

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Detalhes do Jogo</Label>
        <div className="space-x-2">
          {id && (
            <>
              <Button onClick={() => navigate(`/jogos/editar/${id}`)}>Editar</Button>
              <Button variant="outline" onClick={() => navigate(`/jogos/${id}/chamada`)}>
                Fazer chamada
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !game ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tipo</div>
              <div className="font-medium">
                {game.type === "CHAMPIONSHIP" ? "Campeonato" : "Amistoso"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Categoria</div>
              <div className="font-medium">{categoryLabel}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data</div>
              <div className="font-medium">{game.date}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Adversário</div>
              <div className="font-medium">{game.opponent}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Placar</div>
              <div className="font-medium">
                {game.homeScore ?? 0} x {game.awayScore ?? 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Local</div>
              <div className="font-medium">{game.location ?? "-"}</div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-lg font-semibold">Atletas e estatísticas</Label>
            <div className="overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Atleta</th>
                    <th className="p-3 text-left">Gols</th>
                    <th className="p-3 text-left">Titular</th>
                    <th className="p-3 text-left">Compareceu</th>
                    <th className="p-3 text-left">Anotações</th>
                  </tr>
                </thead>
                <tbody>
                  {(!game.players || game.players.length === 0) ? (
                    <tr>
                      <td className="p-3" colSpan={5}>
                        Nenhum atleta cadastrado para este jogo
                      </td>
                    </tr>
                  ) : (
                    game.players.map((p) => (
                      <tr key={p.playerId ?? p.playerName} className="border-t">
                        <td className="p-3">{p.playerName ?? "-"}</td>
                        <td className="p-3">{p.goals ?? 0}</td>
                        <td className="p-3">{p.starter ? "Sim" : "Não"}</td>
                        <td className="p-3">
                          {p.attended === null ? "-" : p.attended ? "Sim" : "Não"}
                        </td>
                        <td className="p-3">{p.notes ?? "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </LayoutContent>
  );
}
