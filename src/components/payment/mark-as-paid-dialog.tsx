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

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface MarkAsPaidDialogProps {
  payment: Payment | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function MarkAsPaidDialog({ payment, onOpenChange, onSaved }: MarkAsPaidDialogProps) {
  const [paidAt, setPaidAt] = useState(todayStr());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      setPaidAt(todayStr());
      setPaymentMethod("");
    }
  }, [payment]);

  const onSave = async () => {
    if (!payment) return;
    if (!paymentMethod) {
      toast.error("Selecione a forma de pagamento");
      return;
    }

    try {
      setSaving(true);
      await PaymentService.markAsPaid(payment.id, paymentMethod, paidAt);
      toast.success("Pagamento marcado como pago");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível marcar o pagamento como pago");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={!!payment} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marcar como pago</AlertDialogTitle>
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

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
