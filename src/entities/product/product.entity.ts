import type { PaymentMethod } from "@/entities/payment/payment.entity";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  active: boolean;
  stock: number;
}

export type StockMovementType = "ENTRADA" | "VENDA" | "ESTORNO" | "AJUSTE";

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  buyerPlayerId: string | null;
  buyerName: string | null;
  paymentMethod: PaymentMethod;
  soldAt: string;
}

export interface SaleCreatePayload {
  productId: string;
  quantity: number;
  buyerPlayerId?: string | null;
  buyerName?: string | null;
  paymentMethod: PaymentMethod;
  soldAt?: string | null;
}
