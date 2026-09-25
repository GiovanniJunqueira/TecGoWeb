import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StaffService } from "@/services/staff/staff.service";
import { STAFF_ROLE_LABELS, type StaffMember } from "@/entities/staff/staff.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog, useConfirmDialog } from "@/components/confirm-dialog/confirm-dialog";

export default function StaffListPage() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const deleteDialog = useConfirmDialog();

  async function load() {
    try {
      setLoading(true);
      const data = await StaffService.findAll();
      setStaffMembers(data ?? []);
    } catch {
      toast.error("Falha ao buscar profissionais");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await StaffService.delete(id);
      toast.success("Profissional removido");
      await load();
    } catch {
      toast.error("Não foi possível remover o profissional");
    }
  };

  const roleLabel = (staff: StaffMember) =>
    staff.staffRole === "OUTRO" && staff.customRoleLabel
      ? staff.customRoleLabel
      : STAFF_ROLE_LABELS[staff.staffRole];

  return (
    <LayoutContent className="gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-2xl font-semibold">Profissionais</Label>
        <Button onClick={() => navigate("/profissionais/novo")}>Novo profissional</Button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Função</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Carregando...
                </td>
              </tr>
            ) : staffMembers.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Nenhum profissional cadastrado
                </td>
              </tr>
            ) : (
              staffMembers.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">
                    {s.firstname} {s.lastname}
                  </td>
                  <td className="p-3">{roleLabel(s)}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">{s.status === "ACTIVE" ? "Ativo" : "Inativo"}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/profissionais/${s.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/profissionais/editar/${s.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDialog.open(s.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Excluir profissional?"
        description="O acesso desse profissional ao sistema será removido. Essa ação não pode ser desfeita."
        onConfirm={() => deleteDialog.targetId && onDelete(deleteDialog.targetId)}
      />
    </LayoutContent>
  );
}
