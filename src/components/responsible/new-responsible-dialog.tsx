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

export interface NewResponsibleDraft {
  name: string;
  phone: string;
  email: string;
  document: string;
}

const EMPTY: NewResponsibleDraft = { name: "", phone: "", email: "", document: "" };

interface NewResponsibleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (draft: NewResponsibleDraft) => void;
}

// Só monta o responsável: ele é gravado junto com o atleta, ao salvar o cadastro.
export function NewResponsibleDialog({ open, onOpenChange, onAdd }: NewResponsibleDialogProps) {
  const [draft, setDraft] = useState<NewResponsibleDraft>(EMPTY);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(EMPTY);
      setShowError(false);
    }
  }, [open]);

  const set = (key: keyof NewResponsibleDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  const onConfirm = () => {
    if (!draft.name.trim()) {
      setShowError(true);
      return;
    }
    onAdd({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      document: draft.document.trim(),
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Novo responsável</AlertDialogTitle>
          <AlertDialogDescription>
            Ele fica vinculado a este atleta e é salvo junto com o cadastro.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            // O popup fica dentro do formulário do atleta na árvore do React: não deixa o Enter enviar o cadastro.
            e.stopPropagation();
            onConfirm();
          }}
        >
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Nome</Label>
            <Input autoFocus value={draft.name} onChange={set("name")} placeholder="Nome do responsável" />
            {showError && !draft.name.trim() && (
              <span className="text-sm text-destructive">Informe o nome do responsável</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Telefone</Label>
            <Input value={draft.phone} onChange={set("phone")} placeholder="Telefone do responsável" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Documento</Label>
            <Input value={draft.document} onChange={set("document")} placeholder="CPF ou RG" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Email</Label>
            <Input type="email" value={draft.email} onChange={set("email")} placeholder="Email do responsável" />
          </div>
          <button type="submit" className="hidden" />
        </form>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Adicionar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
