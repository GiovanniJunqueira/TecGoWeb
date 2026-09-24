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
import { ProductService } from "@/services/product/product.service";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  productId: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ProductFormDialog({ open, productId, onOpenChange, onSaved }: ProductFormDialogProps) {
  const isEdit = Boolean(productId);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setPhoto(null);

    if (!productId) {
      setForm({ name: "", description: "", price: "" });
      setPhotoUrl(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const product = await ProductService.findById(productId);
        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          price: String(product.price ?? ""),
        });
        setPhotoUrl(product.photoUrl ?? null);
      } catch {
        toast.error("Não foi possível carregar o produto");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, productId]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const price = Number(form.price);
    if (!form.name || !form.price || Number.isNaN(price) || price <= 0) {
      toast.error("Preencha nome e um preço válido");
      return;
    }

    try {
      setSaving(true);
      const payload = { name: form.name, description: form.description, price, photoFile: photo };
      if (isEdit && productId) {
        await ProductService.update(productId, payload);
        toast.success("Produto atualizado com sucesso");
      } else {
        await ProductService.create(payload);
        toast.success("Produto cadastrado com sucesso");
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível salvar o produto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isEdit ? "Atualize os dados do produto." : "Cadastre um novo produto da lojinha."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {photoUrl && (
              <img src={photoUrl} alt={form.name} className="size-20 rounded-lg object-cover" />
            )}

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Nome do produto</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">Descrição</Label>
              <textarea
                className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm">{photoUrl ? "Trocar foto (opcional)" : "Foto"}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
