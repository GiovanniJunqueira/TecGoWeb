import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutContent } from "@/layouts/layout.content";
import { PlayerService } from "@/services/player/player.service";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import { AulaGrupoService } from "@/services/aula/aula.service";
import { PaymentPlanService } from "@/services/paymentplan/payment-plan.service";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { NewResponsibleDialog, type NewResponsibleDraft } from "@/components/responsible/new-responsible-dialog";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import type { PaymentPlan } from "@/entities/paymentplan/payment-plan.entity";
import { useForm, type SubmitHandler, type Resolver, type FieldErrors } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { playerSchema, type PlayerFormData } from "@/validators";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { FormSection } from "@/components/form/form-section";

function computeTurma(birthDate: string): string {
  const year = new Date(birthDate).getFullYear();
  if (Number.isNaN(year)) return "";
  return `Nascidos ${String(year % 100).padStart(2, "0")}`;
}

type SectionKey = "atleta" | "responsaveis" | "documentos" | "endereco" | "escola";

const ALL_SECTIONS: SectionKey[] = ["atleta", "responsaveis", "documentos", "endereco", "escola"];

// Em qual seção está cada campo: ao salvar com erro, abre a seção certa para o erro aparecer.
const FIELD_SECTION: Partial<Record<keyof PlayerFormData, SectionKey>> = {
  rg: "documentos",
  cpf: "documentos",
  phoneNumber: "documentos",
  address: "endereco",
  addressNumber: "endereco",
  addressNeighborhood: "endereco",
  addressComplement: "endereco",
  postcode: "endereco",
  college: "escola",
  collegePhone: "escola",
  collegeAddress: "escola",
  collegeNeighborhood: "escola",
  collegeComplement: "escola",
  collegePostcode: "escola",
  collegeSeries: "escola",
  collegeTime: "escola",
};

