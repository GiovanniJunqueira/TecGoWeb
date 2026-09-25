export type GameType = "CHAMPIONSHIP" | "FRIENDLY";

export type GameCategory =
  | "SUB_4"
  | "SUB_5"
  | "SUB_6"
  | "SUB_7"
  | "SUB_8"
  | "SUB_9"
  | "SUB_10"
  | "SUB_11"
  | "SUB_12"
  | "SUB_13"
  | "SUB_14"
  | "SUB_15"
  | "SUB_16"
  | "SUB_17"
  | "SUB_18";

export const GAME_CATEGORY_OPTIONS: { value: GameCategory; label: string }[] = [
  { value: "SUB_4", label: "Sub-4" },
  { value: "SUB_5", label: "Sub-5" },
  { value: "SUB_6", label: "Sub-6" },
  { value: "SUB_7", label: "Sub-7" },
  { value: "SUB_8", label: "Sub-8" },
  { value: "SUB_9", label: "Sub-9" },
  { value: "SUB_10", label: "Sub-10" },
  { value: "SUB_11", label: "Sub-11" },
  { value: "SUB_12", label: "Sub-12" },
  { value: "SUB_13", label: "Sub-13" },
  { value: "SUB_14", label: "Sub-14" },
  { value: "SUB_15", label: "Sub-15" },
  { value: "SUB_16", label: "Sub-16" },
  { value: "SUB_17", label: "Sub-17" },
  { value: "SUB_18", label: "Sub-18" },
];

export interface GamePlayerStats {
  playerId: string | null;
  playerName: string | null;
  goals: number | null;
  starter: boolean | null;
  notes: string | null;
  attended: boolean | null;
}

export interface Game {
  id: string;
  type: GameType;
  category: GameCategory;
  opponent: string;
  date: string;
  homeScore: number | null;
  awayScore: number | null;
  location: string | null;
  players: GamePlayerStats[];
}
