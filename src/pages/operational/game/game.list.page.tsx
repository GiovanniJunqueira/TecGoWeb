import { useEffect, useRef, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameService } from "@/services/game/game.service";
import { GAME_CATEGORY_OPTIONS, type Game, type GameCategory, type GameType } from "@/entities/game/game.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { formatDateBr, relativeDay } from "@/lib/dates";

const gameTypes: { value: GameType; label: string }[] = [
  { value: "CHAMPIONSHIP", label: "Campeonato" },
  { value: "FRIENDLY", label: "Amistoso" },
];

const gameCategories = GAME_CATEGORY_OPTIONS;

type Tab = "hoje" | "futuros" | "passados";

const EMPTY_MESSAGE: Record<Tab, string> = {
  hoje: "Nenhum jogo hoje",
  futuros: "Nenhum jogo futuro encontrado",
  passados: "Nenhum jogo passado encontrado",
};

export default function GameListPage() {
  const [tab, setTab] = useState<Tab>("futuros");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<GameType | undefined>();
  const [category, setCategory] = useState<GameCategory | undefined>();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [opponentSearch, setOpponentSearch] = useState<string>("");
  const navigate = useNavigate();
  const deleteDialog = useConfirmDialog();
  const pickedInitialTab = useRef(false);

  async function load() {
    try {
      setLoading(true);
      const data = await GameService.findAll({
        type,
        category,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setGames(data ?? []);
      // Abre em "Hoje" quando tem jogo no dia; senão, nos próximos jogos.
      if (!pickedInitialTab.current) {
        pickedInitialTab.current = true;
        if ((data ?? []).some((g) => relativeDay(g.date) === "hoje")) setTab("hoje");
      }
    } catch {
      toast.error("Falha ao buscar jogos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await GameService.delete(id);
      toast.success("Jogo removido");
      await load();
    } catch {
      toast.error("Não foi possível remover o jogo");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Jogos</Label>
        <Button onClick={() => navigate("/jogos/novo")}>Novo jogo</Button>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "hoje", label: "Hoje" },
          { value: "futuros", label: "Futuros" },
          { value: "passados", label: "Passados" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Label className="text-sm">Tipo</Label>
          <select
            className="border rounded-md px-3 text-sm w-full h-9"
            value={type ?? ""}
            onChange={(e) =>
              setType((e.target.value || undefined) as GameType | undefined)
            }
          >
            <option value="">Todos</option>
            {gameTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Label className="text-sm">Categoria</Label>
          <select
            className="border rounded-md px-3 text-sm w-full h-9"
            value={category ?? ""}
            onChange={(e) =>
              setCategory(
                (e.target.value || undefined) as GameCategory | undefined
              )
            }
          >
            <option value="">Todas</option>
            {gameCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Label className="text-sm">Data inicial</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Label className="text-sm">Data final</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Label className="text-sm">Adversário</Label>
          <Input
            value={opponentSearch}
            onChange={(e) => setOpponentSearch(e.target.value)}
            placeholder="Buscar por adversário"
          />
        </div>

        <Button onClick={load} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Carregando..." : "Filtrar"}
        </Button>
      </div>

      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Adversário</th>
              <th className="text-left p-3">Atletas</th>
              <th className="text-left p-3">Placar</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const tabOf: Record<string, Tab> = { hoje: "hoje", futuro: "futuros", passado: "passados" };
              const filteredGames = games.filter((g) => {
                const matchesTab = tabOf[relativeDay(g.date) ?? ""] === tab;
                const matchesOpponent = !opponentSearch
                  || g.opponent?.toLowerCase().includes(opponentSearch.toLowerCase());
                return matchesTab && matchesOpponent;
              });

              if (loading) {
                return (
                  <tr>
                    <td className="p-3" colSpan={7}>
                      Carregando...
                    </td>
                  </tr>
                );
              }

              if (filteredGames.length === 0) {
                return (
                  <tr>
                    <td className="p-3" colSpan={7}>
                      {EMPTY_MESSAGE[tab]}
                    </td>
                  </tr>
                );
              }

              return filteredGames.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">
                    {formatDateBr(g.date)}
                    {relativeDay(g.date) === "hoje" && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Hoje
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {g.type === "CHAMPIONSHIP" ? "Campeonato" : "Amistoso"}
                  </td>
                  <td className="p-3">
                    {gameCategories.find((c) => c.value === g.category)?.label ??
                      g.category}
                  </td>
                  <td className="p-3">{g.opponent}</td>
                  <td className="p-3 whitespace-nowrap">
                    {(() => {
                      const total = g.players?.length ?? 0;
                      const present = g.players?.filter((p) => p.attended).length ?? 0;
                      const calledRoll = g.players?.some((p) => p.attended !== null) ?? false;
                      return (
                        <>
                          {total} inscrito{total === 1 ? "" : "s"}
                          {calledRoll && (
                            <span className="block text-xs text-muted-foreground">
                              {present} presente{present === 1 ? "" : "s"}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </td>
                  <td className="p-3">
                    {g.homeScore ?? 0} x {g.awayScore ?? 0}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jogos/${g.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jogos/editar/${g.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jogos/${g.id}/chamada`)}
                    >
                      Fazer chamada
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDialog.open(g.id)}
                    >
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
        title="Excluir jogo?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
