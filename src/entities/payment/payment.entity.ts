export interface Payment {
  id: string;
  status: boolean;
  paidAt: string | null;
  month: string;
  playerId?: string;
  playerName?: string;
}
