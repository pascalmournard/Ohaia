import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import PublishForm from '@/components/publish/PublishForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publier une annonce',
  description: 'Publiez votre annonce de vente, troc ou don sur Ohaia.',
}

export default async function PublierPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin?callbackUrl=/publier')
  }

  return (
    <div className="page-container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-charcoal mb-2">Publier une annonce</h1>
          <p className="text-charcoal/50">Quelques étapes pour mettre votre objet en ligne.</p>
        </div>
        <PublishForm />
      </div>
    </div>
  )
}
