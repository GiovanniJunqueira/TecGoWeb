import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResponsibleService } from "@/services/responsible/responsible.service";
import type { Responsible } from "@/entities/responsible/responsible.entity";
import { toast } from "sonner";

export default function ResponsibleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [responsible, setResponsible] = useState<Responsible | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ResponsibleService.findById(id);
        setResponsible(data);
      } catch {
        toast.error("Não foi possível carregar o responsável");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Detalhes do Responsável</Label>
        <div className="space-x-2">
          {id && (
            <Button onClick={() => navigate(`/responsaveis/editar/${id}`)}>
              Editar
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : !responsible ? (
        <div>Nenhum dado encontrado.</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-medium">{responsible.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Documento</div>
              <div className="font-medium">{responsible.document}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telefone</div>
              <div className="font-medium">{responsible.phone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">E-mail</div>
              <div className="font-medium">{responsible.email}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Endereço</div>
              <div className="font-medium">
                {responsible.address} {responsible.addressNumber}
                {responsible.addressNeighborhood
                  ? ` - ${responsible.addressNeighborhood}`
                  : ""}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Complemento</div>
              <div className="font-medium">{responsible.addressComplement}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">CEP</div>
              <div className="font-medium">{responsible.postcode}</div>
            </div>
          </section>

          <section className="space-y-4">
            <Label className="text-lg font-semibold">Alunos vinculados</Label>
            <div className="overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Nome</th>
                    <th className="p-3 text-left">Matrícula</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {!responsible.students || responsible.students.length === 0 ? (
                    <tr>
                      <td className="p-3" colSpan={3}>
                        Nenhum aluno vinculado a este responsável
                      </td>
                    </tr>
                  ) : (
                    responsible.students.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-3">
                          {s.firstname} {s.lastname}
                        </td>
                        <td className="p-3">{s.registrationId ?? "-"}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/atletas/${s.id}`)}
                          >
                            Ver aluno
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </LayoutContent>
  );
}
