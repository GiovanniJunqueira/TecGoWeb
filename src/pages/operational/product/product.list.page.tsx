import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProductService } from "@/services/product/product.service";
import type { Product } from "@/entities/product/product.entity";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProductFormDialog } from "@/components/product/product-form-dialog";
import { SaleFormDialog } from "@/components/product/sale-form-dialog";
import { StockDialog } from "@/components/product/stock-dialog";

type Tab = "ATIVOS" | "INATIVOS";

const LOW_STOCK_THRESHOLD = 5;

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("ATIVOS");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [sellingProductId, setSellingProductId] = useState<string | null>(null);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState<string | null>(null);

  async function load(targetTab: Tab = tab) {
    try {
      setLoading(true);
      const data = await ProductService.findAll(targetTab);
      setProducts(data ?? []);
    } catch {
      toast.error("Falha ao buscar produtos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (searchParams.get("novo")) {
      setEditingProductId(null);
      setFormOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("novo");
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onDeactivate = async (id: string) => {
    try {
      await ProductService.deactivate(id);
      toast.success("Produto inativado");
      load(tab);
    } catch {
      toast.error("Não foi possível inativar o produto");
    }
  };

  const onReactivate = async (id: string) => {
    try {
      await ProductService.reactivate(id);
      toast.success("Produto reativado");
      load(tab);
    } catch {
      toast.error("Não foi possível reativar o produto");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Produtos</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setEditingProductId(null);
              setFormOpen(true);
            }}
          >
            Novo produto
          </Button>
        </div>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "ATIVOS", label: "Ativos" },
          { value: "INATIVOS", label: "Inativos" },
        ]}
      />

      {loading ? (
        <div>Carregando...</div>
      ) : products.length === 0 ? (
        <div className="text-muted-foreground">
          {tab === "ATIVOS" ? "Nenhum produto cadastrado" : "Nenhum produto inativo"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border p-4 space-y-3">
              <div className="aspect-square w-full rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-sm">Sem foto</span>
                )}
              </div>
              <div>
                <div className="font-medium">{p.name}</div>
                {p.description && (
                  <div className="text-sm text-muted-foreground line-clamp-2">{p.description}</div>
                )}
                <div className="font-semibold mt-1">{formatPrice(p.price)}</div>
                <div
                  className={`text-sm mt-1 font-medium ${
                    p.stock === 0
                      ? "text-red-600 dark:text-red-400"
                      : p.stock <= LOW_STOCK_THRESHOLD
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {p.stock === 0
                    ? "Sem estoque"
                    : p.stock <= LOW_STOCK_THRESHOLD
                      ? `Estoque baixo: ${p.stock}`
                      : `Em estoque: ${p.stock}`}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tab === "ATIVOS" && (
                  <Button
                    size="sm"
                    disabled={p.stock === 0}
                    onClick={() => {
                      setSellingProductId(p.id);
                      setSaleDialogOpen(true);
                    }}
                  >
                    Vender
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setStockProductId(p.id)}>
                  Estoque
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProductId(p.id);
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
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        productId={editingProductId}
        onOpenChange={setFormOpen}
        onSaved={() => load(tab)}
      />

      <StockDialog
        open={stockProductId !== null}
        productId={stockProductId}
        onOpenChange={(open) => !open && setStockProductId(null)}
        onChanged={() => load(tab)}
      />

      <SaleFormDialog
        open={saleDialogOpen}
        defaultProductId={sellingProductId}
        onOpenChange={setSaleDialogOpen}
        onSaved={() => load(tab)}
      />
    </LayoutContent>
  );
}
