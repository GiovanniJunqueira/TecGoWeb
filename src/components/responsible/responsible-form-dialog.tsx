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
import { ResponsibleService } from "@/services/responsible/responsible.service";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { toast } from "sonner";

interface ResponsibleFormDialogProps {
  open: boolean;
  responsibleId: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  document: "",
  address: "",
  addressNumber: "",
  addressNeighborhood: "",
  addressComplement: "",
  postcode: "",
};

export function ResponsibleFormDialog({ open, responsibleId, onOpenChange, onSaved }: ResponsibleFormDialogProps) {
  const isEdit = Boolean(responsibleId);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!responsibleId) {
      setForm(emptyForm);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await ResponsibleService.findById(responsibleId);
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
  }, [open, responsibleId]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast.error("Preencha ao menos nome e telefone");
      return;
    }

    const payload: Omit<Responsible, "id"> = { ...form, students: [] };

    try {
      setSaving(true);
      if (isEdit && responsibleId) {
        await ResponsibleService.update(responsibleId, payload);
        toast.success("Responsável atualizado com sucesso");
      } else {
        await ResponsibleService.create(payload);
        toast.success("Responsável cadastrado com sucesso");
      }
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível salvar o responsável");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{isEdit ? "Editar responsável" : "Novo responsável"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isEdit ? "Atualize os dados do responsável." : "Cadastre um novo responsável."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Nome</Label>
                <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Telefone</Label>
                <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Documento (CPF)</Label>
                <Input
                  value={form.document}
                  onChange={(e) => updateField("document", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-sm">Endereço</Label>
                <Input
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Número</Label>
                <Input
                  value={form.addressNumber}
                  onChange={(e) => updateField("addressNumber", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Bairro</Label>
                <Input
                  value={form.addressNeighborhood}
                  onChange={(e) => updateField("addressNeighborhood", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">Complemento</Label>
                <Input
                  value={form.addressComplement}
                  onChange={(e) => updateField("addressComplement", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm">CEP</Label>
                <Input
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                />
              </div>
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
