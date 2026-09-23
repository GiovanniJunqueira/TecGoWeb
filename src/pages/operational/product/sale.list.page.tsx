import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaleService } from "@/services/product/sale.service";
import type { Sale } from "@/entities/product/product.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";

const paymentMethodLabels: Record<string, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
};

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function SaleListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const deleteDialog = useConfirmDialog();

  async function load(targetMonth = month) {
    try {
      setLoading(true);
      const data = await SaleService.findAll(targetMonth);
      setSales(data ?? []);
    } catch {
      toast.error("Falha ao buscar vendas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const onDelete = async (id: string) => {
    try {
      await SaleService.delete(id);
      toast.success("Venda removida");
      load();
    } catch {
      toast.error("Não foi possível remover a venda");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Vendas</Label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/produtos")}>
            Ver produtos
          </Button>
          <Button onClick={() => navigate("/produtos/vendas/nova")}>Registrar venda</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Mês</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => load(month)} disabled={loading}>
          {loading ? "Carregando..." : "Filtrar"}
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          Total do mês: <span className="font-semibold text-foreground">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Qtd</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Comprador</th>
              <th className="text-left p-3">Forma de pagto.</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={7}>
                  Carregando...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={7}>
                  Nenhuma venda neste mês
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.soldAt}</td>
                  <td className="p-3">{s.productName}</td>
                  <td className="p-3">{s.quantity}</td>
                  <td className="p-3">{formatPrice(s.totalAmount)}</td>
                  <td className="p-3">{s.buyerName ?? "-"}</td>
                  <td className="p-3">{paymentMethodLabels[s.paymentMethod] ?? s.paymentMethod}</td>
                  <td className="p-3 text-right">
                    <Button variant="destructive" size="sm" onClick={() => deleteDialog.open(s.id)}>
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
        title="Excluir venda?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
