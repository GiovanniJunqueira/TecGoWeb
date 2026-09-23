import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductService } from "@/services/product/product.service";
import { toast } from "sonner";

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);
        const product = await ProductService.findById(id);
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
  }, [id, isEdit]);

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
      if (isEdit && id) {
        await ProductService.update(id, payload);
        toast.success("Produto atualizado com sucesso");
      } else {
        await ProductService.create(payload);
        toast.success("Produto cadastrado com sucesso");
      }
      navigate("/produtos");
    } catch {
      toast.error("Não foi possível salvar o produto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">
        {isEdit ? "Editar produto" : "Novo produto"}
      </Label>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <section className="space-y-4 max-w-2xl">
          {photoUrl && (
            <img src={photoUrl} alt={form.name} className="size-24 rounded-lg object-cover" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Nome do produto</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Descrição</Label>
              <textarea
                className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>{photoUrl ? "Trocar foto (opcional)" : "Foto"}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/produtos")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving || loading}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </LayoutContent>
  );
}
