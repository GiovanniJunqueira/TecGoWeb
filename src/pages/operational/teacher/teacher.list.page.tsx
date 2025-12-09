import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeacherService } from "@/services/teacher/teacher.service";
import type { Teacher, TeacherStatus } from "@/entities/teacher/teacher.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const teacherStatusOptions: { value: TeacherStatus; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<TeacherStatus | undefined>();
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const data = await TeacherService.findAll({
        name: name || undefined,
        status: status || undefined,
      });
      setTeachers(data ?? []);
    } catch {
      toast.error("Falha ao buscar professores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await TeacherService.delete(id);
      toast.success("Professor removido");
      await load();
    } catch {
      toast.error("Não foi possível remover o professor");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Professores</Label>
        <Button onClick={() => navigate("/professores/novo")}>Novo professor</Button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Nome</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Status</Label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={status ?? ""}
            onChange={(e) =>
              setStatus((e.target.value || undefined) as TeacherStatus | undefined)
            }
          >
            <option value="">Todos</option>
            {teacherStatusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={load} disabled={loading}>
          {loading ? "Carregando..." : "Filtrar"}
        </Button>
      </div>

      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Função</th>
              <th className="text-left p-3">Data de admissão</th>
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
            ) : teachers.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Nenhum professor encontrado
                </td>
              </tr>
            ) : (
              teachers.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{t.role}</td>
                  <td className="p-3">{t.admissionDate}</td>
                  <td className="p-3">
                    {t.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/professores/${t.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(t.id)}
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
    </LayoutContent>
  );
}
