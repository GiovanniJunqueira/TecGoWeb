import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/auth.context";
import { PlayerService } from "@/services/player/player.service";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import { AulaGrupoService } from "@/services/aula/aula.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import { AthleteContractDocument } from "@/components/contract/athlete-contract-document";
import { getContractConfig } from "@/components/contract/contract-config";
import { toast } from "sonner";

const A4_WIDTH_PX = 794; // 210mm a 96dpi

// Gerado na hora a partir do cadastro (nada é salvo): a escola imprime ou salva como PDF pelo navegador.
export default function PlayerContractPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { school, refreshSchool } = useAuth();
  const [player, setPlayer] = useState<ProfilePlayer | null>(null);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [grupo, setGrupo] = useState<AulaGrupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!school) refreshSchool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [playerData, responsibleData, grupoData] = await Promise.all([
          PlayerService.findById(id),
          ResponsibleService.findByPlayer(id).catch(() => [] as Responsible[]),
          AulaGrupoService.findByPlayer(id).catch(() => [] as AulaGrupo[]),
        ]);
        setPlayer(playerData);
        setResponsibles(responsibleData ?? []);
        setGrupo(grupoData?.[0] ?? null);
      } catch {
        toast.error("Não foi possível carregar o atleta");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!player) return;
    const previous = document.title;
    // O título vira o nome sugerido do arquivo ao "Salvar como PDF".
    document.title = `Ficha e contrato - ${player.firstname} ${player.lastname}`.trim();
    return () => {
      document.title = previous;
    };
  }, [player]);

  useLayoutEffect(() => {
    const update = () => {
      const width = containerRef.current?.clientWidth ?? A4_WIDTH_PX;
      setScale(Math.min(1, (width - 16) / A4_WIDTH_PX));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [loading]);

  return (
    <div className="min-h-svh bg-neutral-200 dark:bg-neutral-900 print:bg-white">
      <style>{`
        @page { size: A4; margin: 8mm 10mm; }
        .athlete-contract { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; }
        /* Evita "negrito dentro de negrito" virar Arial Black nas cláusulas destacadas. */
        .athlete-contract strong { font-weight: 700; }
        .contract-sheet {
          width: 210mm;
          min-height: 297mm;
          padding: 8mm 10mm;
          margin: 0 auto 16px;
          background: #fff;
          box-shadow: 0 4px 24px rgba(0,0,0,.18);
          border-radius: 4px;
        }
        @media print {
          html, body { background: #fff !important; }
          .contract-scaler { zoom: 1 !important; }
          .contract-sheet { width: auto; min-height: 0; padding: 0; margin: 0; box-shadow: none; border-radius: 0; }
          .contract-break { break-before: page; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft /> Voltar
        </Button>
        <div className="text-sm font-medium text-foreground truncate">
          {player ? `Ficha e contrato · ${player.firstname} ${player.lastname}` : "Ficha e contrato"}
        </div>
        <Button onClick={() => window.print()} disabled={loading || !player}>
          <Printer /> Imprimir / Salvar PDF
        </Button>
      </div>

      <div ref={containerRef} className="px-2 py-6 print:p-0">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Carregando...</div>
        ) : !player ? (
          <div className="text-center text-sm text-muted-foreground">Atleta não encontrado.</div>
        ) : (
          <div className="contract-scaler" style={{ zoom: scale }}>
            <AthleteContractDocument
              player={player}
              responsibles={responsibles}
              grupo={grupo}
              school={school}
              config={getContractConfig(school)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
