import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProductService } from "@/services/product/product.service";
import type { Product } from "@/entities/product/product.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SegmentedControl } from "@/components/ui/segmented-control";

type Tab = "ATIVOS" | "INATIVOS";

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductListPage() {
  const [tab, setTab] = useState<Tab>("ATIVOS");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Produtos</Label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/produtos/vendas")}>
            Ver vendas
          </Button>
          <Button onClick={() => navigate("/produtos/novo")}>Novo produto</Button>
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
            <div key={p.id} className="rounded border p-4 space-y-3">
              <div className="aspect-square w-full rounded bg-muted overflow-hidden flex items-center justify-center">
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
              </div>
              <div className="flex flex-wrap gap-2">
                {tab === "ATIVOS" && (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/produtos/vendas/nova?produtoId=${p.id}`)}
                  >
                    Vender
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/produtos/editar/${p.id}`)}
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
    </LayoutContent>
  );
}
