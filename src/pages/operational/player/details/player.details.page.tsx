import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { PlayerService } from "@/services/player/player.service";
import { toast } from "sonner";

export default function PlayerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<ProfilePlayer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await PlayerService.findById(id);
        setPlayer(data);
      } catch {
        toast.error("Não foi possível carregar o atleta");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Detalhes do Atleta</Label>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !player ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Nome</div>
            <div className="font-medium">{player.firstname} {player.lastname}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Matrícula</div>
            <div className="font-medium">{player.registrationId || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Nascimento</div>
            <div className="font-medium">{player.birthDate}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Telefone</div>
            <div className="font-medium">{player.phoneNumber || "-"}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">Endereço</div>
            <div className="font-medium">
              {player.address || "-"} {player.addressNumber ? `, ${player.addressNumber}` : ""}
              {player.addressNeighborhood ? ` - ${player.addressNeighborhood}` : ""}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">CPF</div>
            <div className="font-medium">{player.cpf || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">RG</div>
            <div className="font-medium">{player.rg || "-"}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground">Instituição</div>
            <div className="font-medium">{player.college || "-"}</div>
          </div>
        </div>
      )}
    </LayoutContent>
  );
}
