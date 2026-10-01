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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";

function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasNotHadBirthdayThisYear =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (hasNotHadBirthdayThisYear) age--;
  return age;
}

interface AddGamePlayerDialogProps {
  open: boolean;
  availablePlayers: ProfilePlayer[];
  onOpenChange: (open: boolean) => void;
  onAdd: (playerId: string) => void;
}

export function AddGamePlayerDialog({
  open,
  availablePlayers,
  onOpenChange,
  onAdd,
}: AddGamePlayerDialogProps) {
  const [search, setSearch] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
      setMinAge("");
      setMaxAge("");
    }
  }, [open]);

  const min = minAge ? Number(minAge) : null;
  const max = maxAge ? Number(maxAge) : null;
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = availablePlayers.filter((p) => {
    if (normalizedSearch) {
      const fullName = `${p.firstname} ${p.lastname}`.toLowerCase();
      if (!fullName.includes(normalizedSearch)) return false;
    }
    if (min === null && max === null) return true;
    const age = calculateAge(p.birthDate);
    if (age === null) return false;
    if (min !== null && age < min) return false;
    if (max !== null && age > max) return false;
    return true;
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar jogador</AlertDialogTitle>
          <AlertDialogDescription>Escolha os atletas para a escalação.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-2 flex-1 min-w-48">
              <Label className="text-sm">Buscar por nome</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex: João"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Idade mínima</Label>
              <Input
                type="number"
                className="w-24"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="Ex: 9"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Idade máxima</Label>
              <Input
                type="number"
                className="w-24"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="Ex: 11"
              />
            </div>
          </div>

          <div className="overflow-auto max-h-[50vh] border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Idade</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="p-3" colSpan={3}>
                      Nenhum atleta disponível para adicionar
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">
                        {p.firstname} {p.lastname}
                      </td>
                      <td className="p-3">{calculateAge(p.birthDate) ?? "-"}</td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onAdd(p.id)}
                        >
                          Adicionar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AlertDialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
