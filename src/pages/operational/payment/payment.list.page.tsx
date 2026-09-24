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
import { MarkAsPaidDialog } from "@/components/payment/mark-as-paid-dialog";
import { CreatePaymentDialog } from "@/components/payment/create-payment-dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

type StatusFilter = "TODOS" | "PENDENTES" | "PAGOS";

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO", label: "Cartão" },
];

export default function PaymentListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [month, setMonth] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [colorize, setColorize] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [players, setPlayers] = useState<ProfilePlayer[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const deleteDialog = useConfirmDialog();

  async function load() {
    try {
      setLoading(true);
      const data = await PaymentService.search({
        month: month || undefined,
        status: statusFilter === "PAGOS" ? true : statusFilter === "PENDENTES" ? false : undefined,
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
        <Button onClick={() => setCreateDialogOpen(true)}>Novo pagamento</Button>
      </div>

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

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Status</Label>
          <SegmentedControl
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "TODOS", label: "Todos" },
              { value: "PENDENTES", label: "Pendentes" },
              { value: "PAGOS", label: "Pagos" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="colorize"
            type="checkbox"
            checked={colorize}
            onChange={(e) => setColorize(e.target.checked)}
          />
          <Label htmlFor="colorize" className="text-sm">
            Colorir linhas
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
                <tr
                  key={p.id}
                  className={cn(
                    "border-t",
                    colorize && (p.status ? "bg-green-50" : "bg-red-50")
                  )}
                >
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
                    {!p.status ? (
                      <Button variant="outline" size="sm" onClick={() => setMarkingPaid(p)}>
                        Marcar como pago
                      </Button>
                    ) : (
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

      <MarkAsPaidDialog
        payment={markingPaid}
        onOpenChange={(open) => !open && setMarkingPaid(null)}
        onSaved={load}
      />

      <CreatePaymentDialog
        open={createDialogOpen}
        players={players}
        onOpenChange={setCreateDialogOpen}
        onSaved={load}
      />

      <EditPaymentDialog
        payment={editingPayment}
        onOpenChange={(open) => !open && setEditingPayment(null)}
        onSaved={load}
      />
    </LayoutContent>
  );
}
