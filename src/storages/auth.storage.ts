import type { User } from "@/entities/user/user.entity";
import { decodeJwt } from "jose";

const key = "@auth";

export class AuthStorage {
  static has = (): boolean => {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem(key);
    return !!token;
  };

  static get = (): string | null => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(key);
  };

  static set = (token: string): void => {
    if (typeof window === "undefined") return;

    localStorage.setItem(key, token);
  };

  static remove = (): void => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(key);
  };

  static decode = (): User | null => {
    if (typeof window === "undefined") return null;

    const token = this.get();
    if (!token) return null;

    try {
      const payload = decodeJwt<User>(token);
      return payload;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };
}
