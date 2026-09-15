import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AulaGrupoService } from "@/services/aula/aula.service";
import { PlayerService } from "@/services/player/player.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { toast } from "sonner";

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

export default function AulaGrupoFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [allPlayers, setAllPlayers] = useState<ProfilePlayer[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await PlayerService.findAll({ page: 0, size: 500, sort: "firstname,asc" });
        setAllPlayers(data?.content ?? data ?? []);

        if (isEdit && id) {
          const grupos = await AulaGrupoService.findAll();
          const grupo = grupos.find((g) => g.id === id);
          if (grupo) {
            setName(grupo.name);
            setSelectedIds(grupo.players.map((p) => p.id));
          }
        }
      } catch {
        toast.error("Falha ao carregar dados");
      }
    }
    load();
  }, [id, isEdit]);

  const toggleSelected = (playerId: string) => {
    setSelectedIds((prev) =>
      prev.includes(playerId) ? prev.filter((pid) => pid !== playerId) : [...prev, playerId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Informe o nome do grupo");
      return;
    }

    try {
      setLoading(true);
      if (isEdit && id) {
        await AulaGrupoService.update(id, { name, playerIds: selectedIds });
        toast.success("Grupo atualizado com sucesso");
      } else {
        await AulaGrupoService.create({ name, playerIds: selectedIds });
        toast.success("Grupo criado com sucesso");
      }
      navigate("/aulas");
    } catch {
      toast.error("Não foi possível salvar o grupo");
    } finally {
      setLoading(false);
    }
  };

  const min = minAge ? Number(minAge) : null;
  const max = maxAge ? Number(maxAge) : null;
  const filteredPlayers = allPlayers.filter((p) => {
    if (nameFilter && !`${p.firstname} ${p.lastname}`.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    if (min !== null || max !== null) {
      const age = calculateAge(p.birthDate);
      if (age === null) return false;
      if (min !== null && age < min) return false;
      if (max !== null && age > max) return false;
    }
    return true;
  });

  const selectedPlayers = allPlayers.filter((p) => selectedIds.includes(p.id));

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">
        {isEdit ? "Editar grupo de aula" : "Novo grupo de aula"}
      </Label>

      <section className="space-y-4 max-w-2xl">
        <div className="flex flex-col gap-2">
          <Label>Nome do grupo</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Manhã 8h"
          />
        </div>
      </section>

      <section className="space-y-4">
        <Label className="text-lg font-semibold">
          Alunos selecionados ({selectedPlayers.length})
        </Label>
        <div className="overflow-auto max-h-[250px] border rounded">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlayers.length === 0 ? (
                <tr>
                  <td className="p-3" colSpan={2}>
                    Nenhum aluno selecionado ainda
                  </td>
                </tr>
              ) : (
                selectedPlayers.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">
                      {p.firstname} {p.lastname}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => toggleSelected(p.id)}
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
      </section>

      <section className="space-y-4">
        <Label className="text-lg font-semibold">Adicionar alunos</Label>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Nome</Label>
            <Input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Buscar por nome"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Idade mínima</Label>
            <Input
              type="number"
              className="w-24"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Idade máxima</Label>
            <Input
              type="number"
              className="w-24"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
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
              {filteredPlayers.filter((p) => !selectedIds.includes(p.id)).length === 0 ? (
                <tr>
                  <td className="p-3" colSpan={3}>
                    Nenhum aluno disponível
                  </td>
                </tr>
              ) : (
                filteredPlayers
                  .filter((p) => !selectedIds.includes(p.id))
                  .map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">
                        {p.firstname} {p.lastname}
                      </td>
                      <td className="p-3">{calculateAge(p.birthDate) ?? "-"}</td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => toggleSelected(p.id)}>
                          Adicionar
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/aulas")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar grupo"}
        </Button>
      </div>
    </LayoutContent>
  );
}
