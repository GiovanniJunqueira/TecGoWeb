import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeacherService } from "@/services/teacher/teacher.service";
import type { Teacher, TeacherStatus } from "@/entities/teacher/teacher.entity";
import { toast } from "sonner";

const teacherStatusOptions: { value: TeacherStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export default function TeacherFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Teacher>>({
    name: "",
    email: "",
    phone: "",
    role: "",
    admissionDate: "",
    status: "ACTIVE",
    salary: null,
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await TeacherService.findById(id);
        setForm(data);
      } catch {
        toast.error("Não foi possível carregar o professor");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const updateField = <K extends keyof Teacher>(field: K, value: Teacher[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.role || !form.admissionDate) {
      toast.error("Preencha nome, função e data de admissão");
      return;
    }

    try {
      setLoading(true);
      const payload: Omit<Teacher, "id"> = {
        name: form.name!,
        email: form.email || "",
        phone: form.phone || "",
        role: form.role!,
        admissionDate: form.admissionDate!,
        status: (form.status as TeacherStatus) || "ACTIVE",
        salary: form.salary ?? null,
        notes: form.notes ?? null,
      };

      if (isEdit && id) {
        await TeacherService.update(id, payload);
        toast.success("Professor atualizado com sucesso");
      } else {
        await TeacherService.create(payload);
        toast.success("Professor cadastrado com sucesso");
      }

      navigate("/professores");
    } catch {
      toast.error("Não foi possível salvar o professor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">
        {isEdit ? "Editar professor" : "Novo professor"}
      </Label>

      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input
              value={form.name || ""}
              onChange={(e) => updateField("name", e.target.value as Teacher["name"])}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Função/Cargo</Label>
            <Input
              value={form.role || ""}
              onChange={(e) => updateField("role", e.target.value as Teacher["role"])}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form.email || ""}
              onChange={(e) => updateField("email", e.target.value as Teacher["email"])}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Telefone</Label>
            <Input
              value={form.phone || ""}
              onChange={(e) => updateField("phone", e.target.value as Teacher["phone"])}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Data de admissão</Label>
            <Input
              type="date"
              value={form.admissionDate || ""}
              onChange={(e) =>
                updateField("admissionDate", e.target.value as Teacher["admissionDate"])
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={form.status || "ACTIVE"}
              onChange={(e) =>
                updateField("status", e.target.value as Teacher["status"])
              }
            >
              {teacherStatusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Salário (opcional)</Label>
            <Input
              type="number"
              value={form.salary ?? ""}
              onChange={(e) =>
                updateField(
                  "salary",
                  (e.target.value ? Number(e.target.value) : null) as Teacher["salary"]
                )
              }
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Observações</Label>
            <Input
              value={form.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value as Teacher["notes"])}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/professores")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </LayoutContent>
  );
}
