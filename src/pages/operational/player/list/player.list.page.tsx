import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlayerService } from "@/services/player/player.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function PlayerListPage() {
  const [players, setPlayers] = useState<ProfilePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function load(page = 0) {
    try {
      setLoading(true);
      const data = await PlayerService.findAll({ page, size: 10, sort: "firstname,asc" });
      setPlayers(data?.content ?? data ?? []);
    } catch {
      toast.error("Falha ao buscar atletas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await PlayerService.softDelete(id);
      toast.success("Atleta removido");
      load();
    } catch {
      toast.error("Não foi possível remover o atleta");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">Atletas</Label>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Matrícula</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={3}>Carregando...</td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={3}>Nenhum atleta encontrado</td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.firstname} {p.lastname}</td>
                  <td className="p-3">{p.registrationId || "-"}</td>
                  <td className="p-3 text-right">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(`/atletas/${p.id}`)}>Ver</Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(p.id)}>Excluir</Button>
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
