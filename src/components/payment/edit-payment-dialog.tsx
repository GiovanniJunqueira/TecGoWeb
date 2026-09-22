import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentService } from "@/services/payment/payment.service";
import type { Payment, PaymentMethod } from "@/entities/payment/payment.entity";
import { toast } from "sonner";

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO", label: "Cartão" },
];

interface EditPaymentDialogProps {
  payment: Payment | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditPaymentDialog({ payment, onOpenChange, onSaved }: EditPaymentDialogProps) {
  const [paidAt, setPaidAt] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [saving, setSaving] = useState(false);
  const [markingPending, setMarkingPending] = useState(false);

  useEffect(() => {
    if (payment) {
      setPaidAt(payment.paidAt ?? "");
      setAmount(payment.amount != null ? String(payment.amount) : "");
      setPaymentMethod(payment.paymentMethod ?? "");
    }
  }, [payment]);

  const busy = saving || markingPending;

  const onSave = async () => {
    if (!payment) return;
    try {
      setSaving(true);
      await PaymentService.editPayment(payment.id, {
        paidAt: paidAt || undefined,
        amount: amount !== "" ? Number(amount) : undefined,
        paymentMethod: paymentMethod || undefined,
      });
      toast.success("Pagamento atualizado");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível atualizar o pagamento");
    } finally {
      setSaving(false);
    }
  };

  const onMarkPending = async () => {
    if (!payment) return;
    try {
      setMarkingPending(true);
      await PaymentService.markAsPending(payment.id);
      toast.success("Pagamento marcado como pendente");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível marcar como pendente");
    } finally {
      setMarkingPending(false);
    }
  };

  return (
    <AlertDialog open={!!payment} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Editar pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            {payment?.playerName} — {payment?.month}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Data do pagamento</Label>
            <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Valor</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Forma de pagamento</Label>
            <select
              className="border rounded px-3 py-2 text-sm w-full h-9"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="">Selecione</option>
              {paymentMethodOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onMarkPending} disabled={busy}>
            {markingPending ? "Marcando..." : "Marcar como pendente"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={busy}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
