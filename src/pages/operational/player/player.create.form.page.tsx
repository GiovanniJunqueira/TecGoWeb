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
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import type { PaymentPlan } from "@/entities/paymentplan/payment-plan.entity";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
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

function computeTurma(birthDate: string): string {
  const year = new Date(birthDate).getFullYear();
  if (Number.isNaN(year)) return "";
  return `Nascidos ${String(year % 100).padStart(2, "0")}`;
}

export default function PlayerCreateFormPage() {

  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [availableResponsibles, setAvailableResponsibles] = useState<Responsible[]>([]);
  const [selectedResponsibleIds, setSelectedResponsibleIds] = useState<string[]>([]);
  const [responsibleSearch, setResponsibleSearch] = useState("");
  const [newResponsible, setNewResponsible] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
  });
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
        toast.success("Atleta criado com sucesso");
      }

      let responsibleIds = [...selectedResponsibleIds];

      if (
        newResponsible.name.trim() ||
        newResponsible.phone.trim() ||
        newResponsible.email.trim() ||
        newResponsible.document.trim()
      ) {
        const created = await ResponsibleService.create({
          name: newResponsible.name,
          phone: newResponsible.phone,
          email: newResponsible.email,
          document: newResponsible.document,
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
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">
          {isEdit ? "Editar Atleta" : "Matricular Atleta"}
        </Label>
        <Button type="button" variant="outline" onClick={() => navigate("/atletas")}>
          Voltar
        </Button>
      </div>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Dados do Atleta</h2>
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
                      className="border rounded px-3 py-2 text-sm w-full h-9"
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
                      className="border rounded px-3 py-2 text-sm w-full h-9"
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
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Responsáveis</h2>

          <div className="flex flex-col gap-2 max-w-md">
            <Label>Buscar responsável</Label>
            <Input
              value={responsibleSearch}
              onChange={(e) => setResponsibleSearch(e.target.value)}
              placeholder="Digite o nome do responsável"
            />
          </div>

          <div className="overflow-auto max-h-[300px] border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Selecionar</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Telefone</th>
                </tr>
              </thead>
              <tbody>
                {availableResponsibles.length === 0 ? (
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

          <div className="space-y-2 mt-4 max-w-xl">
            <h3 className="font-semibold">Novo responsável</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={newResponsible.name}
                  onChange={(e) =>
                    setNewResponsible((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={newResponsible.phone}
                  onChange={(e) =>
                    setNewResponsible((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Telefone do responsável"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newResponsible.email}
                  onChange={(e) =>
                    setNewResponsible((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email do responsável"
                />
              </div>
              <div>
                <Label>Documento</Label>
                <Input
                  value={newResponsible.document}
                  onChange={(e) =>
                    setNewResponsible((prev) => ({ ...prev, document: e.target.value }))
                  }
                  placeholder="CPF ou RG"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Documentos e Contato</h2>
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
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Endereço Residencial</h2>
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
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Dados da Escola/Faculdade</h2>
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
        </section>

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
