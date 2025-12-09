import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentService } from "@/services/payment/payment.service";
import type { Payment } from "@/entities/payment/payment.entity";
import { toast } from "sonner";

export default function PaymentListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [month, setMonth] = useState<string>("");
  const [onlyPending, setOnlyPending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  async function load() {
    if (!month) {
      toast.error("Informe o mês para buscar os pagamentos");
      return;
    }

    try {
      setLoading(true);
      const data = onlyPending
        ? await PaymentService.getPendingByMonth(month)
        : await PaymentService.getByMonth(month);
      setPayments(data ?? []);
    } catch {
      toast.error("Falha ao buscar pagamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // opcionalmente podemos carregar o mês atual no futuro
  }, []);

  const onMarkAsPaid = async (id: string) => {
    try {
      await PaymentService.markAsPaid(id);
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
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Mês</Label>
          <Input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Ex: 2025-01"
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
              <th className="text-left p-3">Mês</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Pago em</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Carregando...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Nenhum pagamento encontrado
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.playerName ?? "-"}</td>
                  <td className="p-3">{p.month}</td>
                  <td className="p-3">{p.status ? "Pago" : "Pendente"}</td>
                  <td className="p-3">{p.paidAt ?? "-"}</td>
                  <td className="p-3 text-right space-x-2">
                    {!p.status && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onMarkAsPaid(p.id)}
                      >
                        Marcar como pago
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(p.id)}
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
    </LayoutContent>
  );
}
