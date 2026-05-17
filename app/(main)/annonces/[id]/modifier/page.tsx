export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EditForm from '@/components/annonces/EditForm'

interface PageProps {
  params: { id: string }
}

export default async function ModifierAnnoncePage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/signin')

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) notFound()
  if (listing.userId !== session.user.id) redirect(`/annonces/${params.id}`)

  return <EditForm listing={listing} />
}
