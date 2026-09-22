import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentService } from "@/services/payment/payment.service";
import type { Payment, PaymentMethod } from "@/entities/payment/payment.entity";
import { PlayerService } from "@/services/player/player.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";
import { EditPaymentDialog } from "@/components/payment/edit-payment-dialog";

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO", label: "Cartão" },
];

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function PaymentListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [month, setMonth] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [onlyPending, setOnlyPending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [players, setPlayers] = useState<ProfilePlayer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlayerId, setNewPlayerId] = useState("");
  const [newMonth, setNewMonth] = useState("");
  const [creating, setCreating] = useState(false);
  const [methodDraft, setMethodDraft] = useState<Record<string, PaymentMethod>>({});
  const [paidAtDraft, setPaidAtDraft] = useState<Record<string, string>>({});
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const deleteDialog = useConfirmDialog();

  async function load() {
    try {
      setLoading(true);
      const data = await PaymentService.search({
        month: month || undefined,
        pending: onlyPending || undefined,
        search: search || undefined,
      });
      setPayments(data ?? []);
    } catch {
      toast.error("Falha ao buscar pagamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadPlayers() {
      try {
        const data = await PlayerService.findAll({ page: 0, size: 200, sort: "firstname,asc" });
        setPlayers(data?.content ?? data ?? []);
      } catch {
        toast.error("Falha ao carregar atletas");
      }
    }
    loadPlayers();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreatePayment = async () => {
    if (!newPlayerId || !newMonth) {
      toast.error("Selecione o atleta e o mês");
      return;
    }

    try {
      setCreating(true);
      await PaymentService.create(newPlayerId, newMonth);
      toast.success("Pagamento lançado com sucesso");
      setNewPlayerId("");
      setShowCreateForm(false);
      if (newMonth === month) {
        await load();
      }
    } catch {
      toast.error("Não foi possível lançar o pagamento");
    } finally {
      setCreating(false);
    }
  };

  const onMarkAsPaid = async (id: string) => {
    const method = methodDraft[id];
    if (!method) {
      toast.error("Selecione a forma de pagamento");
      return;
    }

    try {
      await PaymentService.markAsPaid(id, method, paidAtDraft[id] || todayStr());
      toast.success("Pagamento marcado como pago");
      await load();
    } catch {
      toast.error("Não foi possível marcar o pagamento como pago");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await PaymentService.delete(id);
      toast.success("Pagamento removido");
      await load();
    } catch {
      toast.error("Não foi possível remover o pagamento");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Pagamentos</Label>
        <Button onClick={() => setShowCreateForm((prev) => !prev)}>
          {showCreateForm ? "Cancelar" : "Novo pagamento"}
        </Button>
      </div>

      {showCreateForm && (
        <section className="flex flex-wrap items-end gap-4 rounded border p-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Atleta</Label>
            <select
              className="border rounded px-2 py-1 text-sm min-w-48"
              value={newPlayerId}
              onChange={(e) => setNewPlayerId(e.target.value)}
            >
              <option value="">Selecione o atleta</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstname} {p.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Mês</Label>
            <Input
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              placeholder="Ex: 2025-01"
            />
          </div>

          <Button onClick={onCreatePayment} disabled={creating}>
            {creating ? "Lançando..." : "Lançar pagamento"}
          </Button>
        </section>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Buscar por aluno ou responsável</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome do aluno ou do responsável"
            className="min-w-64"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Mês (deixe em branco pra ver todos)</Label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="onlyPending"
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
          />
          <Label htmlFor="onlyPending" className="text-sm">
            Apenas pendentes
          </Label>
        </div>

        <Button onClick={load} disabled={loading}>
          {loading ? "Carregando..." : "Buscar"}
        </Button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Atleta</th>
              <th className="text-left p-3">Responsável</th>
              <th className="text-left p-3">Mês</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Pago em</th>
              <th className="text-left p-3">Forma</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={8}>
                  Carregando...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={8}>
                  Nenhum pagamento encontrado
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.playerName ?? "-"}</td>
                  <td className="p-3">{p.responsibleName ?? "-"}</td>
                  <td className="p-3">{p.month}</td>
                  <td className="p-3">{p.status ? "Pago" : "Pendente"}</td>
                  <td className="p-3">{p.paidAt ?? "-"}</td>
                  <td className="p-3">
                    {paymentMethodOptions.find((o) => o.value === p.paymentMethod)?.label ?? "-"}
                  </td>
                  <td className="p-3">
                    {p.amount != null
                      ? p.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "-"}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {!p.status && (
                      <>
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={methodDraft[p.id] ?? ""}
                          onChange={(e) =>
                            setMethodDraft((prev) => ({
                              ...prev,
                              [p.id]: e.target.value as PaymentMethod,
                            }))
                          }
                        >
                          <option value="">Forma de pagamento</option>
                          {paymentMethodOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="date"
                          className="h-8 w-40 inline-block"
                          value={paidAtDraft[p.id] ?? todayStr()}
                          onChange={(e) =>
                            setPaidAtDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkAsPaid(p.id)}
                        >
                          Marcar como pago
                        </Button>
                      </>
                    )}
                    {p.status && (
                      <Button variant="outline" size="sm" onClick={() => setEditingPayment(p)}>
                        Editar
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDialog.open(p.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Excluir pagamento?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />

      <EditPaymentDialog
        payment={editingPayment}
        onOpenChange={(open) => !open && setEditingPayment(null)}
        onSaved={load}
      />
    </LayoutContent>
  );
}
