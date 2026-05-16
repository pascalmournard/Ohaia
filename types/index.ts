import type {
  User as PrismaUser,
  Listing as PrismaListing,
  Message as PrismaMessage,
  Conversation as PrismaConversation,
  Review as PrismaReview,
  Mode,
  Category,
  Condition,
  ListingStatus,
} from '@prisma/client'

export type { Mode, Category, Condition, ListingStatus }

export type User = PrismaUser

export type PublicUser = Pick<
  PrismaUser,
  'id' | 'name' | 'image' | 'city' | 'createdAt'
>

export type Listing = PrismaListing & {
  user: PublicUser
  _count?: {
    conversations: number
  }
}

export type ListingWithDetails = PrismaListing & {
  user: PrismaUser
  conversations: ConversationPreview[]
  _count: {
    conversations: number
  }
}

export type Message = PrismaMessage & {
  sender: PublicUser
}

export type ConversationPreview = PrismaConversation & {
  participants: PublicUser[]
  listing: Pick<PrismaListing, 'id' | 'title' | 'images' | 'mode'>
  messages: Message[]
  _count?: {
    messages: number
  }
}

export type ConversationWithMessages = PrismaConversation & {
  participants: PublicUser[]
  listing: PrismaListing & { user: PublicUser }
  messages: Message[]
}

export type ReviewWithAuthor = PrismaReview & {
  author: PublicUser
}

export type UserProfile = PrismaUser & {
  listings: Listing[]
  reviewsReceived: ReviewWithAuthor[]
  _count: {
    listings: number
    reviewsGiven: number
    reviewsReceived: number
  }
}

export interface ListingFilters {
  mode?: Mode
  category?: Category
  city?: string
  search?: string
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

export interface CreateListingPayload {
  title: string
  description: string
  mode: Mode
  category: Category
  condition: Condition
  price?: number
  tradeFor?: string
  images: string[]
  city: string
  latitude?: number
  longitude?: number
}

export interface SendMessagePayload {
  content: string
}

export interface CreateReviewPayload {
  targetId: string
  rating: number
  comment?: string
}
