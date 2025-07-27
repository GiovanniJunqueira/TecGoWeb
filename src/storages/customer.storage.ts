import { create } from "zustand";

interface CustomerState {
  firstName: string | null;
  lastName: string | null;
  setCustomer: (firstName: string, lastName: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  firstName: null,
  lastName: null,
  setCustomer: (firstName, lastName) =>
    set({ firstName, lastName }),
}));
