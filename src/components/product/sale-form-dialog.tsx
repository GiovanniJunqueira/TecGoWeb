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
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProductService } from "@/services/product/product.service";
import { SaleService } from "@/services/product/sale.service";
import { PlayerService } from "@/services/player/player.service";
import type { Product } from "@/entities/product/product.entity";
import type { PaymentMethod } from "@/entities/payment/payment.entity";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { toast } from "sonner";

type BuyerType = "ALUNO" | "OUTRO";

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO", label: "Cartão" },
];

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface SaleFormDialogProps {
  open: boolean;
  defaultProductId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function SaleFormDialog({ open, defaultProductId, onOpenChange, onSaved }: SaleFormDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [players, setPlayers] = useState<ProfilePlayer[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [buyerType, setBuyerType] = useState<BuyerType>("ALUNO");
  const [playerSearch, setPlayerSearch] = useState("");
  const [buyerPlayerId, setBuyerPlayerId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setQuantity("1");
    setPaymentMethod("PIX");
    setBuyerType("ALUNO");
    setPlayerSearch("");
    setBuyerPlayerId("");
    setBuyerName("");
    setProductId(defaultProductId ?? "");

    async function load() {
      try {
        setLoading(true);
        const [productData, playerData] = await Promise.all([
          ProductService.findAll("ATIVOS"),
          PlayerService.findAll({ page: 0, size: 500, sort: "firstname,asc" }),
        ]);
        setProducts(productData ?? []);
        setPlayers(playerData?.content ?? playerData ?? []);
      } catch {
        toast.error("Falha ao carregar produtos e alunos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [open, defaultProductId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const qty = Number(quantity) || 0;
  const total = selectedProduct ? selectedProduct.price * qty : 0;

  const filteredPlayers = playerSearch
    ? players.filter((p) =>
        `${p.firstname} ${p.lastname}`.toLowerCase().includes(playerSearch.toLowerCase())
      )
    : players;

  const handleSubmit = async () => {
    if (!productId) {
      toast.error("Selecione um produto");
      return;
    }
    if (!qty || qty < 1) {
      toast.error("Informe uma quantidade válida");
      return;
    }
    if (buyerType === "ALUNO" && !buyerPlayerId) {
      toast.error("Selecione o aluno");
      return;
    }
    if (buyerType === "OUTRO" && !buyerName.trim()) {
      toast.error("Informe o nome do comprador");
      return;
    }

    try {
      setSaving(true);
      await SaleService.create({
        productId,
        quantity: qty,
        paymentMethod,
        buyerPlayerId: buyerType === "ALUNO" ? buyerPlayerId : undefined,
        buyerName: buyerType === "OUTRO" ? buyerName : undefined,
      });
      toast.success("Venda registrada com sucesso");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível registrar a venda");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Registrar venda</AlertDialogTitle>
          <AlertDialogDescription>Escolha o produto e quem comprou.</AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Produto</Label>
              <select
                className="border rounded px-2 py-1 text-sm h-9"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Selecione um produto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatPrice(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Forma de pagamento</Label>
                <select
                  className="border rounded px-2 py-1 text-sm h-9"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  {paymentMethodOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProduct && (
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground">{formatPrice(total)}</span>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm">Comprador</Label>
              <SegmentedControl
                value={buyerType}
                onChange={setBuyerType}
                options={[
                  { value: "ALUNO", label: "Aluno" },
                  { value: "OUTRO", label: "Outra pessoa" },
                ]}
              />

              {buyerType === "ALUNO" ? (
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    placeholder="Buscar aluno por nome"
                  />
                  <select
                    className="border rounded px-2 py-1 text-sm h-9"
                    value={buyerPlayerId}
                    onChange={(e) => setBuyerPlayerId(e.target.value)}
                  >
                    <option value="">Selecione o aluno</option>
                    {filteredPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstname} {p.lastname}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Nome do comprador"
                />
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? "Salvando..." : "Registrar venda"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
