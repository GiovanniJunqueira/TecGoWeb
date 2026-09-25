import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PaymentPlanService } from "@/services/paymentplan/payment-plan.service";
import type { PaymentPlan } from "@/entities/paymentplan/payment-plan.entity";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PaymentPlanFormDialog } from "@/components/paymentplan/payment-plan-form-dialog";

type Tab = "ATIVOS" | "INATIVOS";

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaymentPlanListPage() {
  const [tab, setTab] = useState<Tab>("ATIVOS");
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  async function load(targetTab: Tab = tab) {
    try {
      setLoading(true);
      const data = await PaymentPlanService.findAll(targetTab);
      setPlans(data ?? []);
    } catch {
      toast.error("Falha ao buscar planos de pagamento");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const onDeactivate = async (id: string) => {
    try {
      await PaymentPlanService.deactivate(id);
      toast.success("Plano inativado");
      load(tab);
    } catch {
      toast.error("Não foi possível inativar o plano");
    }
  };

  const onReactivate = async (id: string) => {
    try {
      await PaymentPlanService.reactivate(id);
      toast.success("Plano reativado");
      load(tab);
    } catch {
      toast.error("Não foi possível reativar o plano");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Planos de Pagamento</Label>
        <Button
          onClick={() => {
            setEditingPlanId(null);
            setFormOpen(true);
          }}
        >
          Novo plano
        </Button>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "ATIVOS", label: "Ativos" },
          { value: "INATIVOS", label: "Inativos" },
        ]}
      />

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Até o dia 10</th>
              <th className="text-left p-3">Após o dia 10</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            ) : plans.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  {tab === "ATIVOS" ? "Nenhum plano cadastrado" : "Nenhum plano inativo"}
                </td>
              </tr>
            ) : (
              plans.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{formatPrice(p.priceOnTime)}</td>
                  <td className="p-3">{formatPrice(p.priceLate)}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPlanId(p.id);
                        setFormOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    {tab === "ATIVOS" ? (
                      <Button variant="outline" size="sm" onClick={() => onDeactivate(p.id)}>
                        Inativar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => onReactivate(p.id)}>
                        Reativar
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaymentPlanFormDialog
        open={formOpen}
        planId={editingPlanId}
        onOpenChange={setFormOpen}
        onSaved={() => load(tab)}
      />
    </LayoutContent>
  );
}
