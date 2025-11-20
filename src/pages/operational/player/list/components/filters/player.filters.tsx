import { Search } from "lucide-react";
import { useMemo } from "react";
import {
  parseAsString,
  useQueryStates,
} from "nuqs";
import { Button } from "@/components/ui/button";
import { DebouncedInputWithIcon } from "@/components/ui/debounced.input.with.icon";


export function PlayerFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      
      q: parseAsString.withDefault(""),
      
    },
    {
      clearOnDefault: false,
      history: "push",
    }
  );

  const hasFilters = useMemo(() => {
    if (filters.q && filters.q.trim() !== "") {
      return true;
    }

    return false;
  }, [filters.q, ]);

  const handleClearFilters = () => {
    setFilters({
      q: "",
    });
  };

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <DebouncedInputWithIcon
        placeholder="Nome, "
        className="w-full md:max-w-sm flex shadow-none"
        iconClassName="h-4 w-4"
        icon={Search}
        value={filters.q}
        onChange={(value) => setFilters({ q: value })}
        debounceTime={1000}
      />

      
        {hasFilters && (
          <Button variant="link" className="gap-2" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        )}
    </div>
  );
}
