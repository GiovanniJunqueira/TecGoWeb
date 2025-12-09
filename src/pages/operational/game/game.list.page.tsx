import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameService } from "@/services/game/game.service";
import type { Game, GameCategory, GameType } from "@/entities/game/game.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

export default function GameListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<GameType | undefined>();
  const [category, setCategory] = useState<GameCategory | undefined>();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const navigate = useNavigate();

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
            {loading ? (
              <tr>
                <td className="p-3" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            ) : games.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={6}>
                  Nenhum jogo encontrado
                </td>
              </tr>
            ) : (
              games.map((g) => (
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
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(g.id)}
                    >
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
