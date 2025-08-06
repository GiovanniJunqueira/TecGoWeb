export class LoginResponseEntity {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;

  constructor(data: LoginResponseEntity) {
    this.accessToken = data.accessToken;
    this.expiresIn = data.expiresIn;
    this.refreshToken = data.refreshToken;
  }
}

