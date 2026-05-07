import { cookies } from 'next/headers'

// Admin credentials (in production, use environment variables and hashed passwords)
const ADMIN_USER = '1002235617'
const ADMIN_PASSWORD = '1002235617'
const AUTH_COOKIE_NAME = 'star_response_admin_auth'
const AUTH_TOKEN = 'authenticated_admin_session_token_sr2024'

export async function verifyCredentials(user: string, password: string): Promise<boolean> {
  return user === ADMIN_USER && password === ADMIN_PASSWORD
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, AUTH_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME)
  return authCookie?.value === AUTH_TOKEN
}
