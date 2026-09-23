import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentPlanService } from "@/services/paymentplan/payment-plan.service";
import { toast } from "sonner";

export default function PaymentPlanFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", priceOnTime: "", priceLate: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);
        const plan = await PaymentPlanService.findById(id);
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
  }, [id, isEdit]);

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
      if (isEdit && id) {
        await PaymentPlanService.update(id, payload);
        toast.success("Plano atualizado com sucesso");
      } else {
        await PaymentPlanService.create(payload);
        toast.success("Plano cadastrado com sucesso");
      }
      navigate("/planos-pagamento");
    } catch {
      toast.error("Não foi possível salvar o plano");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">{isEdit ? "Editar plano" : "Novo plano"}</Label>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <section className="space-y-4 max-w-xl">
          <div className="flex flex-col gap-2">
            <Label>Nome do plano</Label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ex: 2x por semana, 3x por semana (bolsa)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Valor até o dia 10 (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.priceOnTime}
                onChange={(e) => updateField("priceOnTime", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Valor após o dia 10 (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.priceLate}
                onChange={(e) => updateField("priceLate", e.target.value)}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Para um plano de bolsa (aluno que não paga), use 0 nos dois campos.
          </p>
        </section>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/planos-pagamento")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving || loading}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </LayoutContent>
  );
}
