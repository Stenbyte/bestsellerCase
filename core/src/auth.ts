export const ROLES = ['operator', 'manager'] as const

export type Role = (typeof ROLES)[number]

export interface AuthUser {
  id: string
  email: string
  role: Role
}

export interface AuthTokenPayload {
  sub: string
  email: string
  role: Role
}
