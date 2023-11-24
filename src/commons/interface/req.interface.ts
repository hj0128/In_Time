export interface JwtReqUser {
  user?: {
    id: string;
    name: string;
    email: string;
    password: string;
    profileUrl: string;
  };
}
