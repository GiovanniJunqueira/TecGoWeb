import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/auth.context";
import { GameService } from "@/services/game/game.service";
import { GAME_CATEGORY_OPTIONS, type Game } from "@/entities/game/game.entity";
import { getContractConfig } from "@/components/contract/contract-config";
import { compareNames, formatDateBr } from "@/lib/dates";
import { toast } from "sonner";

const A4_WIDTH_PX = 794; // 210mm a 96dpi

/** registrada = o que foi marcado na chamada; branco = coluna vazia para marcar à mão; nenhuma = sem coluna. */
type PresenceMode = "registrada" | "branco" | "nenhuma";

// Relação de atletas do jogo para imprimir ou salvar em PDF (gerada na hora, nada é salvo).
export default function GameRosterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { school, refreshSchool } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [presenceMode, setPresenceMode] = useState<PresenceMode>("branco");
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
        const data = await GameService.findById(id);
        setGame(data);
        // Se a chamada já foi feita, já abre mostrando quem foi.
        if (data.players?.some((p) => p.attended !== null)) setPresenceMode("registrada");
      } catch {
        toast.error("Não foi possível carregar o jogo");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!game) return;
    const previous = document.title;
    document.title = `Relação - ${game.opponent} - ${formatDateBr(game.date)}`;
    return () => {
      document.title = previous;
    };
  }, [game]);

  useLayoutEffect(() => {
    const update = () => {
      const width = containerRef.current?.clientWidth ?? A4_WIDTH_PX;
      setScale(Math.min(1, (width - 16) / A4_WIDTH_PX));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [loading]);

  const config = getContractConfig(school);
  const players = [...(game?.players ?? [])].sort((a, b) => compareNames(a.playerName, b.playerName));
  const categoryLabel = GAME_CATEGORY_OPTIONS.find((c) => c.value === game?.category)?.label ?? game?.category;
  const present = players.filter((p) => p.attended).length;
  const calledRoll = players.some((p) => p.attended !== null);

  return (
    <div className="min-h-svh bg-neutral-200 dark:bg-neutral-900 print:bg-white">
      <style>{`
        @page { size: A4; margin: 12mm; }
        .roster-sheet {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          margin: 0 auto 16px;
          background: #fff;
          color: #000;
          box-shadow: 0 4px 24px rgba(0,0,0,.18);
          border-radius: 4px;
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          font-size: 10pt;
        }
        .roster-sheet th, .roster-sheet td { border: 1px solid #555; padding: 1.6mm 2mm; }
        .roster-sheet thead { display: table-header-group; }
        .roster-sheet tr { break-inside: avoid; }
        @media print {
          html, body { background: #fff !important; }
          .roster-scaler { zoom: 1 !important; }
          .roster-sheet { width: auto; min-height: 0; padding: 0; margin: 0; box-shadow: none; border-radius: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft /> Voltar
        </Button>
        <div className="text-sm font-medium text-foreground truncate">Relação de atletas</div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            Presença
            <select
              className="border rounded-md px-2 text-sm h-9"
              value={presenceMode}
              onChange={(e) => setPresenceMode(e.target.value as PresenceMode)}
            >
              <option value="registrada">Da chamada</option>
              <option value="branco">Em branco (marcar à mão)</option>
              <option value="nenhuma">Sem coluna de presença</option>
            </select>
          </label>
          <Button onClick={() => window.print()} disabled={loading || !game}>
            <Printer /> Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="px-2 py-6 print:p-0">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Carregando...</div>
        ) : !game ? (
          <div className="text-center text-sm text-muted-foreground">Jogo não encontrado.</div>
        ) : (
          <div className="roster-scaler" style={{ zoom: scale }}>
            <div className="roster-sheet">
              <header className="flex items-center gap-4 border-b-2 border-neutral-800 pb-3">
                {school?.logoUrl && (
                  <img
                    src={school.logoUrl}
                    alt=""
                    className="h-[18mm] w-[18mm] object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="flex-1">
                  <div className="text-[15pt] font-extrabold leading-tight">{config.title}</div>
                  <div className="text-[12pt] font-bold tracking-wide">RELAÇÃO DE ATLETAS</div>
                </div>
              </header>

              <section className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1 text-[10pt]">
                <div><span className="text-neutral-600">Adversário: </span><b>{game.opponent}</b></div>
                <div><span className="text-neutral-600">Data: </span><b>{formatDateBr(game.date)}</b></div>
                <div><span className="text-neutral-600">Categoria: </span><b>{categoryLabel}</b></div>
                <div><span className="text-neutral-600">Tipo: </span><b>{game.type === "CHAMPIONSHIP" ? "Campeonato" : "Amistoso"}</b></div>
                <div className="col-span-2"><span className="text-neutral-600">Local: </span><b>{game.location || "—"}</b></div>
                <div>
                  <span className="text-neutral-600">Atletas: </span>
                  <b>{players.length}</b>
                  {presenceMode === "registrada" && calledRoll && (
                    <span className="text-neutral-600"> · presentes: <b className="text-black">{present}</b></span>
                  )}
                </div>
              </section>

              <table className="mt-4 w-full border-collapse">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="w-[10mm] text-center">#</th>
                    <th className="w-[18mm] text-center">Camisa</th>
                    <th className="text-left">Atleta</th>
                    <th className="w-[18mm] text-center">Titular</th>
                    {presenceMode !== "nenhuma" && <th className="w-[24mm] text-center">Presença</th>}
                  </tr>
                </thead>
                <tbody>
                  {players.length === 0 ? (
                    <tr>
                      <td colSpan={presenceMode === "nenhuma" ? 4 : 5} className="text-center text-neutral-600">
                        Nenhum atleta inscrito neste jogo
                      </td>
                    </tr>
                  ) : (
                    players.map((p, index) => (
                      <tr key={p.playerId ?? index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center font-bold">{p.shirtNumber ?? ""}</td>
                        <td>{p.playerName}</td>
                        <td className="text-center">{p.starter ? "Sim" : ""}</td>
                        {presenceMode === "registrada" && (
                          <td className="text-center">{p.attended === null ? "—" : p.attended ? "Presente" : "Faltou"}</td>
                        )}
                        {presenceMode === "branco" && (
                          <td className="text-center">
                            <span className="inline-block h-[4mm] w-[4mm] border border-neutral-700 align-middle" />
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="mt-[18mm] grid grid-cols-2 gap-[16mm] text-center text-[9pt]">
                <div className="border-t border-neutral-800 pt-1">Técnico / Responsável</div>
                <div className="border-t border-neutral-800 pt-1">Coordenação</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
