import type { ReactNode } from "react";
import type { School } from "@/entities/school/scholl.entity";
import type { ContractConfig } from "./contract-config";

/** Dados mínimos de um aluno para a carteirinha (vem do cadastro ou do relatório de atletas). */
export interface CardPerson {
  id: string;
  name: string;
  birthDate?: string | null;
  registrationId?: string | null;
  phone?: string | null;
  responsible?: string | null;
}

/** Mês (1-12) → data do pagamento (ISO) dos meses já pagos no ano da carteirinha. */
export type PaidMonths = Map<number, string | null>;

export const CARDS_PER_PAGE = 4;

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function shortDate(iso?: string | null): string {
  return formatDate(iso).slice(0, 5);
}

// ---------- peças ----------

function InfoRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[7.5mm] items-center gap-1 border-t border-black px-[2mm] text-[8.5pt] leading-none whitespace-nowrap overflow-hidden">
      {children}
    </div>
  );
}

function Value({ children }: { children?: ReactNode }) {
  return <span className="min-w-0 flex-1 truncate font-semibold">{children}</span>;
}

/** Grade de mensalidades: 12 quadrados para carimbar/rubricar. Meses pagos já saem marcados. */
function MonthsPanel({ title, paid }: { title: ReactNode; paid?: PaidMonths }) {
  return (
    <div className="card-panel flex flex-col">
      <div className="flex h-[11mm] shrink-0 items-center justify-center text-[13pt] underline underline-offset-2">
        {title}
      </div>
      <div className="grid flex-1 grid-cols-4 grid-rows-3 border-t border-black">
        {MONTHS.map((label, index) => {
          const month = index + 1;
          const isPaid = paid?.has(month);
          return (
            <div
              key={label}
              className={`flex flex-col items-center pt-[1mm] text-[7.5pt] ${
                index % 4 !== 3 ? "border-r border-black" : ""
              } ${index < 8 ? "border-b border-black" : ""}`}
            >
              <span>{label}</span>
              {isPaid && (
                <span className="mt-[1.5mm] flex flex-col items-center rounded-[1mm] border border-emerald-700 px-[1.5mm] py-[0.5mm] leading-tight text-emerald-800">
                  <span className="text-[7pt] font-bold tracking-wide">PAGO</span>
                  {paid?.get(month) && <span className="text-[6pt]">{shortDate(paid.get(month))}</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FoldGutter() {
  return (
    <div className="relative w-[4mm] shrink-0" aria-hidden>
      <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-neutral-400" />
    </div>
  );
}

// ---------- frente e verso ----------

interface CardFrontProps {
  person: CardPerson;
  school: School | null;
  config: ContractConfig;
  year: number;
  paid?: PaidMonths;
}

export function AthleteCardFront({ person, school, config, year, paid }: CardFrontProps) {
  return (
    <div className="athlete-card flex">
      <div className="card-panel flex flex-col">
        <div className="flex h-[34mm] shrink-0 items-stretch">
          <div className="flex w-[21mm] shrink-0 items-center justify-center p-[1.5mm]">
            {school?.logoUrl && (
              <img
                src={school.logoUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-[1mm] text-center text-[8pt] leading-[1.3]">
            {config.cardHeaderLines.map((line, index) => (
              <span key={index} className={`max-w-full truncate ${index === 0 ? "text-[9pt] font-bold" : ""}`}>
                {line}
              </span>
            ))}
          </div>
          <div className="flex w-[24mm] shrink-0 items-center justify-center border-l border-black text-[7pt] text-neutral-400">
            Foto 3x4
          </div>
        </div>
        <InfoRow>
          <span>Nome:</span>
          <Value>{person.name}</Value>
        </InfoRow>
        <InfoRow>
          <span>Nasc.:</span>
          <Value>{formatDate(person.birthDate)}</Value>
          <span className="ml-1">Matríc.:</span>
          <span className="w-[16mm] font-semibold">{person.registrationId}</span>
        </InfoRow>
        <InfoRow>
          <span>Tel.:</span>
          <Value>{person.phone}</Value>
        </InfoRow>
        <InfoRow>
          <span>Resp.:</span>
          <Value>{person.responsible}</Value>
        </InfoRow>
      </div>
      <FoldGutter />
      <MonthsPanel title={`Mensalidade ${year}`} paid={paid} />
    </div>
  );
}

/** Verso para impressão frente e verso: duas grades extras com o ano em branco para preencher. */
export function AthleteCardBack() {
  const blankYear = (
    <span>
      Mensalidade <span className="inline-block w-[14mm] border-b border-black" />
    </span>
  );
  return (
    <div className="athlete-card flex">
      <MonthsPanel title={blankYear} />
      <FoldGutter />
      <MonthsPanel title={blankYear} />
    </div>
  );
}
