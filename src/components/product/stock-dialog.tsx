import { useCallback, useEffect, useState } from "react";
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
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProductService } from "@/services/product/product.service";
import type { Product, StockMovement, StockMovementType } from "@/entities/product/product.entity";
import { toast } from "sonner";

type StockAction = "ENTRADA" | "AJUSTE";

const movementLabels: Record<StockMovementType, string> = {
  ENTRADA: "Chegou",
  VENDA: "Venda",
  ESTORNO: "Venda excluída",
  AJUSTE: "Ajuste",
};

interface StockDialogProps {
  open: boolean;
  productId: string | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StockDialog({ open, productId, onOpenChange, onChanged }: StockDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<StockAction>("ENTRADA");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const [productData, movementData] = await Promise.all([
        ProductService.findById(productId),
        ProductService.findStockMovements(productId),
      ]);
      setProduct(productData);
      setMovements(movementData ?? []);
    } catch {
      toast.error("Não foi possível carregar o estoque");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!open) return;
    setAction("ENTRADA");
    setQuantity("");
    setNote("");
    load();
  }, [open, load]);

  const handleSubmit = async () => {
    if (!productId) return;
    const value = Number(quantity);
    const min = action === "ENTRADA" ? 1 : 0;
    if (quantity === "" || !Number.isInteger(value) || value < min) {
      toast.error(
        action === "ENTRADA"
          ? "Informe quantas unidades chegaram (1 ou mais)"
          : "Informe a quantidade que você tem agora (0 ou mais)"
      );
      return;
    }

    try {
      setSaving(true);
      if (action === "ENTRADA") {
        await ProductService.addStock(productId, value, note.trim() || undefined);
        toast.success("Estoque atualizado");
      } else {
        await ProductService.adjustStock(productId, value, note.trim() || undefined);
        toast.success("Estoque ajustado");
      }
      setQuantity("");
      setNote("");
      await load();
      onChanged();
    } catch {
      toast.error("Não foi possível atualizar o estoque");
    } finally {
      setSaving(false);
    }
  };

  const stock = product?.stock ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Estoque{product ? ` — ${product.name}` : ""}</AlertDialogTitle>
          <AlertDialogDescription>
            As vendas baixam o estoque sozinhas. Aqui você registra o que chegou ou corrige a quantidade.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading && !product ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            <div className="rounded border p-4 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Em estoque agora</span>
              <span className={`text-3xl font-bold ${stock === 0 ? "text-red-500" : ""}`}>{stock}</span>
            </div>

            <div className="space-y-3">
              <SegmentedControl
                value={action}
                onChange={(value) => {
                  setAction(value);
                  setQuantity("");
                }}
                options={[
                  { value: "ENTRADA", label: "Chegou mais" },
                  { value: "AJUSTE", label: "Corrigir quantidade" },
                ]}
              />

              <div className="flex flex-col gap-2">
                <Label className="text-sm">
                  {action === "ENTRADA" ? "Quantas unidades chegaram?" : "Quantas unidades você tem agora?"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={action === "ENTRADA" ? 1 : 0}
                    step={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  {action === "AJUSTE" && (
                    <Button type="button" variant="outline" onClick={() => setQuantity("0")}>
                      Acabou
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Observação (opcional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={action === "ENTRADA" ? "Ex: Compra do fornecedor" : "Ex: Contagem do mês, perda"}
                />
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={saving}>
                {saving ? "Salvando..." : action === "ENTRADA" ? "Registrar entrada" : "Salvar quantidade"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Histórico</Label>
              <div className="overflow-auto rounded border max-h-56">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2">Quando</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-right p-2">Qtd</th>
                      <th className="text-right p-2">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.length === 0 ? (
                      <tr>
                        <td className="p-2 text-muted-foreground" colSpan={4}>
                          Nenhuma movimentação ainda
                        </td>
                      </tr>
                    ) : (
                      movements.map((m) => (
                        <tr key={m.id} className="border-t align-top">
                          <td className="p-2 whitespace-nowrap">{formatDateTime(m.createdAt)}</td>
                          <td className="p-2">
                            {movementLabels[m.type]}
                            {m.note && <div className="text-xs text-muted-foreground">{m.note}</div>}
                          </td>
                          <td
                            className={`p-2 text-right font-medium ${m.quantity < 0 ? "text-red-600" : "text-emerald-600"}`}
                          >
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </td>
                          <td className="p-2 text-right">{m.balanceAfter}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
