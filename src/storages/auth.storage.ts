const STORAGE_KEY = "@auth";

type AuthData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export class AuthStorage {
  static has(): boolean {
    console.log(this.getData());
    return this.getData() !== null;
  }

  static getAccessToken(): string | null {
    return this.getData()?.accessToken ?? null;
  }

  static getRefreshToken(): string | null {
    return this.getData()?.refreshToken ?? null;
  }

  static getData(): AuthData | null {

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthData;
    } catch {
      return null;
    }
  }

  static set(accessToken: string, expiresIn: number, refreshToken?: string): void {

    const expiresAt = Date.now() + expiresIn * 1000;
    const data: AuthData = { accessToken, refreshToken: refreshToken ?? '', expiresAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static remove(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static isExpiring(bufferMinutes = 0.5): boolean {
  const data = this.getData();
  if (!data?.expiresAt) return true;

  const nowWithBuffer = Date.now() + bufferMinutes * 60 * 1000;
  return nowWithBuffer > data.expiresAt;
}

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isExpiring();
  }
}
