import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const createReviewSchema = z.object({
  targetId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { targetId, rating, comment } = createReviewSchema.parse(body)

    if (targetId === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous laisser un avis.' }, { status: 400 })
    }

    // Check that target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: targetId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
    }

    // Check that a review doesn't already exist from this author to this target
    const existingReview = await prisma.review.findFirst({
      where: { authorId: session.user.id, targetId },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour cet utilisateur.' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        authorId: session.user.id,
        targetId,
      },
      include: {
        author: { select: { id: true, name: true, image: true, city: true, createdAt: true } },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides.', details: err.errors }, { status: 400 })
    }
    console.error('POST /api/reviews error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
