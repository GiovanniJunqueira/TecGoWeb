export interface PaymentPlan {
  id: string;
  name: string;
  priceOnTime: number;
  priceLate: number;
  active: boolean;
}
