import { api } from "@/config";
import type { LoginResponseEntity } from "@/entities/auth";
import type { LoginFormData } from "@/validators";

export class AuthService {
  public static async login(props: LoginFormData): Promise<string> {
    const { data } = await api.post<LoginResponseEntity>("/auth/login", {
      email: props.email,
      password: props.password,
    });

    return data.token;
  }
}
