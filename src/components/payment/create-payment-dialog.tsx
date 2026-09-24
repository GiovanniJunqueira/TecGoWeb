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
import { PaymentService } from "@/services/payment/payment.service";
import type { ProfilePlayer } from "@/entities/player/profile-player.entity";
import { toast } from "sonner";

interface CreatePaymentDialogProps {
  open: boolean;
  players: ProfilePlayer[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function CreatePaymentDialog({ open, players, onOpenChange, onSaved }: CreatePaymentDialogProps) {
  const [playerId, setPlayerId] = useState("");
  const [month, setMonth] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setPlayerId("");
      setMonth("");
    }
  }, [open]);

  const onCreate = async () => {
    if (!playerId || !month) {
      toast.error("Selecione o atleta e o mês");
      return;
    }

    try {
      setCreating(true);
      await PaymentService.create(playerId, month);
      toast.success("Pagamento lançado com sucesso");
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error("Não foi possível lançar o pagamento");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Novo pagamento</AlertDialogTitle>
          <AlertDialogDescription>Lance uma mensalidade para um aluno em um mês.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Atleta</Label>
            <select
              className="border rounded px-3 py-2 text-sm w-full h-9"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
            >
              <option value="">Selecione o atleta</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstname} {p.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm">Mês</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button onClick={onCreate} disabled={creating}>
            {creating ? "Lançando..." : "Lançar pagamento"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
