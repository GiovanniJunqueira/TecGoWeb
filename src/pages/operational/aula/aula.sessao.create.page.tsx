import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AulaGrupoService, AulaSessaoService } from "@/services/aula/aula.service";
import type { AulaGrupo } from "@/entities/aula/aula.entity";
import { toast } from "sonner";

export default function AulaSessaoCreatePage() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<AulaGrupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [date, setDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await AulaGrupoService.findAll();
        setGrupos(data ?? []);
      } catch {
        toast.error("Falha ao carregar grupos de aula");
      }
    }
    load();
  }, []);

  const onCreate = async () => {
    if (!grupoId || !date) {
      toast.error("Selecione o grupo e a data");
      return;
    }

    try {
      setCreating(true);
      await AulaSessaoService.create(grupoId, date);
      toast.success("Aula registrada com sucesso");
      navigate(`/aulas/${grupoId}`);
    } catch {
      toast.error("Não foi possível registrar a aula");
    } finally {
      setCreating(false);
    }
  };

  return (
    <LayoutContent className="gap-6">
      <div className="flex items-center justify-between">
        <Label className="text-2xl font-semibold">Registrar aula</Label>
        <Button variant="outline" onClick={() => navigate("/aulas")}>
          Voltar
        </Button>
      </div>

      <section className="flex flex-wrap items-end gap-4 max-w-2xl">
        <div className="flex flex-col gap-2 flex-1 min-w-48">
          <Label className="text-sm">Grupo</Label>
          <select
            className="border rounded px-2 py-1 text-sm h-9"
            value={grupoId}
            onChange={(e) => setGrupoId(e.target.value)}
          >
            <option value="">Selecione o grupo</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm">Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <Button onClick={onCreate} disabled={creating}>
          {creating ? "Registrando..." : "Registrar aula"}
        </Button>
      </section>
    </LayoutContent>
  );
}
