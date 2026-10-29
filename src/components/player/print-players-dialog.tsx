import { useEffect, useMemo, useState } from "react";
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
import { PlayerService } from "@/services/player/player.service";
import type { PlayerReport } from "@/entities/player/profile-player.entity";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import { toast } from "sonner";

type StatusFilter = "ATIVOS" | "INATIVOS" | "TODOS";
type GroupBy = "NENHUM" | "NASCIDOS" | "GRUPO_AULA" | "ESCOLHER";

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

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
  /** "carteirinhas" reaproveita os filtros para imprimir as carteirinhas em lote. */
  mode?: "lista" | "carteirinhas";
}

export function PrintPlayersDialog({ open, onOpenChange, mode = "lista" }: PrintPlayersDialogProps) {
  const isCards = mode === "carteirinhas";
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>("ATIVOS");
  const [groupBy, setGroupBy] = useState<GroupBy>("NENHUM");
  const [turmaValue, setTurmaValue] = useState("");
  const [aulaGrupoId, setAulaGrupoId] = useState("");
  const [aulaGrupos, setAulaGrupos] = useState<AulaGrupo[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [pickList, setPickList] = useState<PlayerReport[]>([]);
  const [pickLoading, setPickLoading] = useState(false);
  const [pickSearch, setPickSearch] = useState("");
  const [pickedIds, setPickedIds] = useState<string[]>([]);

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

  // Escolher atletas por nome: carrega a lista uma vez (conforme o status) e filtra na hora.
  useEffect(() => {
    if (!open || groupBy !== "ESCOLHER") return;
    let cancelled = false;
    setPickLoading(true);
    PlayerService.report({ status })
      .then((data) => !cancelled && setPickList(data ?? []))
      .catch(() => !cancelled && toast.error("Falha ao carregar atletas"))
      .finally(() => !cancelled && setPickLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, groupBy, status]);

  const pickFiltered = useMemo(() => {
    const term = normalize(pickSearch.trim());
    if (!term) return pickList;
    return pickList.filter((p) => normalize(`${p.firstname} ${p.lastname} ${p.registrationId ?? ""}`).includes(term));
  }, [pickList, pickSearch]);

  const togglePicked = (playerId: string) => {
    setPickedIds((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]));
  };

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
    if (groupBy === "ESCOLHER") params.set("ids", pickedIds.join(","));
    if (!isCards && selectedColumns.length > 0) params.set("columns", selectedColumns.join(","));
    onOpenChange(false);
    navigate(`${isCards ? "/atletas/carteirinhas" : "/atletas/relatorio"}?${params.toString()}`);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{isCards ? "Imprimir carteirinhas" : "Imprimir lista de atletas"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isCards
              ? "Escolha de quais atletas gerar as carteirinhas (4 por folha A4)."
              : "Escolha o que deve entrar no relatório."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-auto">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Status</Label>
            <select
              className="border rounded-md px-3 text-sm w-full h-9"
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
              className="border rounded-md px-3 text-sm w-full h-9"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            >
              <option value="NENHUM">Nenhum</option>
              <option value="NASCIDOS">Nascidos</option>
              <option value="GRUPO_AULA">Grupo de aula</option>
              {isCards && <option value="ESCOLHER">Escolher atletas por nome</option>}
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
                className="border rounded-md px-3 text-sm w-full h-9"
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

          {groupBy === "ESCOLHER" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm">Atletas ({pickedIds.length} selecionado{pickedIds.length === 1 ? "" : "s"})</Label>
                {pickedIds.length > 0 && (
                  <button type="button" className="text-xs text-primary" onClick={() => setPickedIds([])}>
                    Limpar seleção
                  </button>
                )}
              </div>
              <Input
                value={pickSearch}
                onChange={(e) => setPickSearch(e.target.value)}
                placeholder="Buscar por nome ou matrícula"
              />
              <div className="max-h-56 overflow-auto rounded-xl border">
                {pickLoading ? (
                  <div className="p-3 text-sm text-muted-foreground">Carregando...</div>
                ) : pickFiltered.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">Nenhum atleta encontrado</div>
                ) : (
                  pickFiltered.map((p) => (
                    <label
                      key={p.id}
                      className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/50"
                    >
                      <input type="checkbox" checked={pickedIds.includes(p.id)} onChange={() => togglePicked(p.id)} />
                      <span className="min-w-0 flex-1 truncate">
                        {p.firstname} {p.lastname}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.registrationId || p.turma || ""}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {!isCards && (
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
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onGenerate} disabled={groupBy === "ESCOLHER" && pickedIds.length === 0}>{isCards ? "Gerar carteirinhas" : "Gerar relatório"}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
