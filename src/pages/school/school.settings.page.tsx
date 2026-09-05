import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolService } from "@/services/schollService/school.service";
import { useAuth } from "@/contexts/auth/auth.context";
import { toast } from "sonner";

export default function SchoolSettingsPage() {
  const { refreshSchool } = useAuth();
  const [form, setForm] = useState({ name: "", cnpj: "", address: "", city: "" });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const school = await SchoolService.get();
        setForm({
          name: school.name ?? "",
          cnpj: school.cnpj ?? "",
          address: school.address ?? "",
          city: school.city ?? "",
        });
        setLogoUrl(school.logoUrl ?? null);
      } catch {
        toast.error("Não foi possível carregar os dados da escola");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.city) {
      toast.error("Preencha nome, endereço e cidade");
      return;
    }

    try {
      setSaving(true);
      const updated = await SchoolService.update({
        name: form.name,
        address: form.address,
        city: form.city,
        logo,
      });
      setLogoUrl(updated.logoUrl ?? logoUrl);
      setLogo(null);
      await refreshSchool();
      toast.success("Dados da escola atualizados com sucesso");
    } catch {
      toast.error("Não foi possível atualizar os dados da escola");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">Dados da escola</Label>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <section className="space-y-4 max-w-2xl">
          {logoUrl && (
            <img src={logoUrl} alt={form.name} className="size-16 rounded-lg object-cover" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nome da escola</Label>
              <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} disabled />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Endereço</Label>
              <Input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Cidade</Label>
              <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Trocar logo (opcional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </section>
      )}
    </LayoutContent>
  );
}
