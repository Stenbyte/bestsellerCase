import { SignJWT, jwtVerify } from 'jose'
import type { AuthTokenPayload, AuthUser, Role } from '../types/auth.js'
import { AppError } from '../types/errors.js'

const DEFAULT_SECRET = 'recolour-demo-secret-change-me'
const TOKEN_TTL = '12h'

function getSecretKey() {
  const secret = process.env.JWT_SECRET ?? DEFAULT_SECRET
  return new TextEncoder().encode(secret)
}

const DEMO_USERS: Record<Role, AuthUser> = {
  operator: {
    id: 'user-operator',
    email: 'operator@recolour.demo',
    role: 'operator',
  },
  manager: {
    id: 'user-manager',
    email: 'manager@recolour.demo',
    role: 'manager',
  },
}

export function resolveDemoUser(role: Role, email?: string): AuthUser {
  const base = DEMO_USERS[role]
  return {
    ...base,
    email: email ?? base.email,
  }
}

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
  } satisfies Omit<AuthTokenPayload, 'sub'>)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey())
}

export async function verifyToken(token: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const role = payload.role
    const email = payload.email
    const sub = payload.sub

    if (
      typeof sub !== 'string' ||
      typeof email !== 'string' ||
      (role !== 'operator' && role !== 'manager')
    ) {
      throw AppError.unauthorized('Invalid token payload')
    }

    return { id: sub, email, role }
  } catch (err) {
    if (err instanceof AppError) throw err
    throw AppError.unauthorized('Invalid or expired token')
  }
}

export async function login(role: Role, email?: string) {
  const user = resolveDemoUser(role, email)
  const token = await signToken(user)
  return { token, user }
}
