export type UserRole = "admin" | "security" | "user";

export interface JwtBase {
  sub: string;
  role: UserRole;
  email: string;
}
