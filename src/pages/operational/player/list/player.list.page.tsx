import { LayoutContent } from "@/layouts/layout.content";
import { Label } from "@radix-ui/react-dropdown-menu";
import { PlayerFilters } from "./components/filters/player.filters";

export default function PlayerListPage() {
  return (
    <LayoutContent className="gap-6">
      <Label className="text-2xl font-semibold">Atletas</Label>
      <PlayerFilters />
    </LayoutContent>
  );
}
