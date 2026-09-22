import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaffService } from "@/services/staff/staff.service";
import {
  PERMISSION_GROUPS,
  STAFF_ROLE_LABELS,
  type Permission,
  type StaffRoleType,
  type StaffStatus,
} from "@/entities/staff/staff.entity";
import { toast } from "sonner";

const staffRoleOptions: { value: StaffRoleType; label: string }[] = (
  Object.keys(STAFF_ROLE_LABELS) as StaffRoleType[]
).map((value) => ({ value, label: STAFF_ROLE_LABELS[value] }));

export default function StaffFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    staffRole: "PROFESSOR" as StaffRoleType,
    customRoleLabel: "",
    phone: "",
    document: "",
    admissionDate: "",
    salary: "",
    notes: "",
    status: "ACTIVE" as StaffStatus,
  });
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await StaffService.findById(id);
        setForm({
          firstname: data.firstname ?? "",
          lastname: data.lastname ?? "",
          email: data.email ?? "",
          password: "",
          staffRole: data.staffRole,
          customRoleLabel: data.customRoleLabel ?? "",
          phone: data.phone ?? "",
          document: data.document ?? "",
          admissionDate: data.admissionDate ?? "",
          salary: data.salary != null ? String(data.salary) : "",
          notes: data.notes ?? "",
          status: data.status,
        });
        setPermissions(new Set(data.permissions ?? []));
      } catch {
        toast.error("Não foi possível carregar o profissional");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permission: Permission) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  };

  const toggleGroup = (groupPermissions: Permission[], checked: boolean) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      groupPermissions.forEach((p) => {
        if (checked) {
          next.add(p);
        } else {
          next.delete(p);
        }
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.firstname || !form.lastname) {
      toast.error("Preencha ao menos nome e sobrenome");
      return;
    }

    if (!isEdit && (!form.email || !form.password)) {
      toast.error("Preencha e-mail e senha para criar o acesso do profissional");
      return;
    }

    const basePayload = {
      firstname: form.firstname,
      lastname: form.lastname,
      staffRole: form.staffRole,
      customRoleLabel: form.staffRole === "OUTRO" ? form.customRoleLabel || null : null,
      phone: form.phone || null,
      document: form.document || null,
      admissionDate: form.admissionDate || null,
      salary: form.salary ? Number(form.salary) : null,
      notes: form.notes || null,
      permissions: Array.from(permissions),
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await StaffService.update(id, {
          ...basePayload,
          password: form.password || undefined,
          status: form.status,
        });
        toast.success("Profissional atualizado com sucesso");
      } else {
        await StaffService.create({
          ...basePayload,
          email: form.email,
          password: form.password,
        });
        toast.success("Profissional cadastrado com sucesso");
      }
      navigate("/profissionais");
    } catch {
      toast.error("Não foi possível salvar o profissional");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">
        {isEdit ? "Editar profissional" : "Novo profissional"}
      </Label>

      <section className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input
              value={form.firstname}
              onChange={(e) => updateField("firstname", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Sobrenome</Label>
            <Input
              value={form.lastname}
              onChange={(e) => updateField("lastname", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>E-mail de acesso</Label>
            <Input
              type="email"
              value={form.email}
              disabled={isEdit}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{isEdit ? "Nova senha (opcional)" : "Senha"}</Label>
            <Input
              type="password"
              value={form.password}
              placeholder={isEdit ? "Deixe em branco para manter a atual" : ""}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Função</Label>
            <select
              className="border rounded px-2 py-1 text-sm h-9"
              value={form.staffRole}
              onChange={(e) => updateField("staffRole", e.target.value as StaffRoleType)}
            >
              {staffRoleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {form.staffRole === "OUTRO" && (
            <div className="flex flex-col gap-2">
              <Label>Nome da função</Label>
              <Input
                value={form.customRoleLabel}
                onChange={(e) => updateField("customRoleLabel", e.target.value)}
                placeholder="Ex: Fisioterapeuta"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Documento (CPF)</Label>
            <Input
              value={form.document}
              onChange={(e) => updateField("document", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Data de admissão</Label>
            <Input
              type="date"
              value={form.admissionDate}
              onChange={(e) => updateField("admissionDate", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Salário</Label>
            <Input
              type="number"
              value={form.salary}
              onChange={(e) => updateField("salary", e.target.value)}
            />
          </div>

          {isEdit && (
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <select
                className="border rounded px-2 py-1 text-sm h-9"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value as StaffStatus)}
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Observações</Label>
            <textarea
              className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 max-w-4xl">
        <Label className="text-lg font-semibold">Acessos ao sistema</Label>
        <p className="text-sm text-muted-foreground">
          Marque o que este profissional pode ver e fazer em cada módulo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERMISSION_GROUPS.map((group) => {
            const groupValues = group.permissions.map((p) => p.value);
            const allChecked = groupValues.every((p) => permissions.has(p));
            const someChecked = groupValues.some((p) => permissions.has(p));

            return (
              <div key={group.module} className="rounded border p-4 space-y-2">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={(e) => toggleGroup(groupValues, e.target.checked)}
                  />
                  {group.module}
                </label>
                <div className="pl-6 space-y-1">
                  {group.permissions.map((p) => (
                    <label key={p.value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={permissions.has(p.value)}
                        onChange={() => togglePermission(p.value)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate("/profissionais")}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </LayoutContent>
  );
}
