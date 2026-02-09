'use server'

import { headers as getHeaders, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'

export type LoginState = {
  success: boolean
  error?: string
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  try {
    const payload = await getPayload({ config: await config })
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    if (!result.token) {
      return { success: false, error: 'Invalid credentials.' }
    }

    const cookieStore = await cookies()
    cookieStore.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Invalid email or password.' }
  }
}

export async function getCurrentUser() {
  const payload = await getPayload({ config: await config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })
  return user
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/login')
}
