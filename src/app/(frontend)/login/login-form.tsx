'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, type LoginState } from './actions'

const initialState: LoginState = { success: false }

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, initialState)

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo || '/')
      router.refresh()
    }
  }, [state.success, redirectTo, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
