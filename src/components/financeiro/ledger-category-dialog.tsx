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
import { FinanceiroService } from "@/services/financeiro/financeiro.service";
import type { LedgerCategory, LedgerType } from "@/entities/financeiro/financeiro.entity";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface LedgerCategoryDialogProps {
  open: boolean;
  type: LedgerType;
  category: LedgerCategory | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (category: LedgerCategory) => void;
}

export function LedgerCategoryDialog({ open, type, category, onOpenChange, onSaved }: LedgerCategoryDialogProps) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(category?.name ?? "");
  }, [open, category]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }

    try {
      setSaving(true);
      const saved = category
        ? await FinanceiroService.updateCategory(category.id, name.trim())
        : await FinanceiroService.createCategory({ name: name.trim(), type });
      toast.success(isEdit ? "Categoria atualizada" : "Categoria criada");
      onOpenChange(false);
      onSaved(saved);
    } catch (error) {
      const message = error instanceof AxiosError ? error.response?.data?.message : undefined;
      toast.error(message ?? "Não foi possível salvar a categoria");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = type === "ENTRADA" ? "entrada" : "saída";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isEdit ? "Editar categoria" : "Nova categoria"}</AlertDialogTitle>
          <AlertDialogDescription>Categoria de {typeLabel}. Ex: {type === "ENTRADA" ? "Doações, Eventos" : "Aluguel, Material esportivo"}.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Nome da categoria</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
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
  );
}
