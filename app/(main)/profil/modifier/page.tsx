export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EditProfileForm from '@/components/profil/EditProfileForm'

export default async function ModifierProfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, image: true, bio: true, city: true, email: true },
  })

  if (!user) redirect('/signin')

  return <EditProfileForm user={user} />
}
