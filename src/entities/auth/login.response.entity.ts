export class LoginResponseEntity {
  token: string;

  constructor(data: LoginResponseEntity) {
    this.token = data.token;
  }
}
