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
import { ResponsibleService } from "@/services/responsible/responsible.service";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ResponsibleDetailsDialogProps {
  responsibleId: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
}

export function ResponsibleDetailsDialog({ responsibleId, onOpenChange, onEdit }: ResponsibleDetailsDialogProps) {
  const [responsible, setResponsible] = useState<Responsible | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!responsibleId) {
      setResponsible(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await ResponsibleService.findById(responsibleId);
        setResponsible(data);
      } catch {
        toast.error("Não foi possível carregar o responsável");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [responsibleId]);

  return (
    <AlertDialog open={!!responsibleId} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Detalhes do responsável</AlertDialogTitle>
          <AlertDialogDescription>{responsible?.name}</AlertDialogDescription>
        </AlertDialogHeader>

        {loading ? (
          <div>Carregando...</div>
        ) : !responsible ? (
          <div>Nenhum dado encontrado.</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Nome</div>
                <div className="font-medium">{responsible.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Documento</div>
                <div className="font-medium">{responsible.document || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Telefone</div>
                <div className="font-medium">{responsible.phone || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">E-mail</div>
                <div className="font-medium">{responsible.email || "-"}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground">Endereço</div>
                <div className="font-medium">
                  {responsible.address} {responsible.addressNumber}
                  {responsible.addressNeighborhood ? ` - ${responsible.addressNeighborhood}` : ""}
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <div className="font-semibold text-sm">Alunos vinculados</div>
              {!responsible.students || responsible.students.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nenhum aluno vinculado</div>
              ) : (
                <ul className="text-sm space-y-1">
                  {responsible.students.map((s) => (
                    <li key={s.id} className="flex items-center justify-between border-t pt-1">
                      <span>
                        {s.firstname} {s.lastname}
                      </span>
                      <button
                        className="text-primary underline underline-offset-4 text-xs"
                        onClick={() => navigate(`/atletas/${s.id}`)}
                      >
                        Ver aluno
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <AlertDialogFooter className="sm:justify-between">
          {responsible && (
            <Button variant="outline" onClick={() => onEdit(responsible.id)}>
              Editar
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
