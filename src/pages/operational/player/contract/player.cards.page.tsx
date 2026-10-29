import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/auth.context";
import { PlayerService } from "@/services/player/player.service";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import { PaymentService } from "@/services/payment/payment.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import type { Payment } from "@/entities/payment/payment.entity";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import {
  AthleteCardBack,
  AthleteCardFront,
  CARDS_PER_PAGE,
  type CardPerson,
  type PaidMonths,
} from "@/components/contract/athlete-card";
import { getContractConfig } from "@/components/contract/contract-config";
import { toast } from "sonner";

const A4_WIDTH_PX = 794; // 210mm a 96dpi

type StatusFilter = "ATIVOS" | "INATIVOS" | "TODOS";

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

function groupPaid(payments: Payment[], year: number, fallbackPlayerId?: string) {
  const byPlayer = new Map<string, PaidMonths>();
  for (const payment of payments) {
    const [y, m] = (payment.month ?? "").split("-").map(Number);
    const playerId = payment.playerId ?? fallbackPlayerId;
    if (!payment.status || y !== year || !m || !playerId) continue;
    if (!byPlayer.has(playerId)) byPlayer.set(playerId, new Map());
    byPlayer.get(playerId)!.set(m, payment.paidAt);
  }
  return byPlayer;
}

// Carteirinha gerada na hora (nada é salvo). Serve para um atleta (/atletas/:id/carteirinha)
// ou para vários de uma vez (/atletas/carteirinhas?status=&turma=&aulaGrupoId=), 4 por folha A4.
export default function PlayerCardsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { school, refreshSchool } = useAuth();
  const currentYear = new Date().getFullYear();

  const [people, setPeople] = useState<CardPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [markPaid, setMarkPaid] = useState(true);
  const [withBack, setWithBack] = useState(false);
  const [paid, setPaid] = useState<Map<string, PaidMonths>>(new Map());
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const status = (searchParams.get("status") as StatusFilter) || "ATIVOS";
  const turma = searchParams.get("turma") || undefined;
  const aulaGrupoId = searchParams.get("aulaGrupoId") || undefined;

  useEffect(() => {
    if (!school) refreshSchool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (id) {
          const [player, responsibles] = await Promise.all([
            PlayerService.findById(id) as Promise<ProfilePlayer>,
            ResponsibleService.findByPlayer(id).catch(() => [] as Responsible[]),
          ]);
          const responsible = responsibles?.[0];
          setPeople([
            {
              id: player.id,
              name: `${player.firstname ?? ""} ${player.lastname ?? ""}`.trim(),
              birthDate: player.birthDate,
              registrationId: player.registrationId,
              phone: player.phoneNumber || responsible?.phone,
              responsible: responsible?.name,
            },
          ]);
        } else {
          const report = await PlayerService.report({ status, turma, aulaGrupoId });
          setPeople(
            (report ?? []).map((p) => ({
              id: p.id,
              name: `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim(),
              birthDate: p.birthDate,
              registrationId: p.registrationId,
              phone: p.phoneNumber,
              responsible: p.responsibleNames?.split(",")[0]?.trim(),
            }))
          );
        }
      } catch {
        toast.error("Não foi possível carregar os atletas");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, status, turma, aulaGrupoId]);

  // Meses já pagos no ano escolhido (sem permissão de pagamentos, a grade só sai em branco).
  useEffect(() => {
    if (!markPaid || people.length === 0) {
      setPaid(new Map());
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const payments = id
          ? await PaymentService.getByPlayer(id)
          : (
              await Promise.all(
                Array.from({ length: 12 }, (_, i) =>
                  PaymentService.search({ month: `${year}-${String(i + 1).padStart(2, "0")}`, status: true })
                )
              )
            ).flat();
        if (!cancelled) setPaid(groupPaid(payments ?? [], year, id));
      } catch {
        if (!cancelled) setPaid(new Map());
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [markPaid, people, year, id]);

  useEffect(() => {
    const previous = document.title;
    document.title = id && people[0] ? `Carteirinha - ${people[0].name}` : `Carteirinhas ${year}`;
    return () => {
      document.title = previous;
    };
  }, [id, people, year]);

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
  const pages = useMemo(() => chunk(people, CARDS_PER_PAGE), [people]);
  const heading = id
    ? `Carteirinha${people[0] ? ` · ${people[0].name}` : ""}`
    : `Carteirinhas · ${people.length} atleta${people.length === 1 ? "" : "s"}`;

  return (
    <div className="min-h-svh bg-neutral-200 dark:bg-neutral-900 print:bg-white">
      <style>{`
        @page { size: A4; margin: 8mm 10mm; }
        .card-sheet {
          width: 210mm;
          min-height: 297mm;
          padding: 8mm 10mm;
          margin: 0 auto 16px;
          background: #fff;
          color: #000;
          box-shadow: 0 4px 24px rgba(0,0,0,.18);
          border-radius: 4px;
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 6mm;
        }
        .athlete-card { height: 64mm; width: 190mm; break-inside: avoid; }
        .card-panel { width: 93mm; height: 64mm; border: 0.45mm solid #000; box-sizing: border-box; overflow: hidden; }
        @media print {
          html, body { background: #fff !important; }
          .card-scaler { zoom: 1 !important; }
          .card-sheet { width: auto; min-height: 0; padding: 0; margin: 0; box-shadow: none; border-radius: 0; }
          .card-sheet + .card-sheet { break-before: page; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur print:hidden">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft /> Voltar
        </Button>
        <div className="text-sm font-medium text-foreground truncate">{heading}</div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            Ano
            <select
              className="border rounded-md px-2 text-sm h-9"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
            Marcar meses pagos
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={withBack} onChange={(e) => setWithBack(e.target.checked)} />
            Imprimir verso
          </label>
          <Button onClick={() => window.print()} disabled={loading || people.length === 0}>
            <Printer /> Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {withBack && (
        <p className="px-4 pt-3 text-center text-xs text-muted-foreground print:hidden">
          Cada folha de frente vem seguida do verso: imprima em frente e verso (virar pela borda longa) e
          dobre cada carteirinha na linha tracejada.
        </p>
      )}

      <div ref={containerRef} className="px-2 py-6 print:p-0">
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">Carregando...</div>
        ) : people.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">Nenhum atleta encontrado.</div>
        ) : (
          <div className="card-scaler" style={{ zoom: scale }}>
            {pages.map((page, index) => (
              <Fragment key={index}>
                <div className="card-sheet">
                  {page.map((person) => (
                    <AthleteCardFront
                      key={person.id}
                      person={person}
                      school={school}
                      config={config}
                      year={year}
                      paid={paid.get(person.id)}
                    />
                  ))}
                </div>
                {withBack && (
                  <div className="card-sheet">
                    {page.map((person) => (
                      <AthleteCardBack key={person.id} />
                    ))}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
