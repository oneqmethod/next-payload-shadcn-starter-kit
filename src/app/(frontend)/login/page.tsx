import { redirect } from 'next/navigation'

import { getCurrentUser } from './actions'
import { LoginForm } from './login-form'

type Props = {
  searchParams: Promise<{ redirectTo?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  const { redirectTo } = await searchParams

  if (user) {
    redirect(redirectTo || '/')
  }

  return <LoginForm redirectTo={redirectTo} />
}
