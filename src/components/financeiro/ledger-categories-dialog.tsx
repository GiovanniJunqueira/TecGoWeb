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
import { FinanceiroService } from "@/services/financeiro/financeiro.service";
import type { LedgerCategory, LedgerType } from "@/entities/financeiro/financeiro.entity";
import { LedgerCategoryDialog } from "@/components/financeiro/ledger-category-dialog";
import { toast } from "sonner";

interface LedgerCategoriesDialogProps {
  open: boolean;
  type: LedgerType;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function LedgerCategoriesDialog({ open, type, onOpenChange, onChanged }: LedgerCategoriesDialogProps) {
  const [categories, setCategories] = useState<LedgerCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerCategory | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setCategories((await FinanceiroService.findCategories(type)) ?? []);
    } catch {
      toast.error("Não foi possível carregar as categorias");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleDeactivate = async (category: LedgerCategory) => {
    try {
      await FinanceiroService.deactivateCategory(category.id);
      toast.success("Categoria removida da lista");
      await load();
      onChanged();
    } catch {
      toast.error("Não foi possível remover a categoria");
    }
  };

  const handleSaved = async () => {
    await load();
    onChanged();
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Categorias de {type === "ENTRADA" ? "entrada" : "saída"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Remover uma categoria só a tira da lista; os lançamentos antigos continuam no balanço.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-[50vh] overflow-y-auto rounded-xl border divide-y">
            {loading ? (
              <div className="p-3 text-sm">Carregando...</div>
            ) : categories.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">Nenhuma categoria ainda.</div>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 p-3">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(c);
                        setFormOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeactivate(c)}>
                      Remover
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Nova categoria
            </Button>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LedgerCategoryDialog
        open={formOpen}
        type={type}
        category={editing}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
      />
    </>
  );
}
