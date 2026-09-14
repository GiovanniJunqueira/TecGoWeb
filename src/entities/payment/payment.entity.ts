export type PaymentMethod = "PIX" | "DINHEIRO" | "CARTAO";

export interface Payment {
  id: string;
  status: boolean;
  paidAt: string | null;
  month: string;
  paymentMethod?: PaymentMethod | null;
  playerId?: string;
  playerName?: string;
}
