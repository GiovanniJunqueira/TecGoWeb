import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TeacherService } from "@/services/teacher/teacher.service";
import type { Teacher } from "@/entities/teacher/teacher.entity";
import { toast } from "sonner";

export default function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await TeacherService.findById(id);
        setTeacher(data);
      } catch {
        toast.error("Não foi possível carregar o professor");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Detalhes do Professor</Label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          {id && (
            <Button variant="outline" onClick={() => navigate(`/professores/editar/${id}`)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !teacher ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-medium">{teacher.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Função/Cargo</div>
              <div className="font-medium">{teacher.role}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">E-mail</div>
              <div className="font-medium">{teacher.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telefone</div>
              <div className="font-medium">{teacher.phone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data de admissão</div>
              <div className="font-medium">{teacher.admissionDate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="font-medium">
                {teacher.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Salário</div>
              <div className="font-medium">
                {teacher.salary != null ? teacher.salary : "-"}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Observações</div>
              <div className="font-medium">{teacher.notes ?? "-"}</div>
            </div>
          </section>
        </>
      )}
    </LayoutContent>
  );
}