export default function PlayerCreateFormPage() {

  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [availableResponsibles, setAvailableResponsibles] = useState<Responsible[]>([]);
  const [selectedResponsibleIds, setSelectedResponsibleIds] = useState<string[]>([]);
  const [responsibleSearch, setResponsibleSearch] = useState("");
  const [pendingResponsibles, setPendingResponsibles] = useState<NewResponsibleDraft[]>([]);
  const [newResponsibleOpen, setNewResponsibleOpen] = useState(false);
  // Seções começam fechadas; a pessoa abre só o que vai preencher.
  const [openSections, setOpenSections] = useState<SectionKey[]>([]);
  const toggleSection = (key: SectionKey, open: boolean) =>
    setOpenSections((prev) => (open ? [...new Set([...prev, key])] : prev.filter((k) => k !== key)));
  const allOpen = openSections.length === ALL_SECTIONS.length;
  const [aulaGrupos, setAulaGrupos] = useState<AulaGrupo[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const form = useForm<PlayerFormData>({
    resolver: yupResolver(playerSchema) as Resolver<PlayerFormData>,
    defaultValues: {
      firstname: "",
      lastname: "",
      birthDate: "",
      rg: "",
      cpf: "",
      phoneNumber: "",
      address: "",
      addressNumber: "",
      addressNeighborhood: "",
      addressComplement: "",
      postcode: "",
      origin: "",
      registrationId: "",
      turma: "",
      aulaGrupoId: "",
      paymentPlanId: "",
      college: "",
      collegeAddress: "",
      collegeNeighborhood: "",
      collegeComplement: "",
      collegePostcode: "",
      collegePhone: "",
      collegeSeries: "",
      collegeTime: "",
    },
  });

  const birthDateValue = form.watch("birthDate");

  useEffect(() => {
    if (!birthDateValue) return;
    const currentTurma = form.getValues("turma");
    if (currentTurma) return;
    const computed = computeTurma(birthDateValue);
    if (computed) form.setValue("turma", computed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthDateValue]);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const [data, aulaGruposDoAluno] = await Promise.all([
          PlayerService.findById(id),
          AulaGrupoService.findByPlayer(id).catch(() => []),
        ]);
        form.reset({
          firstname: data.firstname ?? "",
          lastname: data.lastname ?? "",
          birthDate: data.birthDate ?? "",
          rg: data.rg ?? "",
          cpf: data.cpf ?? "",
          phoneNumber: data.phoneNumber ?? "",
          address: data.address ?? "",
          addressNumber: data.addressNumber ?? "",
          addressNeighborhood: data.addressNeighborhood ?? "",
          addressComplement: data.addressComplement ?? "",
          postcode: data.postcode ?? "",
          college: data.college ?? "",
          collegeAddress: data.collegeAddress ?? "",
          collegeNeighborhood: data.collegeNeighborhood ?? "",
          collegeComplement: data.collegeComplement ?? "",
          collegePostcode: data.collegePostcode ?? "",
          collegePhone: data.collegePhone ?? "",
          collegeSeries: data.collegeSeries ?? "",
          collegeTime: data.collegeTime ?? "",
          origin: data.origin ?? "",
          registrationId: data.registrationId ?? "",
          turma: data.turma ?? "",
          aulaGrupoId: aulaGruposDoAluno[0]?.id ?? "",
          paymentPlanId: data.paymentPlan?.id ?? "",
        });
      } catch {
        toast.error("Não foi possível carregar o atleta");
      }
    })();
  }, [id, isEdit, form]);

  useEffect(() => {
    async function loadResponsibles() {
      try {
        const data = await ResponsibleService.findAll({
          name: responsibleSearch || undefined,
        });
        setAvailableResponsibles(data ?? []);
      } catch {
        toast.error("Falha ao carregar responsáveis");
      }
    }
    loadResponsibles();
  }, [responsibleSearch]);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const data = await ResponsibleService.findByPlayer(id);
        setSelectedResponsibleIds(data.map((r) => r.id));
      } catch {
        // opcionalmente ignorar erro aqui
      }
    })();
  }, [isEdit, id]);

  useEffect(() => {
    async function loadAulaGrupos() {
      try {
        const data = await AulaGrupoService.findAll();
        setAulaGrupos(data ?? []);
      } catch {
        toast.error("Falha ao carregar grupos de aula");
      }
    }
    loadAulaGrupos();
  }, []);

  useEffect(() => {
    async function loadPaymentPlans() {
      try {
        const data = await PaymentPlanService.findAll("ATIVOS");
        setPaymentPlans(data ?? []);
      } catch {
        toast.error("Falha ao carregar planos de pagamento");
      }
    }
    loadPaymentPlans();
  }, []);

  const onInvalid = (errors: FieldErrors<PlayerFormData>) => {
    const withErrors = (Object.keys(errors) as (keyof PlayerFormData)[]).map((f) => FIELD_SECTION[f] ?? "atleta");
    setOpenSections((prev) => [...new Set([...prev, ...withErrors])]);
    toast.error("Confira os campos destacados");
  };

  const responsiblesHint = (() => {
    const total = selectedResponsibleIds.length + pendingResponsibles.length;
    return total > 0 ? `${total} selecionado${total === 1 ? "" : "s"}` : undefined;
  })();

  const onSubmit: SubmitHandler<PlayerFormData> = async (data) => {
    try {
      let playerId = id;

      if (isEdit && id) {
        await PlayerService.update(id, data);
        playerId = id;
        toast.success("Atleta atualizado com sucesso");
      } else {
        const response = await PlayerService.create({ ...data });
        playerId = response;
        const createdId = response;
        toast.success("Atleta criado com sucesso", {
          description: "A ficha e o contrato já estão prontos para imprimir.",
          duration: 10000,
          action: { label: "Ficha e contrato", onClick: () => navigate(`/atletas/${createdId}/ficha`) },
        });
      }

      const responsibleIds = [...selectedResponsibleIds];

      for (const draft of pendingResponsibles) {
        const created = await ResponsibleService.create({
          ...draft,
          address: "",
          addressNumber: "",
          addressNeighborhood: "",
          addressComplement: "",
          postcode: "",
          students: [],
        });
        responsibleIds.push(created.id);
      }

      if (playerId && responsibleIds.length >= 0) {
        await ResponsibleService.updateForPlayer(playerId, {
          responsibleIds,
        });
      }

      navigate("/atletas");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error("Ocorreu um erro ao realizar essa ação", {
          description: error.response?.data?.message,
        });
      } else {
        toast.error("Ocorreu um erro ao realizar essa ação");
      }
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">
          {isEdit ? "Editar Atleta" : "Matricular Atleta"}
        </Label>
        <Button type="button" variant="outline" onClick={() => navigate("/atletas")}>
          Voltar
        </Button>
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="w-full space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-primary"
            onClick={() => setOpenSections(allOpen ? [] : ALL_SECTIONS)}
          >
            {allOpen ? "Fechar tudo" : "Abrir tudo"}
          </button>
        </div>
        <FormSection
          title="Dados do Atleta"
          open={openSections.includes("atleta")}
          onOpenChange={(open) => toggleSection("atleta", open)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input id="firstname" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input id="lastname" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input id="birthDate" type="date" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem</FormLabel>
                  <FormControl>
                    <Input id="origin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input id="registrationId" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="turma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nascidos</FormLabel>
                  <FormControl>
                    <Input
                      id="turma"
                      placeholder="Preenchida automaticamente pelo ano de nascimento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aulaGrupoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo de aula</FormLabel>
                  <FormControl>
                    <select
                      className="border rounded-md px-3 text-sm w-full h-9"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">Nenhum grupo</option>
                      {aulaGrupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentPlanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano de pagamento</FormLabel>
                  <FormControl>
                    <select
                      className="border rounded-md px-3 text-sm w-full h-9"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                    >
                      <option value="">Selecione o plano</option>
                      {paymentPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} (R$ {plan.priceOnTime.toFixed(2)} até dia 10 / R${" "}
                          {plan.priceLate.toFixed(2)} após)
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Responsáveis"
          hint={responsiblesHint}
          open={openSections.includes("responsaveis")}
          onOpenChange={(open) => toggleSection("responsaveis", open)}
        >

          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <Label>Buscar responsável</Label>
              <Input
                value={responsibleSearch}
                onChange={(e) => setResponsibleSearch(e.target.value)}
                placeholder="Digite o nome do responsável"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setNewResponsibleOpen(true)}>
              <Plus /> Novo responsável
            </Button>
          </div>

          <div className="overflow-auto max-h-[300px] border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Selecionar</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Telefone</th>
                </tr>
              </thead>
              <tbody>
                {pendingResponsibles.map((r, index) => (
                  <tr key={`novo-${index}`} className="border-t bg-primary/5">
                    <td className="p-3">
                      <input type="checkbox" checked readOnly aria-label="Novo responsável selecionado" />
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{r.name}</span>
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Novo</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span>{r.phone}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingResponsibles((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Remover
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {availableResponsibles.length === 0 && pendingResponsibles.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      Nenhum responsável encontrado
                    </td>
                  </tr>
                ) : (
                  availableResponsibles.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedResponsibleIds.includes(r.id)}
                          onChange={(e) => {
                            setSelectedResponsibleIds((prev) =>
                              e.target.checked
                                ? [...prev, r.id]
                                : prev.filter((rid) => rid !== r.id)
                            );
                          }}
                        />
                      </td>
                      <td className="p-3">{r.name}</td>
                      <td className="p-3">{r.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <NewResponsibleDialog
            open={newResponsibleOpen}
            onOpenChange={setNewResponsibleOpen}
            onAdd={(draft) => setPendingResponsibles((prev) => [...prev, draft])}
          />
        </FormSection>

        <FormSection
          title="Documentos e Contato"
          open={openSections.includes("documentos")}
          onOpenChange={(open) => toggleSection("documentos", open)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG</FormLabel>
                  <FormControl>
                    <Input id="rg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input id="cpf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input id="phoneNumber" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Endereço Residencial"
          open={openSections.includes("endereco")}
          onOpenChange={(open) => toggleSection("endereco", open)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input id="address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="addressNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input id="addressNumber" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressNeighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input id="addressNeighborhood" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressComplement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input id="addressComplement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input id="postcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Dados da Escola/Faculdade"
          open={openSections.includes("escola")}
          onOpenChange={(open) => toggleSection("escola", open)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Instituição</FormLabel>
                    <FormControl>
                      <Input id="college" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="collegePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input id="collegePhone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="collegeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input id="collegeAddress" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="collegeNeighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input id="collegeNeighborhood" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegeComplement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input id="collegeComplement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegePostcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input id="collegePostcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegeSeries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Série/Turma</FormLabel>
                  <FormControl>
                    <Input id="collegeSeries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collegeTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período</FormLabel>
                  <FormControl>
                    <Input
                      id="collegeTime"
                      placeholder="Manhã / Tarde / Noite"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/atletas")}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Limpar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Atleta"}
          </Button>
        </div>
      </form>
      </Form>
    </LayoutContent>
  );
}
