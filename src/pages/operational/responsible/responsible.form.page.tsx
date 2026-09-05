import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { toast } from "sonner";

export default function ResponsibleFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
    address: "",
    addressNumber: "",
    addressNeighborhood: "",
    addressComplement: "",
    postcode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await ResponsibleService.findById(id);
        setForm({
          name: data.name ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          document: data.document ?? "",
          address: data.address ?? "",
          addressNumber: data.addressNumber ?? "",
          addressNeighborhood: data.addressNeighborhood ?? "",
          addressComplement: data.addressComplement ?? "",
          postcode: data.postcode ?? "",
        });
      } catch {
        toast.error("Não foi possível carregar o responsável");
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
    if (!form.name || !form.phone) {
      toast.error("Preencha ao menos nome e telefone");
      return;
    }

    const payload: Omit<Responsible, "id"> = {
      ...form,
      students: [],
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await ResponsibleService.update(id, payload);
        toast.success("Responsável atualizado com sucesso");
      } else {
        await ResponsibleService.create(payload);
        toast.success("Responsável cadastrado com sucesso");
      }
      navigate("/responsaveis");
    } catch {
      toast.error("Não foi possível salvar o responsável");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">
        {isEdit ? "Editar responsável" : "Novo responsável"}
      </Label>

      <section className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Documento (CPF)</Label>
            <Input
              value={form.document}
              onChange={(e) => updateField("document", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Número</Label>
            <Input
              value={form.addressNumber}
              onChange={(e) => updateField("addressNumber", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Bairro</Label>
            <Input
              value={form.addressNeighborhood}
              onChange={(e) => updateField("addressNeighborhood", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Complemento</Label>
            <Input
              value={form.addressComplement}
              onChange={(e) => updateField("addressComplement", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>CEP</Label>
            <Input
              value={form.postcode}
              onChange={(e) => updateField("postcode", e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/responsaveis")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </LayoutContent>
  );
}
