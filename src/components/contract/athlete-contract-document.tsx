import type { ReactNode } from "react";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import type { School } from "@/entities/school/scholl.entity";
import type { ContractConfig } from "./contract-config";
import { reaisPorExtenso } from "./extenso";

export interface AthleteContractData {
  player: ProfilePlayer;
  responsibles: Responsible[];
  grupo: AulaGrupo | null;
  school: School | null;
  config: ContractConfig;
}

// ---------- formatação ----------

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

function ageFrom(iso?: string | null): string {
  if (!iso) return "";
  const birth = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age--;
  return age >= 0 ? `${age} anos` : "";
}

function money(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function moneyWithWords(value: number): string {
  return `${money(value)} (${reaisPorExtenso(value)})`;
}

function joinParts(...parts: (string | null | undefined)[]): string {
  return parts.map((p) => p?.trim()).filter(Boolean).join(", ");
}

/** "Segunda e Quarta 8:00" -> { days: "Segunda e Quarta", time: "8:00" } */
function splitGrupo(name?: string | null): { days: string; time: string } {
  if (!name) return { days: "", time: "" };
  const match = name.match(/(\d{1,2}[:h]\d{2})/);
  if (!match) return { days: name, time: "" };
  return { days: name.replace(match[0], "").trim(), time: match[0].replace("h", ":") };
}

function todayLong(city: string): string {
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  return city ? `${city}, ${date}` : date;
}

const ORIGIN_OPTIONS = ["Ex-aluno", "Panfleto", "Placas", "Muro", "Transporte", "Indicação"] as const;

function matchKey(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
}

/** Marca a opção de "como conheceu" que bate com o campo Origem do cadastro; o resto vai em "Outros". */
function originMarks(origin?: string) {
  const value = origin?.trim() ?? "";
  const key = matchKey(value);
  const matched = key ? ORIGIN_OPTIONS.find((opt) => key.includes(matchKey(opt))) : undefined;
  return { matched, other: value && !matched ? value : "" };
}

// Destaca as partes do contrato (como no modelo original em papel).
function emph(text: string): ReactNode {
  const parts = text.split(/(CONTRATANTE|CONTRATADA|ALUNO|PLANO|RESPONSÁVEL|OBJETO)/g);
  return parts.map((part, i) =>
    /^(CONTRATANTE|CONTRATADA|ALUNO|PLANO|RESPONSÁVEL|OBJETO)$/.test(part) ? <strong key={i}>{part}</strong> : part
  );
}

// ---------- blocos visuais ----------

function Field({ label, value, span = 12 }: { label: string; value?: ReactNode; span?: number }) {
  return (
    <div className="flex items-end gap-1.5 min-w-0" style={{ gridColumn: `span ${span} / span ${span}` }}>
      <span className="font-semibold whitespace-nowrap">{label}</span>
      <span className="flex-1 min-w-0 border-b border-neutral-400 px-1 leading-snug min-h-[1.35em] truncate">
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-1.5">
      <h3 className="bg-neutral-200 text-neutral-900 text-center font-bold tracking-wide uppercase py-0.5 rounded-sm text-[9pt]">
        {title}
      </h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-12 gap-x-3 gap-y-1">{children}</div>;
}

function Box({ checked }: { checked?: boolean }) {
  return (
    <span className="inline-flex items-center justify-center w-3 h-3 border border-neutral-700 rounded-[2px] text-[7pt] leading-none align-middle">
      {checked ? "X" : ""}
    </span>
  );
}

function SignatureLine({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="border-t border-neutral-800 mx-4 pt-1 font-semibold">{label}</div>
      {sub && <div className="text-[7.5pt] text-neutral-600">{sub}</div>}
    </div>
  );
}

// ---------- ficha do atleta (página 1) ----------

function AthleteSheet({ player, responsibles, grupo, school, config }: AthleteContractData) {
  const main = responsibles[0];
  const { days, time } = splitGrupo(grupo?.name);
  const origin = originMarks(player.origin);
  const healthRows: [string, string][] = [
    ["Cirurgia", "Qual?"],
    ["Convulsão / Epilepsia", "Medicamento:"],
    ["Fraturas", "Tipo:"],
    ["Infecções frequentes", "Quais?"],
    ["Problema cardíaco", "Medicamento:"],
    ["Hipertensão", "Qual?"],
    ["Problema ósseo", "Qual?"],
    ["Alergias", "Quais?"],
  ];

  return (
    <div className="contract-sheet">
      <header className="flex items-center gap-4 border-b-2 border-neutral-800 pb-2">
        <div className="w-[22mm] h-[22mm] flex items-center justify-center shrink-0">
          {school?.logoUrl && (
            <img
              src={school.logoUrl}
              alt=""
              className="max-w-full max-h-full object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
        <div className="flex-1 text-center">
          <div className="text-[17pt] font-extrabold tracking-tight leading-tight">{config.title}</div>
          <div className="text-[8pt] text-neutral-700">
            {[config.addressLine, config.phone && `Tel. ${config.phone}`].filter(Boolean).join(" · ")}
          </div>
          <div className="mt-1 text-[12pt] font-bold tracking-widest">FICHA DO ATLETA</div>
        </div>
        <div className="w-[25mm] h-[31mm] border border-neutral-500 rounded-sm flex items-center justify-center text-[7.5pt] text-neutral-500 shrink-0">
          Foto 3x4
        </div>
      </header>

      <Section title="Dados do atleta">
        <Grid>
          <Field span={8} label="Nome:" value={`${player.firstname ?? ""} ${player.lastname ?? ""}`.trim()} />
          <Field span={4} label="Nº matrícula:" value={player.registrationId} />
          <Field span={4} label="Nascimento:" value={formatDate(player.birthDate)} />
          <Field span={3} label="Idade:" value={ageFrom(player.birthDate)} />
          <Field span={5} label="Turma:" value={player.turma} />
          <Field span={7} label="Dias de treino:" value={days} />
          <Field span={5} label="Horário:" value={time} />
          <Field span={4} label="RG:" value={player.rg} />
          <Field span={4} label="CPF:" value={player.cpf} />
          <Field span={4} label="Celular:" value={player.phoneNumber} />
          <Field span={12} label="Filiação:" value={responsibles.map((r) => r.name).join(" / ")} />
          <Field span={8} label="Endereço:" value={joinParts(player.address, player.addressNumber, player.addressComplement)} />
          <Field span={4} label="Bairro:" value={player.addressNeighborhood} />
          <Field span={4} label="CEP:" value={player.postcode} />
          <Field span={5} label="Cidade:" value={config.city} />
          <Field span={3} label="UF:" value={config.state} />
        </Grid>
      </Section>

      <Section title="Dados escolares">
        <Grid>
          <Field span={8} label="Colégio:" value={player.college} />
          <Field span={4} label="Série:" value={player.collegeSeries} />
          <Field span={8} label="Endereço:" value={joinParts(player.collegeAddress, player.collegeComplement)} />
          <Field span={4} label="Bairro:" value={player.collegeNeighborhood} />
          <Field span={4} label="CEP:" value={player.collegePostcode} />
          <Field span={4} label="Telefone:" value={player.collegePhone} />
          <Field span={4} label="Horário:" value={player.collegeTime} />
        </Grid>
      </Section>

      <Section title="Como conheceu a escola">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {ORIGIN_OPTIONS.map((opt) => (
            <span key={opt} className="inline-flex items-center gap-1.5">
              <Box checked={origin.matched === opt} /> {opt}
            </span>
          ))}
          <span className="inline-flex items-end gap-1.5 flex-1 min-w-[45mm]">
            <Box checked={Boolean(origin.other)} /> Outros:
            <span className="flex-1 border-b border-neutral-400 px-1 min-h-[1.35em] truncate">{origin.other}</span>
          </span>
        </div>
      </Section>

      <Section title="Saúde do atleta">
        <Grid>
          <Field span={6} label="Convênio médico:" />
          <Field span={6} label="Hospital de atendimento:" />
          <Field span={4} label="Telefone:" />
          <Field span={4} label="Peso:" />
          <Field span={4} label="Altura:" />
        </Grid>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1.5">
          {healthRows.map(([label, detail]) => (
            <div key={label} className="flex items-end gap-2 min-w-0">
              <span className="w-[34mm] shrink-0">{label}</span>
              <span className="inline-flex items-center gap-1 shrink-0"><Box /> Sim</span>
              <span className="inline-flex items-center gap-1 shrink-0"><Box /> Não</span>
              <span className="whitespace-nowrap text-neutral-700">{detail}</span>
              <span className="flex-1 border-b border-neutral-400 min-h-[1.35em]" />
            </div>
          ))}
        </div>
        <div className="mt-1 space-y-1">
          <Field label="Observações:" />
          <div className="border-b border-neutral-400 min-h-[1.35em]" />
        </div>
      </Section>

      <Section title="Termo de responsabilidade">
        <div className="space-y-1 text-justify leading-snug text-[8pt]">
          <p>
            O aluno deverá apresentar a carteirinha em todas as aulas. Em caso de esquecimento, deverá retirar uma
            autorização na secretaria para frequentar a aula. Em caso de perda, pedimos que a secretaria seja comunicada
            imediatamente, para que sejam tomadas as devidas providências; o prazo para confecção da nova carteirinha é
            de até 5 dias.
          </p>
          <p>
            As reposições de aulas deverão ser marcadas antecipadamente e mediante atestado médico, perdendo a validade
            em caso de falta. As inscrições para campeonatos e amistosos deverão ser feitas nas datas estipuladas.
            {config.insuranceCoverage &&
              ` O seguro dará cobertura de até ${config.insuranceCoverage} no primeiro socorro, dentro das instalações da escola.`}
          </p>
          <p>
            O vencimento da mensalidade será <strong>todo dia {config.dueDay}</strong> de cada mês. Em caso de desistência
            ou ausência por tempo indeterminado, isso deverá ser comunicado com 15 dias de antecedência do vencimento da
            mensalidade; caso contrário, o pagamento deverá ser efetuado.
          </p>
          <p>
            O signatário declara-se plenamente ciente dos riscos inerentes à prática de futebol, eximindo o centro de
            ensino e treinamento "{school?.name ?? config.legalName}" de toda e qualquer responsabilidade por eventuais
            ocorrências que porventura venham a acontecer, e responsabiliza-se pelas boas condições físicas e de saúde do
            atleta, declarando sua aptidão para participar do nosso centro de ensino e treinamento de futebol.
          </p>
        </div>
      </Section>

      <Section title="Responsável financeiro (dados para boleto)">
        <Grid>
          <Field span={6} label="Nome:" value={main?.name} />
          <Field span={3} label="RG:" />
          <Field span={3} label="CPF:" value={main?.document} />
          <Field span={6} label="E-mail:" value={main?.email} />
          <Field span={3} label="Telefone:" value={main?.phone} />
          <Field span={3} label="Parentesco:" />
          <Field span={6} label="Profissão:" />
          <Field span={6} label="Empresa / telefone:" />
        </Grid>
      </Section>

      <div className="flex gap-6 mt-7">
        <SignatureLine label="Matrícula" sub="Assinatura do responsável" />
        <SignatureLine label="Cancelamento da matrícula" sub="Assinatura do responsável" />
      </div>
      <div className="text-center mt-1">{todayLong(config.city)}</div>
    </div>
  );
}

// ---------- contrato (páginas seguintes) ----------

type ContractItem =
  | { kind: "section"; title: string }
  | { kind: "clause"; text: string; strong?: boolean; items?: string[]; after?: ReactNode; paragraph?: string };

function buildClauses(config: ContractConfig, planTable: ReactNode): ContractItem[] {
  const school = config.legalName.toUpperCase();
  const unit = config.unitName ? ` – ${config.unitName.toUpperCase()}` : "";
  const items: ContractItem[] = [
    { kind: "section", title: "Do objeto do contrato" },
    {
      kind: "clause",
      text: `Este contrato tem como OBJETO a participação do ALUNO na ${school}, de propriedade da CONTRATADA, para ministrar aulas de futebol conforme determinado neste instrumento.`,
      paragraph: "O CONTRATANTE, neste ato, matricula o ALUNO no PLANO abaixo:",
      after: planTable,
    },
    { kind: "section", title: "Do funcionamento" },
    { kind: "clause", text: `A ${school}${unit} funcionará conforme o cronograma de atividades disponibilizado na sede administrativa.` },
    { kind: "clause", text: "Os horários e PLANOS poderão sofrer alterações, de acordo com as necessidades e a disponibilidade da CONTRATADA." },
    { kind: "clause", text: "O CONTRATANTE poderá frequentar as instalações da CONTRATADA somente nos dias e horários determinados no PLANO contratado e em eventos organizados pela CONTRATADA." },
    { kind: "clause", text: "O CONTRATANTE deverá seguir estritamente as normas de funcionamento apresentadas pela CONTRATADA, que poderão sofrer alterações quando necessário." },
    { kind: "clause", text: "O CONTRATANTE está ciente de que não há treinos nos feriados prolongados, devido ao número reduzido de alunos. Nos meses de julho, dezembro, janeiro e fevereiro, todas as atividades da escola funcionam normalmente, exceto nas datas festivas de Natal, Confraternização Universal e Carnaval." },
    { kind: "section", title: "Das atividades" },
    { kind: "clause", text: "A CONTRATADA terá técnicos qualificados para a orientação do CONTRATANTE." },
    { kind: "clause", text: "O CONTRATANTE deverá obedecer ao REGULAMENTO INTERNO da Escola, que faz parte integrante deste Contrato." },
    { kind: "clause", text: "Danos de qualquer natureza decorrentes de atividades executadas sem a solicitação de orientação do corpo técnico da CONTRATADA, ou com inobservância desta, não serão de responsabilidade da CONTRATADA e caracterizarão culpa exclusiva do ALUNO." },
    { kind: "clause", strong: true, text: "O CONTRATANTE obriga-se a ressarcir a CONTRATADA por qualquer dano causado pelo ALUNO sob sua responsabilidade, por dolo ou culpa, em até 48 horas após a constatação do evento e sua consequente comunicação formal." },
    { kind: "clause", text: "A CONTRATADA poderá organizar ATIVIDADES EXTRAS, como torneios, excursões e eventos, que serão cobradas à parte, não integrando o presente Contrato, ficando a critério do CONTRATANTE a participação." },
    { kind: "clause", text: "A CONTRATADA não se responsabiliza por objetos, valores, documentos ou qualquer outro bem pertencente ao CONTRATANTE deixados no espaço físico da CONTRATADA. Disponibilizamos armários nos vestiários para uso, desde que cada aluno utilize seu próprio cadeado." },
    { kind: "section", title: "Da matrícula, do valor e do pagamento das parcelas" },
    {
      kind: "clause",
      text: "A matrícula deverá ser feita na secretaria da CONTRATADA, devendo o CONTRATANTE apresentar ORIGINAL e CÓPIA dos seguintes documentos:",
      items: [
        "CPF e carteira de identidade do RESPONSÁVEL;",
        "Comprovante de residência do RESPONSÁVEL;",
        "Carteira de identidade do ALUNO;",
        "2 (duas) fotos 3x4 do ALUNO;",
        "Carteira do convênio médico do ALUNO;",
        "Declaração escolar;",
        "Atestado médico original.",
      ],
    },
    { kind: "clause", text: "O pagamento de matrículas, exames e mensalidades com atraso superior a 90 dias deverá ser feito na secretaria da CONTRATADA ou em outro local por ela indicado." },
    { kind: "clause", text: "O pagamento da parcela deverá ser feito conforme determinado no PLANO contratado neste ato. Após o vencimento, o CONTRATANTE arcará com multa de 2% (dois por cento) sobre o valor do título e juros por dia de atraso." },
    { kind: "clause", strong: true, text: "O CONTRATANTE que deixar de efetuar o pagamento da parcela por mais de 20 dias poderá ficar impedido de frequentar as atividades oferecidas pela CONTRATADA." },
    { kind: "clause", strong: true, text: `O PLANO será reajustado anualmente no mês de ${config.adjustmentMonth} e, caso haja alguma alteração na política econômica do governo, a CONTRATADA poderá adotar as novas medidas em vigor.` },
    {
      kind: "clause",
      text: "O valor da parcela poderá também ser alterado em função de:",
      items: [
        "Atraso de pagamento: após o vencimento, não havendo o devido pagamento, o CONTRATANTE perderá automaticamente o benefício de desconto, seja de pontualidade ou de convênio;",
        "Cancelamento ou retirada de convênio.",
      ],
    },
    { kind: "section", title: "Do atraso no pagamento" },
    {
      kind: "clause",
      strong: true,
      text: "Havendo atraso da parcela superior a 30 (trinta) dias do vencimento, e desde que esgotadas todas as formas amigáveis de cobrança, a CONTRATADA fica autorizada a:",
      items: [
        "Incluir o nome do CONTRATANTE em cartório de protesto;",
        "Incluir o nome do CONTRATANTE no SPC;",
        "Ajuizar ação monitória ou ação de execução.",
      ],
    },
    { kind: "section", title: "Da frequência às atividades" },
    { kind: "clause", text: "Somente poderá frequentar as atividades da CONTRATADA o ALUNO que estiver regularmente matriculado, com todos os exames obrigatórios realizados e sem nenhum débito de parcela." },
    { kind: "clause", text: "O ALUNO deverá apresentar sua carteirinha de identificação para frequentar as aulas de futebol." },
    { kind: "clause", text: "Sempre que julgar necessário, a CONTRATADA poderá exigir do CONTRATANTE a prova de quitação das parcelas, juntamente com o documento de identificação emitido por ela." },
    { kind: "clause", text: "O responsável pelo ALUNO compromete-se a apresentar atestado médico do ALUNO, renovando-o semestralmente, indicando que se encontra apto à prática de exercícios, declarando estar o ALUNO em plenas condições de saúde, apto a realizar atividades físicas e não portador de nenhuma moléstia infectocontagiosa que possa prejudicar os demais frequentadores, isentando a CONTRATADA de quaisquer responsabilidades inerentes à sua saúde." },
    { kind: "section", title: "Do uso da imagem" },
    {
      kind: "clause",
      text: "O CONTRATANTE, responsável pelo ALUNO, autoriza a CONTRATADA, livre de quaisquer ônus, a utilizar a imagem do ALUNO para fins exclusivos de divulgação da Escola e de suas atividades, podendo, para tanto, reproduzi-la ou divulgá-la na internet, em jornais e em todos os demais meios de comunicação, públicos ou privados.",
      paragraph: "Em nenhuma hipótese estas imagens poderão ser utilizadas de maneira contrária à moral, aos bons costumes ou à ordem pública.",
    },
    { kind: "section", title: "Do prazo" },
    { kind: "clause", text: "O presente Contrato tem prazo determinado conforme o PLANO contratado neste ato e poderá ser renovado automaticamente." },
    { kind: "section", title: "Da rescisão" },
    { kind: "clause", strong: true, text: "Este Contrato poderá ser rescindido por qualquer das partes, desde que a parte interessada comunique a outra com antecedência mínima de 15 (quinze) dias do vencimento do título, sendo que o CONTRATANTE somente poderá rescindi-lo se estiver em dia com o pagamento das parcelas e demais débitos existentes com a CONTRATADA." },
    { kind: "clause", strong: true, text: "Em hipótese alguma será aceito cancelamento deste instrumento por telefone. O cancelamento deverá ser feito sempre diretamente na secretaria da CONTRATADA, pelo CONTRATANTE, até o último dia útil do mês, com o pagamento desse mês quitado." },
    { kind: "clause", text: "O presente Contrato é firmado em caráter pessoal e intransferível, sendo vedada a cessão ou transferência, onerosa ou gratuita, a terceiros." },
  ];

  if (config.insuranceCompany) {
    items.push(
      { kind: "section", title: "Do seguro de acidentes pessoais" },
      { kind: "clause", text: `O ALUNO estará segurado contra acidentes pessoais decorrentes das atividades desportivas aqui pactuadas, conforme apólice de seguro firmada entre a CONTRATADA e a seguradora ${config.insuranceCompany}, que prevê o RESSARCIMENTO dos valores gastos com os "Primeiros Socorros" até o limite determinado na apólice.` }
    );
  }

  items.push(
    { kind: "section", title: "Do foro" },
    { kind: "clause", text: `Para dirimir quaisquer controvérsias oriundas deste Contrato, as partes elegem o foro da comarca de ${config.forum || "____________________"}.` }
  );

  return items;
}

function PartyTable({ rows }: { rows: [string, ReactNode, string?, ReactNode?][] }) {
  return (
    <table className="w-full border-collapse text-[8pt]">
      <tbody>
        {rows.map(([l1, v1, l2, v2], i) => (
          <tr key={i}>
            <th className="border border-neutral-500 bg-neutral-100 px-2 py-px text-left font-bold w-[30mm] whitespace-nowrap">{l1}</th>
            <td className="border border-neutral-500 px-2 py-px" colSpan={l2 ? 1 : 3}>{v1}</td>
            {l2 && (
              <>
                <th className="border border-neutral-500 bg-neutral-100 px-2 py-px text-left font-bold w-[30mm] whitespace-nowrap">{l2}</th>
                <td className="border border-neutral-500 px-2 py-px w-[56mm]">{v2}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ServiceContract({ player, responsibles, grupo, config }: AthleteContractData) {
  const main = responsibles[0];
  const { days, time } = splitGrupo(grupo?.name);
  const plan = player.paymentPlan;
  const isScholarship = plan && plan.priceLate === 0 && plan.priceOnTime === 0;

  const planRows: [string, ReactNode][] = [
    ["Número de matrícula", player.registrationId],
    ["Plano", plan?.name],
    ["Dias de treinamento", days],
    ["Horário", time],
  ];
  if (isScholarship) {
    planRows.push(["Mensalidade", "Bolsa integral (isento de mensalidade)"]);
  } else {
    planRows.push(
      ["Plano anual sem desconto", plan ? moneyWithWords(plan.priceLate * 12) : ""],
      ["12 parcelas mensais sem desconto", plan ? money(plan.priceLate) : ""],
      [`Plano anual com desconto (pagamento até o dia ${config.dueDay})`, plan ? moneyWithWords(plan.priceOnTime * 12) : ""],
      ["12 parcelas mensais com desconto", plan ? money(plan.priceOnTime) : ""],
      ["Data de vencimento", `Todo dia ${config.dueDay}`],
      ["Forma de pagamento", config.paymentMethod]
    );
  }

  const planTable = (
    <table className="w-full border-collapse my-1 text-[8pt]">
      <tbody>
        {planRows.map(([label, value]) => (
          <tr key={label}>
            <th className="border border-neutral-500 bg-neutral-100 px-2 py-px text-left font-bold w-1/2">{label}</th>
            <td className="border border-neutral-500 px-2 py-px">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  let number = 0;

  return (
    <div className="contract-sheet contract-break">
      <h2 className="text-center text-[12pt] font-bold tracking-wide underline underline-offset-4">
        CONTRATO DE PRESTAÇÃO DE SERVIÇOS
      </h2>

      <h4 className="mt-2 mb-1 font-bold uppercase underline underline-offset-2">Identificação das partes contratantes</h4>
      <PartyTable
        rows={[
          ["Contratante", main?.name, "Nacionalidade", "Brasileira"],
          ["RG", "", "CPF", main?.document],
          ["Estado civil", "", "Profissão", ""],
          ["Endereço", joinParts(main?.address, main?.addressNumber, main?.addressComplement, main?.addressNeighborhood), "CEP", main?.postcode],
          ["Aluno", `${player.firstname ?? ""} ${player.lastname ?? ""}`.trim(), "Nascimento", formatDate(player.birthDate)],
        ]}
      />
      <div className="h-2" />
      <PartyTable
        rows={[
          ["Contratada", config.legalName],
          ["Endereço", config.addressLine],
          ["CNPJ", config.cnpj, "Representante", config.legalRepresentative],
        ]}
      />

      <p className="mt-2 italic font-semibold text-justify leading-snug text-[8pt]">
        As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços de
        Escola de Futebol, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.
      </p>

      <div className="text-[8pt] leading-snug text-justify">
        {buildClauses(config, planTable).map((item, i) => {
          if (item.kind === "section") {
            return (
              <h4 key={i} className="mt-1.5 mb-0.5 font-bold uppercase underline underline-offset-2 break-after-avoid">
                {item.title}
              </h4>
            );
          }
          number += 1;
          return (
            <div key={i} className="mb-0.5 break-inside-avoid">
              <p className={item.strong ? "font-semibold" : undefined}>
                <strong>Cláusula {number}ª.</strong> {emph(item.text)}
              </p>
              {item.items && (
                <ol className="list-[lower-alpha] pl-8 mt-0.5">
                  {item.items.map((it) => (
                    <li key={it}>{emph(it)}</li>
                  ))}
                </ol>
              )}
              {item.paragraph && (
                <p className="mt-0.5">
                  <strong>Parágrafo único.</strong> {emph(item.paragraph)}
                </p>
              )}
              {item.after}
            </div>
          );
        })}
      </div>

      <div className="break-inside-avoid">
        <p className="mt-3 italic text-justify">
          Por estarem assim justos e contratados, firmam o presente instrumento, em duas vias de igual teor, juntamente
          com 2 (duas) testemunhas.
        </p>
        <p className="text-center mt-2">{todayLong(config.city)}</p>
        <div className="flex gap-6 mt-10">
          <SignatureLine label="Contratante" sub={main?.name} />
          <SignatureLine label="Contratada" sub={config.legalName} />
        </div>
        <div className="flex gap-6 mt-8">
          <SignatureLine label="Testemunha 1" sub="Nome / CPF" />
          <SignatureLine label="Testemunha 2" sub="Nome / CPF" />
        </div>
      </div>
    </div>
  );
}

export function AthleteContractDocument(props: AthleteContractData) {
  return (
    <div className="athlete-contract text-neutral-900 text-[9pt]">
      <AthleteSheet {...props} />
      <ServiceContract {...props} />
    </div>
  );
}
