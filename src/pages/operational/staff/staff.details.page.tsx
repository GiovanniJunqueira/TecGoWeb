import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StaffService } from "@/services/staff/staff.service";
import {
  PERMISSION_GROUPS,
  STAFF_ROLE_LABELS,
  type StaffMember,
} from "@/entities/staff/staff.entity";
import { toast } from "sonner";

export default function StaffDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await StaffService.findById(id);
        setStaff(data);
      } catch {
        toast.error("Não foi possível carregar o profissional");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const roleLabel = staff
    ? staff.staffRole === "OUTRO" && staff.customRoleLabel
      ? staff.customRoleLabel
      : STAFF_ROLE_LABELS[staff.staffRole]
    : "";

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Detalhes do Profissional</Label>
        <div className="space-x-2">
          {id && (
            <Button onClick={() => navigate(`/profissionais/editar/${id}`)}>Editar</Button>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !staff ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-medium">
                {staff.firstname} {staff.lastname}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Função</div>
              <div className="font-medium">{roleLabel}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">E-mail</div>
              <div className="font-medium">{staff.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telefone</div>
              <div className="font-medium">{staff.phone ?? "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Documento</div>
              <div className="font-medium">{staff.document ?? "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data de admissão</div>
              <div className="font-medium">{staff.admissionDate ?? "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Salário</div>
              <div className="font-medium">
                {staff.salary != null ? `R$ ${staff.salary.toFixed(2)}` : "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium">{staff.status === "ACTIVE" ? "Ativo" : "Inativo"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Observações</div>
              <div className="font-medium">{staff.notes ?? "-"}</div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-lg font-semibold">Permissões concedidas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERMISSION_GROUPS.map((group) => {
                const granted = group.permissions.filter((p) =>
                  staff.permissions.includes(p.value)
                );
                return (
                  <div key={group.module} className="rounded border p-4">
                    <div className="font-medium mb-2">{group.module}</div>
                    {granted.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nenhum acesso</div>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {granted.map((p) => (
                          <li key={p.value}>{p.label}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </LayoutContent>
  );
}
