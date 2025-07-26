import { api } from "@/config";
import type { LoginResponseEntity } from "@/entities/auth";

export class AuthService {
  public static async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<LoginResponseEntity>("/auth/login", {
      email,
      password,
    });

    return data.token;
  }
}
