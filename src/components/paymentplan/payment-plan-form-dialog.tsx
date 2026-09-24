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
import { PaymentPlanService } from "@/services/paymentplan/payment-plan.service";
import { toast } from "sonner";

interface PaymentPlanFormDialogProps {
  open: boolean;
  planId: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function PaymentPlanFormDialog({ open, planId, onOpenChange, onSaved }: PaymentPlanFormDialogProps) {
  const isEdit = Boolean(planId);
  const [form, setForm] = useState({ name: "", priceOnTime: "", priceLate: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!planId) {
      setForm({ name: "", priceOnTime: "", priceLate: "" });
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const plan = await PaymentPlanService.findById(planId);
        setForm({
          name: plan.name ?? "",
          priceOnTime: String(plan.priceOnTime ?? ""),
          priceLate: String(plan.priceLate ?? ""),
        });
      } catch {
        toast.error("Não foi possível carregar o plano");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, planId]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const priceOnTime = Number(form.priceOnTime);
    const priceLate = Number(form.priceLate);
    if (!form.name || form.priceOnTime === "" || form.priceLate === "" || Number.isNaN(priceOnTime) || Number.isNaN(priceLate)) {
      toast.error("Preencha nome e os dois valores");
      return;
    }

    try {
      setSaving(true);
      const payload = { name: form.name, priceOnTime, priceLate };
      if (isEdit && planId) {
        await PaymentPlanService.update(planId, payload);
        toast.success("Plano atualizado com sucesso");
      } else {
        await PaymentPlanService.create(payload);
        toast.success("Plano cadastrado com sucesso");
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível salvar o plano");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isEdit ? "Editar plano" : "Novo plano"}</AlertDialogTitle>
          <AlertDialogDescription>
            Para um plano de bolsa (aluno que não paga), use 0 nos dois valores.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Nome do plano</Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ex: 2x por semana"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Até o dia 10 (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.priceOnTime}
                  onChange={(e) => updateField("priceOnTime", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Após o dia 10 (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.priceLate}
                  onChange={(e) => updateField("priceLate", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
