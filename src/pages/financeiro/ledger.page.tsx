import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FinanceiroService } from "@/services/financeiro/financeiro.service";
import type { LedgerEntry, LedgerType } from "@/entities/financeiro/financeiro.entity";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";
import { LedgerEntryDialog } from "@/components/financeiro/ledger-entry-dialog";
import { LedgerCategoriesDialog } from "@/components/financeiro/ledger-categories-dialog";
import { toast } from "sonner";

const paymentMethodLabels: Record<string, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
};

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function LedgerPage() {
  const [tab, setTab] = useState<LedgerType>("ENTRADA");
  const [month, setMonth] = useState(currentMonth());
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const deleteDialog = useConfirmDialog();

  async function load() {
    try {
      setLoading(true);
      setEntries((await FinanceiroService.findEntries({ month, type: tab })) ?? []);
    } catch {
      toast.error("Não foi possível carregar os lançamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, month]);

  const onDelete = async (id: string) => {
    try {
      await FinanceiroService.deleteEntry(id);
      toast.success("Lançamento removido");
      load();
    } catch {
      toast.error("Não foi possível remover o lançamento");
    }
  };

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const isIncome = tab === "ENTRADA";

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Entradas e Saídas</Label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setCategoriesDialogOpen(true)}>
            Categorias
          </Button>
          <Button
            onClick={() => {
              setEditingEntry(null);
              setEntryDialogOpen(true);
            }}
          >
            {isIncome ? "Nova entrada" : "Nova saída"}
          </Button>
        </div>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "ENTRADA", label: "Entradas" },
          { value: "SAIDA", label: "Saídas" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-4">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <Label className="text-sm">Mês</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
        <div className="sm:ml-auto text-sm text-muted-foreground">
          Total do mês:{" "}
          <span className={`font-semibold ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3">Forma</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={6}>
                  {isIncome ? "Nenhuma entrada neste mês" : "Nenhuma saída neste mês"}
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{formatDate(e.date)}</td>
                  <td className="p-3">{e.categoryName}</td>
                  <td className="p-3">{e.description ?? "-"}</td>
                  <td className="p-3">
                    {e.paymentMethod ? paymentMethodLabels[e.paymentMethod] ?? e.paymentMethod : "-"}
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatPrice(e.amount)}</td>
                  <td className="p-3 text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingEntry(e);
                        setEntryDialogOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteDialog.open(e.id)}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LedgerEntryDialog
        open={entryDialogOpen}
        type={tab}
        entry={editingEntry}
        onOpenChange={setEntryDialogOpen}
        onSaved={load}
      />

      <LedgerCategoriesDialog
        open={categoriesDialogOpen}
        type={tab}
        onOpenChange={setCategoriesDialogOpen}
        onChanged={load}
      />

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Excluir lançamento?"
        description="Essa ação não pode ser desfeita."
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
