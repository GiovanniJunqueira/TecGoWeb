import { api } from "@/config";
import type { LoginResponseEntity } from "@/entities/auth";
import type { UserPayload } from "@/entities/user/user.entity";
import type { LoginFormData } from "@/validators";

export class AuthService {
  public static async login(
    props: LoginFormData
  ): Promise<LoginResponseEntity> {
    const { data } = await api.post<LoginResponseEntity>("/auth/login", {
      email: props.email,
      password: props.password,
    });

    return data;
  }

  public static async me(): Promise<UserPayload> {
    const { data } = await api.get<UserPayload>("/auth/me");
    return data;
  }

  public static async refreshToken(
    refreshtoken: string
  ): Promise<LoginResponseEntity> {
    const { data } = await api.post<LoginResponseEntity>(
      "/auth/refresh-token",
      { refreshToken: refreshtoken }
    );

    return data;
  }

  public static async logout(): Promise<void> {
    await api.delete("/auth/logout");
  }

  public static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.put("/auth/change-password", { currentPassword, newPassword });
  }
}
