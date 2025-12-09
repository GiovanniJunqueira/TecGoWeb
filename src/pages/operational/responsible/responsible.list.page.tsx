import { useEffect, useState } from "react";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ResponsibleListPage() {
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [studentName, setStudentName] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const data = await ResponsibleService.findAll({
        name: name || undefined,
        studentName: studentName || undefined,
      });
      setResponsibles(data ?? []);
    } catch {
      toast.error("Falha ao buscar responsáveis");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await ResponsibleService.delete(id);
      toast.success("Responsável removido");
      await load();
    } catch {
      toast.error("Não foi possível remover o responsável");
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Responsáveis</Label>
        {/* Futuro: botão para criar novo responsável direto */}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm">Nome do responsável</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Nome do aluno</Label>
          <Input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Ex: Pedro"
          />
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
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">Alunos</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  Carregando...
                </td>
              </tr>
            ) : responsibles.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={4}>
                  Nenhum responsável encontrado
                </td>
              </tr>
            ) : (
              responsibles.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">
                    {r.students && r.students.length > 0
                      ? r.students.map((s) => s.firstname).join(", ")
                      : "-"}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/responsaveis/${r.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(r.id)}
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
