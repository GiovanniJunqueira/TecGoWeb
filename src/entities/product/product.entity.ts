import type { PaymentMethod } from "@/entities/payment/payment.entity";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  active: boolean;
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
