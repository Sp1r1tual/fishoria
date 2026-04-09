export interface IUser {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  role: 'PLAYER' | 'MODERATOR' | 'ADMIN';
  isActivated: boolean;
  language: string;
  googleId?: string | null;
}

export interface ILoginResponse {
  user: IUser;
  success: boolean;
}

export interface IAuthForm {
  email: string;
  password: string;
  confirmPassword?: string;
  username?: string;
  language?: string;
}
