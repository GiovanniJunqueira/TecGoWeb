import type { User } from "@/entities/user/user.entity";
import { decodeJwt } from "jose";

const key = "@auth";
export class AuthStorage {
  static has = (): boolean => {
    const token = localStorage.getItem(key);
    return !!token;
  };

  static get = (): string | null => {
    const token = localStorage.getItem(key);
    return token;
  };

  static set = (token: string): void => {
    localStorage.setItem(key, token);
  };

  static remove = (): void => {
    localStorage.removeItem(key);
  };

  static decode = () => {
    const token = this.get();
    if (!token) return null;

    const payload = decodeJwt<User>(token);

    return payload;
  };

  
}
