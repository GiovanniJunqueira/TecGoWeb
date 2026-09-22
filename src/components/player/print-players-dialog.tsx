import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { AulaGrupoService } from "@/services/aula/aula.service";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import { toast } from "sonner";

type StatusFilter = "ATIVOS" | "INATIVOS" | "TODOS";
type GroupBy = "NENHUM" | "NASCIDOS" | "GRUPO_AULA";

export const REPORT_COLUMNS = [
  { key: "matricula", label: "Matrícula" },
  { key: "nascidos", label: "Nascidos" },
  { key: "nascimento", label: "Data de Nascimento" },
  { key: "rg", label: "RG" },
  { key: "cpf", label: "CPF" },
  { key: "telefone", label: "Telefone" },
  { key: "endereco", label: "Endereço" },
  { key: "responsavel", label: "Responsável(is)" },
  { key: "plano", label: "Plano de pagamento" },
  { key: "grupo", label: "Grupo de aula" },
  { key: "instituicao", label: "Instituição" },
] as const;

const DEFAULT_COLUMNS = ["matricula", "cpf", "responsavel"];

interface PrintPlayersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintPlayersDialog({ open, onOpenChange }: PrintPlayersDialogProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("ATIVOS");
  const [groupBy, setGroupBy] = useState<GroupBy>("NENHUM");
  const [turmaValue, setTurmaValue] = useState("");
  const [aulaGrupoId, setAulaGrupoId] = useState("");
  const [aulaGrupos, setAulaGrupos] = useState<AulaGrupo[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_COLUMNS);

  useEffect(() => {
    if (!open) return;
    async function load() {
      try {
        const data = await AulaGrupoService.findAll();
        setAulaGrupos(data ?? []);
      } catch {
        toast.error("Falha ao carregar grupos de aula");
      }
    }
    load();
  }, [open]);

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const onGenerate = () => {
    const params = new URLSearchParams();
    params.set("status", status);
    if (groupBy === "NASCIDOS" && turmaValue) params.set("turma", turmaValue);
    if (groupBy === "GRUPO_AULA" && aulaGrupoId) params.set("aulaGrupoId", aulaGrupoId);
    if (selectedColumns.length > 0) params.set("columns", selectedColumns.join(","));
    onOpenChange(false);
    navigate(`/atletas/relatorio?${params.toString()}`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Imprimir lista de atletas</AlertDialogTitle>
          <AlertDialogDescription>
            Escolha o que deve entrar no relatório.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-auto">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Status</Label>
            <select
              className="border rounded px-3 py-2 text-sm w-full h-9"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
            >
              <option value="ATIVOS">Ativos</option>
              <option value="INATIVOS">Inativos</option>
              <option value="TODOS">Todos</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Agrupar/filtrar por</Label>
            <select
              className="border rounded px-3 py-2 text-sm w-full h-9"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            >
              <option value="NENHUM">Nenhum</option>
              <option value="NASCIDOS">Nascidos</option>
              <option value="GRUPO_AULA">Grupo de aula</option>
            </select>
          </div>

          {groupBy === "NASCIDOS" && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Valor de Nascidos (deixe em branco pra todos)</Label>
              <Input
                value={turmaValue}
                onChange={(e) => setTurmaValue(e.target.value)}
                placeholder="Ex: Nascidos 12"
              />
            </div>
          )}

          {groupBy === "GRUPO_AULA" && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Grupo de aula</Label>
              <select
                className="border rounded px-3 py-2 text-sm w-full h-9"
                value={aulaGrupoId}
                onChange={(e) => setAulaGrupoId(e.target.value)}
              >
                <option value="">Todos os grupos</option>
                {aulaGrupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Dados a incluir (Nome sempre aparece)</Label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_COLUMNS.map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onGenerate}>Gerar relatório</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
