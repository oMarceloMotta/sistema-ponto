export interface LoginForm {
  idUSER: string;
  senha: string;
}

export interface AuthData {
  accessToken: string;
  expiresIn: number;
  name: string;
  refreshToken: string;
  tokenType: string;
}
