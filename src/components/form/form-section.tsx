import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FormSectionProps {
  title: string;
  /** Texto curto ao lado do título, visível mesmo com a seção fechada (ex.: "2 selecionados"). */
  hint?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

// Seção de formulário que abre e fecha pelo cabeçalho.
export function FormSection({ title, hint, open, onOpenChange, children }: FormSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="rounded-xl border bg-card">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left hover:bg-muted/50"
        >
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-semibold">{title}</span>
            {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
          </span>
          <ChevronDown
            className={`size-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t px-4 pb-4 pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
