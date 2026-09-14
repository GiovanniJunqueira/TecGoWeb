import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { PlayerService } from "@/services/player/player.service";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import { toast } from "sonner";

export default function PlayerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<ProfilePlayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);

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

  useEffect(() => {
    async function loadResponsibles() {
      if (!id) return;
      try {
        const data = await ResponsibleService.findByPlayer(id);
        setResponsibles(data);
      } catch {
        // opcional
      }
    }
    loadResponsibles();
  }, [id]);

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-2xl font-semibold">Detalhes do Atleta</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/atletas/editar/${id}`)}
            disabled={!id}
          >
            Editar atleta
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
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
            <div className="text-sm text-muted-foreground">Turma</div>
            <div className="font-medium">{player.turma || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Plano de pagamento</div>
            <div className="font-medium">
              {player.paymentPlan === "PLANO_2X"
                ? "2x por semana"
                : player.paymentPlan === "PLANO_3X"
                ? "3x por semana"
                : "-"}
            </div>
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
          <div className="md:col-span-2 space-y-2 mt-4">
            <div className="text-lg font-semibold">Responsáveis</div>
            {responsibles.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhum responsável vinculado a este atleta.
              </div>
            ) : (
              <div className="overflow-auto max-h-[300px] border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">Nome</th>
                      <th className="p-3 text-left">Telefone</th>
                      <th className="p-3 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responsibles.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3">{r.name}</td>
                        <td className="p-3">{r.phone}</td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/responsaveis/${r.id}`)}
                          >
                            Ver responsável
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </LayoutContent>
  );
}
