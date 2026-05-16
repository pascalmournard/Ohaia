export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight, Repeat2, Gift, ShoppingBag } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import AnnonceCard from '@/components/annonces/AnnonceCard'
import type { Listing } from '@/types'

async function getRecentListings(): Promise<Listing[]> {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            city: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
    return listings as Listing[]
  } catch {
    return []
  }
}

const MODE_CARDS = [
  {
    mode: 'VENTE',
    icon: ShoppingBag,
    title: 'Vente',
    subtitle: 'Trouvez des objets à petit prix près de chez vous.',
    color: 'forest',
    bg: 'bg-forest/8',
    text: 'text-forest',
    border: 'border-forest/20',
    href: '/annonces?mode=VENTE',
    cta: 'Voir les ventes',
    ctaClass: 'btn-mode-vente',
  },
  {
    mode: 'TROC',
    icon: Repeat2,
    title: 'Troc',
    subtitle: 'Échangez ce que vous n\'utilisez plus contre ce dont vous avez besoin.',
    color: 'earth',
    bg: 'bg-earth/8',
    text: 'text-earth',
    border: 'border-earth/20',
    href: '/annonces?mode=TROC',
    cta: 'Voir les trocs',
    ctaClass: 'btn-mode-troc',
  },
  {
    mode: 'DON',
    icon: Gift,
    title: 'Don',
    subtitle: 'Offrez une seconde vie à vos objets en les donnant gratuitement.',
    color: 'slate',
    bg: 'bg-slate/8',
    text: 'text-slate',
    border: 'border-slate/20',
    href: '/annonces?mode=DON',
    cta: 'Voir les dons',
    ctaClass: 'btn-mode-don',
  },
]

export default async function HomePage() {
  const recentListings = await getRecentListings()

  return (
    <div>
      {/* Hero */}
      <section className="page-container pt-20 pb-16">
        <div className="max-w-3xl">
          <h1 className="font-serif text-6xl md:text-7xl text-charcoal leading-none tracking-tight mb-6">
            Acheter,<br />
            troquer,<br />
            donner.
          </h1>
          <p className="text-lg text-charcoal/55 max-w-md mb-10 leading-relaxed">
            Ohaia réunit l&apos;achat, l&apos;échange et le don en une seule marketplace.
            Participez à l&apos;économie circulaire locale.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/annonces" className="btn-primary gap-2">
              Explorer les annonces
              <ArrowRight size={15} />
            </Link>
            <Link href="/publier" className="btn-secondary">
              Publier une annonce
            </Link>
          </div>
        </div>
      </section>

      {/* Mode showcase */}
      <section className="bg-sand border-y border-thin border-charcoal/8">
        <div className="page-container py-16">
          <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-8">
            Trois façons d&apos;échanger
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.mode}
                  className={`card-base p-6 space-y-4 border ${card.border}`}
                >
                  <div className={`inline-flex p-2.5 rounded-sm ${card.bg}`}>
                    <Icon size={20} className={card.text} />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-charcoal mb-2">{card.title}</h2>
                    <p className="text-sm text-charcoal/55 leading-relaxed">{card.subtitle}</p>
                  </div>
                  <Link href={card.href} className={card.ctaClass}>
                    {card.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent listings */}
      <section className="page-container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-charcoal/40 mb-2">
              Dernières annonces
            </p>
            <h2 className="section-title">Récemment publiées</h2>
          </div>
          <Link
            href="/annonces"
            className="hidden sm:flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
          >
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentListings.map((listing) => (
              <AnnonceCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-3xl text-charcoal/20 mb-3">Aucune annonce</p>
            <p className="text-sm text-charcoal/40 mb-6">Soyez le premier à publier une annonce.</p>
            <Link href="/publier" className="btn-primary">
              Publier maintenant
            </Link>
          </div>
        )}

        {recentListings.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/annonces" className="btn-secondary">
              Voir toutes les annonces
            </Link>
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="bg-charcoal">
        <div className="page-container py-16 text-center">
          <h2 className="font-serif text-4xl text-chalk mb-4">
            Prêt à participer ?
          </h2>
          <p className="text-chalk/50 mb-8 max-w-md mx-auto">
            Rejoignez la communauté Ohaia et donnez une seconde vie à vos objets.
          </p>
          <Link
            href="/publier"
            className="inline-flex items-center gap-2 px-8 py-3 bg-chalk text-charcoal rounded-pill text-sm font-[500] hover:bg-chalk/90 transition-colors"
          >
            Publier une annonce gratuitement
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}
