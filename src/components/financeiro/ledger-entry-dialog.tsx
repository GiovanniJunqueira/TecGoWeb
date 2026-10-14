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
import { FinanceiroService } from "@/services/financeiro/financeiro.service";
import type { LedgerCategory, LedgerEntry, LedgerType } from "@/entities/financeiro/financeiro.entity";
import type { PaymentMethod } from "@/entities/payment/payment.entity";
import { LedgerCategoryDialog } from "@/components/financeiro/ledger-category-dialog";
import { toast } from "sonner";

interface LedgerEntryDialogProps {
  open: boolean;
  type: LedgerType;
  entry: LedgerEntry | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO", label: "Cartão" },
];

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function LedgerEntryDialog({ open, type, entry, onOpenChange, onSaved }: LedgerEntryDialogProps) {
  const isEdit = Boolean(entry);
  const [categories, setCategories] = useState<LedgerCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await FinanceiroService.findCategories(type);
      setCategories(data ?? []);
    } catch {
      toast.error("Não foi possível carregar as categorias");
    }
  }, [type]);

  useEffect(() => {
    if (!open) return;

    loadCategories();
    setCategoryId(entry?.categoryId ?? "");
    setAmount(entry ? String(entry.amount) : "");
    setDate(entry?.date ?? today());
    setPaymentMethod(entry?.paymentMethod ?? "");
    setDescription(entry?.description ?? "");
  }, [open, entry, loadCategories]);

  const handleCategorySaved = async (category: LedgerCategory) => {
    await loadCategories();
    setCategoryId(category.id);
  };

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!categoryId || !date || amount === "" || Number.isNaN(value) || value <= 0) {
      toast.error("Escolha a categoria e informe um valor maior que zero");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        categoryId,
        amount: value,
        date,
        description: description.trim() || undefined,
        paymentMethod: (paymentMethod || undefined) as PaymentMethod | undefined,
      };
      if (entry) {
        await FinanceiroService.updateEntry(entry.id, payload);
        toast.success("Lançamento atualizado");
      } else {
        await FinanceiroService.createEntry(payload);
        toast.success(type === "ENTRADA" ? "Entrada registrada" : "Saída registrada");
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível salvar o lançamento");
    } finally {
      setSaving(false);
    }
  };

  const isIncome = type === "ENTRADA";
  const hasCurrentCategory = categories.some((c) => c.id === categoryId);

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEdit ? "Editar lançamento" : isIncome ? "Nova entrada" : "Nova saída"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isIncome
                ? "Dinheiro que entrou na escolinha além das mensalidades e vendas de produtos."
                : "Dinheiro que saiu da escolinha."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Categoria</Label>
                <button
                  type="button"
                  className="text-sm text-primary underline underline-offset-4"
                  onClick={() => setCategoryDialogOpen(true)}
                >
                  + Nova categoria
                </button>
              </div>
              <select
                className="border rounded px-3 py-2 text-sm w-full h-9"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">
                  {categories.length === 0 ? "Nenhuma categoria — crie uma" : "Selecione a categoria"}
                </option>
                {entry && !hasCurrentCategory && (
                  <option value={entry.categoryId}>{entry.categoryName}</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Forma de pagamento (opcional)</Label>
              <select
                className="border rounded px-3 py-2 text-sm w-full h-9"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Não informar</option>
                {paymentMethodOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Descrição (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isIncome ? "Ex: Rifa do torneio" : "Ex: Compra de bolas"}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LedgerCategoryDialog
        open={categoryDialogOpen}
        type={type}
        category={null}
        onOpenChange={setCategoryDialogOpen}
        onSaved={handleCategorySaved}
      />
    </>
  );
}
