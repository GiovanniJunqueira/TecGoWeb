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

type ViewSize = "lista" | "pequena" | "grande";
const VIEW_STORAGE_KEY = "produtos.visualizacao";

// Tamanho das fotos: lembra a escolha só neste navegador (se o armazenamento falhar, usa "pequena").
function readViewSize(): ViewSize {
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "lista" || saved === "pequena" || saved === "grande") return saved;
  } catch {
    // sem armazenamento local
  }
  return "pequena";
}

const GRID_CLASS: Record<ViewSize, string> = {
  lista: "grid grid-cols-1 gap-2",
  pequena: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3",
  grande: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
};

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
  const [viewSize, setViewSizeState] = useState<ViewSize>(readViewSize);
  const setViewSize = (value: ViewSize) => {
    setViewSizeState(value);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, value);
    } catch {
      // sem armazenamento local
    }
  };

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "ATIVOS", label: "Ativos" },
            { value: "INATIVOS", label: "Inativos" },
          ]}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Fotos</span>
          <SegmentedControl
            value={viewSize}
            onChange={setViewSize}
            options={[
              { value: "lista", label: "Lista" },
              { value: "pequena", label: "Pequenas" },
              { value: "grande", label: "Grandes" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : products.length === 0 ? (
        <div className="text-muted-foreground">
          {tab === "ATIVOS" ? "Nenhum produto cadastrado" : "Nenhum produto inativo"}
        </div>
      ) : (
        <div className={GRID_CLASS[viewSize]}>
          {products.map((p) => (
            <div
              key={p.id}
              className={
                viewSize === "lista"
                  ? "rounded-xl border p-3 flex flex-wrap items-center gap-3"
                  : `rounded-xl border space-y-3 ${viewSize === "pequena" ? "p-3" : "p-4"}`
              }
            >
              <div
                className={`rounded-xl bg-muted overflow-hidden flex items-center justify-center shrink-0 ${
                  viewSize === "lista" ? "size-16" : viewSize === "pequena" ? "aspect-[4/3] w-full" : "aspect-square w-full"
                }`}
              >
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs">Sem foto</span>
                )}
              </div>
              <div className={viewSize === "lista" ? "min-w-0 flex-1" : ""}>
                <div className="font-medium">{p.name}</div>
                {p.description && viewSize !== "lista" && (
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
