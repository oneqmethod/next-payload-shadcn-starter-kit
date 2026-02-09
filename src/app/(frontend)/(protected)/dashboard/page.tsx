import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, logout } from '../../login/actions'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Dashboard</CardTitle>
          <CardDescription>Welcome, {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button variant="outline" type="submit" className="w-full">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
