import { useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameService } from "@/services/game/game.service";
import { GAME_CATEGORY_OPTIONS, type GameCategory, type GameType } from "@/entities/game/game.entity";
import { PlayerService } from "@/services/player/player.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const gameTypes: { value: GameType; label: string }[] = [
  { value: "CHAMPIONSHIP", label: "Campeonato" },
  { value: "FRIENDLY", label: "Amistoso" },
];

const gameCategories = GAME_CATEGORY_OPTIONS;

interface PlayerSelection extends ProfilePlayer {
  selected: boolean;
  goals: number;
  starter: boolean;
  notes: string;
}

function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasNotHadBirthdayThisYear =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (hasNotHadBirthdayThisYear) age--;
  return age;
}

export default function GameCreatePage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [type, setType] = useState<GameType | undefined>();
  const [category, setCategory] = useState<GameCategory | undefined>();
  const [opponent, setOpponent] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [homeScore, setHomeScore] = useState<string>("0");
  const [awayScore, setAwayScore] = useState<string>("0");
  const [location, setLocation] = useState<string>("");
  const [players, setPlayers] = useState<PlayerSelection[]>([]);
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");
  const [showAddPlayers, setShowAddPlayers] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPlayers() {
      try {
        const data = await PlayerService.findAll({ page: 0, size: 500, sort: "firstname,asc" });
        const content = data?.content ?? data ?? [];
        let base: PlayerSelection[] = content.map((p: ProfilePlayer) => ({
          ...p,
          selected: false,
          goals: 0,
          starter: false,
          notes: "",
        }));

        if (isEdit && id) {
          const game = await GameService.findById(id);
          setType(game.type);
          setCategory(game.category);
          setOpponent(game.opponent);
          setDate(game.date);
          setHomeScore(String(game.homeScore ?? 0));
          setAwayScore(String(game.awayScore ?? 0));
          setLocation(game.location ?? "");

          base = base.map((p) => {
            const stats = game.players.find((gp) => gp.playerId === p.id);
            return stats
              ? {
                  ...p,
                  selected: true,
                  goals: stats.goals ?? 0,
                  starter: Boolean(stats.starter),
                  notes: stats.notes ?? "",
                }
              : p;
          });
        }

        setPlayers(base);
      } catch {
        toast.error(isEdit ? "Falha ao carregar o jogo" : "Falha ao carregar atletas");
      }
    }

    loadPlayers();
  }, [id, isEdit]);

  const togglePlayerSelected = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              selected: !p.selected,
            }
          : p
      )
    );
  };

  const updatePlayerField = (id: string, field: keyof PlayerSelection, value: unknown) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: value,
            }
          : p
      )
    );
  };

  const handleSubmit = async () => {
    if (!type || !category || !opponent || !date) {
      toast.error("Preencha tipo, categoria, adversário e data");
      return;
    }

    const selectedPlayers = players.filter((p) => p.selected);

    if (selectedPlayers.length === 0) {
      toast.error("Selecione pelo menos um atleta");
      return;
    }

    const payload = {
      type,
      category,
      opponent,
      date,
      homeScore: Number(homeScore) || 0,
      awayScore: Number(awayScore) || 0,
      location: location || undefined,
      players: selectedPlayers.map((p) => ({
        playerId: p.id,
        goals: p.goals || 0,
        starter: p.starter,
        notes: p.notes || undefined,
      })),
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await GameService.update(id, payload);
        toast.success("Jogo atualizado com sucesso");
      } else {
        await GameService.create(payload);
        toast.success("Jogo cadastrado com sucesso");
      }
      navigate("/jogos");
    } catch {
      toast.error(isEdit ? "Não foi possível atualizar o jogo" : "Não foi possível cadastrar o jogo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">{isEdit ? "Editar Jogo" : "Novo Jogo"}</Label>

      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={type ?? ""}
              onChange={(e) =>
                setType((e.target.value || undefined) as GameType | undefined)
              }
            >
              <option value="">Selecione o tipo</option>
              {gameTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={category ?? ""}
              onChange={(e) =>
                setCategory(
                  (e.target.value || undefined) as GameCategory | undefined
                )
              }
            >
              <option value="">Selecione a categoria</option>
              {gameCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Adversário</Label>
            <Input value={opponent} onChange={(e) => setOpponent(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Placar (TecGo)</Label>
            <Input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Placar (Adversário)</Label>
            <Input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 md:col-span-3">
            <Label>Local (opcional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Label className="text-lg font-semibold">Escalação</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddPlayers((prev) => !prev)}
          >
            {showAddPlayers ? "Fechar" : "Adicionar jogador"}
          </Button>
        </div>

        <div className="overflow-auto max-h-[400px] border rounded">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Idade</th>
                <th className="p-3 text-left">Gols</th>
                <th className="p-3 text-left">Titular</th>
                <th className="p-3 text-left">Anotações</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {players.filter((p) => p.selected).length === 0 ? (
                <tr>
                  <td className="p-3" colSpan={6}>
                    Nenhum atleta escalado ainda. Clique em "Adicionar jogador".
                  </td>
                </tr>
              ) : (
                players
                  .filter((p) => p.selected)
                  .map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">
                        {p.firstname} {p.lastname}
                      </td>
                      <td className="p-3">{calculateAge(p.birthDate) ?? "-"}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          className="w-20"
                          value={p.goals}
                          onChange={(e) =>
                            updatePlayerField(p.id, "goals", Number(e.target.value) || 0)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={p.starter}
                          onChange={(e) =>
                            updatePlayerField(p.id, "starter", e.target.checked)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={p.notes}
                          onChange={(e) =>
                            updatePlayerField(p.id, "notes", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => togglePlayerSelected(p.id)}
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {showAddPlayers && (
          <div className="space-y-4 rounded border p-4">
            <div className="flex items-end gap-4 flex-wrap">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Idade mínima</Label>
                <Input
                  type="number"
                  className="w-24"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="Ex: 9"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Idade máxima</Label>
                <Input
                  type="number"
                  className="w-24"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="Ex: 11"
                />
              </div>
            </div>

            <div className="overflow-auto max-h-[300px] border rounded">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Nome</th>
                    <th className="p-3 text-left">Idade</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const min = minAge ? Number(minAge) : null;
                    const max = maxAge ? Number(maxAge) : null;
                    const available = players.filter((p) => {
                      if (p.selected) return false;
                      if (min === null && max === null) return true;
                      const age = calculateAge(p.birthDate);
                      if (age === null) return false;
                      if (min !== null && age < min) return false;
                      if (max !== null && age > max) return false;
                      return true;
                    });

                    if (available.length === 0) {
                      return (
                        <tr>
                          <td className="p-3" colSpan={3}>
                            Nenhum atleta disponível para adicionar
                          </td>
                        </tr>
                      );
                    }

                    return available.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">
                          {p.firstname} {p.lastname}
                        </td>
                        <td className="p-3">{calculateAge(p.birthDate) ?? "-"}</td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => togglePlayerSelected(p.id)}
                          >
                            Adicionar
                          </Button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/jogos")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </LayoutContent>
  );
}
