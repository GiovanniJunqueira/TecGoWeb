import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameService } from "@/services/game/game.service";
import type { Game, GameCategory, GameType } from "@/entities/game/game.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";

const gameTypes: { value: GameType; label: string }[] = [
  { value: "CHAMPIONSHIP", label: "Campeonato" },
  { value: "FRIENDLY", label: "Amistoso" },
];

const gameCategories: { value: GameCategory; label: string }[] = [
  { value: "SUB_9", label: "Sub-9" },
  { value: "SUB_11", label: "Sub-11" },
  { value: "SUB_13", label: "Sub-13" },
  { value: "SUB_15", label: "Sub-15" },
  { value: "SUB_17", label: "Sub-17" },
];

type Tab = "futuros" | "passados";

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
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Jogos</Label>
        <Button onClick={() => navigate("/jogos/novo")}>Novo jogo</Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm ${
            tab === "futuros" ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"
          }`}
          onClick={() => setTab("futuros")}
        >
          Futuros
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            tab === "passados" ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"
          }`}
          onClick={() => setTab("passados")}
        >
          Passados
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Tipo</Label>
          <select
            className="border rounded px-2 py-1 text-sm"
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

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Categoria</Label>
          <select
            className="border rounded px-2 py-1 text-sm"
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

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Data inicial</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Data final</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Adversário</Label>
          <Input
            value={opponentSearch}
            onChange={(e) => setOpponentSearch(e.target.value)}
            placeholder="Buscar por adversário"
          />
        </div>

        <Button onClick={load} disabled={loading}>
          {loading ? "Carregando..." : "Filtrar"}
        </Button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Adversário</th>
              <th className="text-left p-3">Placar</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const filteredGames = games.filter((g) => {
                const gameDate = new Date(g.date);
                const matchesTab = tab === "futuros" ? gameDate >= today : gameDate < today;
                const matchesOpponent = !opponentSearch
                  || g.opponent?.toLowerCase().includes(opponentSearch.toLowerCase());
                return matchesTab && matchesOpponent;
              });

              if (loading) {
                return (
                  <tr>
                    <td className="p-3" colSpan={6}>
                      Carregando...
                    </td>
                  </tr>
                );
              }

              if (filteredGames.length === 0) {
                return (
                  <tr>
                    <td className="p-3" colSpan={6}>
                      {tab === "futuros" ? "Nenhum jogo futuro encontrado" : "Nenhum jogo passado encontrado"}
                    </td>
                  </tr>
                );
              }

              return filteredGames.map((g) => (
                <tr key={g.id} className="border-t">
                  <td className="p-3">{g.date}</td>
                  <td className="p-3">
                    {g.type === "CHAMPIONSHIP" ? "Campeonato" : "Amistoso"}
                  </td>
                  <td className="p-3">
                    {gameCategories.find((c) => c.value === g.category)?.label ??
                      g.category}
                  </td>
                  <td className="p-3">{g.opponent}</td>
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
