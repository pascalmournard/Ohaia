export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STOP_WORDS = new Set([
  'un', 'une', 'des', 'le', 'la', 'les', 'de', 'du', 'en', 'et', 'ou',
  'pour', 'avec', 'sans', 'dans', 'sur', 'par', 'au', 'aux', 'mon', 'ton',
  'son', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'ce', 'cet', 'cette',
  'ces', 'qui', 'que', 'dont', 'bon', 'bonne', 'etat', 'tres', 'bel', 'belle',
  'ancien', 'ancienne', 'vieux', 'vieille', 'petit', 'petite', 'grand', 'grande',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function overlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setB = new Set(b)
  return a.filter(w => setB.has(w)).length
}

function priceScore(p1: number | null, p2: number | null): number {
  if (p1 == null || p2 == null) return 0
  const max = Math.max(p1, p2)
  if (max === 0) return 1
  const diff = Math.abs(p1 - p2) / max
  if (diff <= 0.1) return 2
  if (diff <= 0.3) return 1.5
  if (diff <= 0.6) return 0.5
  return 0
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
  })

  if (!listing || listing.mode !== 'TROC') {
    return NextResponse.json([])
  }

  const candidates = await prisma.listing.findMany({
    where: {
      mode: 'TROC',
      status: 'ACTIVE',
      NOT: { id: params.id },
    },
    include: {
      user: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
    },
    take: 300,
  })

  const myTitleTokens = tokenize(listing.title)
  const myTradeForTokens = tokenize(listing.tradeFor || '')

  const scored = candidates
    .map(candidate => {
      const candTitleTokens = tokenize(candidate.title)
      const candTradeForTokens = tokenize(candidate.tradeFor || '')

      // Bidirectional match: candidate has what I want + candidate wants what I have
      const hasWhatIWant = overlap(myTradeForTokens, candTitleTokens)
      const wantsWhatIHave = overlap(candTradeForTokens, myTitleTokens)
      const categoryBonus = listing.category === candidate.category ? 2 : 0
      const pScore = priceScore(listing.price, candidate.price)

      const score = hasWhatIWant * 2 + wantsWhatIHave * 2 + categoryBonus + pScore

      const soulte =
        listing.price != null && candidate.price != null
          ? Math.round(Math.abs(listing.price - candidate.price))
          : null

      return { listing: candidate, score, soulte, hasWhatIWant, wantsWhatIHave }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return NextResponse.json(scored)
}
