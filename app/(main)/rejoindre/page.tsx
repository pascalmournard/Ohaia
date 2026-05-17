export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import OnboardingPage from './OnboardingPage'

export default async function RejoindrePage() {
  const session = await auth()
  if (session?.user) redirect('/')
  return <OnboardingPage />
}
