import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: fr })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export const MODE_CONFIG = {
  VENTE: {
    label: 'Vente',
    color: '#2D4A3E',
    bg: 'bg-forest',
    text: 'text-forest',
    border: 'border-forest',
    lightBg: 'bg-forest/10',
  },
  TROC: {
    label: 'Troc',
    color: '#4A3520',
    bg: 'bg-earth',
    text: 'text-earth',
    border: 'border-earth',
    lightBg: 'bg-earth/10',
  },
  DON: {
    label: 'Don',
    color: '#2A3D52',
    bg: 'bg-slate',
    text: 'text-slate',
    border: 'border-slate',
    lightBg: 'bg-slate/10',
  },
} as const

export const CATEGORIES = [
  {
    value: 'HABITAT',
    label: 'Habitat',
    hint: 'Meubles, déco, électroménager, vaisselle, literie, jardinage, bricolage, outillage',
  },
  {
    value: 'CULTURE',
    label: 'Culture',
    hint: 'Livres, BD, musique, films, jeux de société, jouets, instruments, art',
  },
  {
    value: 'ELECTRONIQUE',
    label: 'Électronique',
    hint: 'Téléphones, ordinateurs, TV, consoles, photo, son, gaming, accessoires',
  },
  {
    value: 'MODE',
    label: 'Mode',
    hint: 'Vêtements, chaussures, sacs, accessoires, bijoux, montres',
  },
  {
    value: 'SPORT_LOISIRS',
    label: 'Sport & Loisirs',
    hint: 'Sport, vélos, camping, randonnée, loisirs créatifs, jeux outdoor',
  },
  {
    value: 'VEHICULES',
    label: 'Véhicules',
    hint: 'Voitures, motos, scooters, trottinettes, pièces et accessoires',
  },
  {
    value: 'DIVERS',
    label: 'Divers',
    hint: 'Services, compétences, alimentation, animaux, tout le reste',
  },
] as const

export const CONDITIONS = [
  { value: 'NEUF', label: 'Neuf' },
  { value: 'TRES_BON', label: 'Très bon état' },
  { value: 'BON', label: 'Bon état' },
  { value: 'ACCEPTABLE', label: 'État acceptable' },
  { value: 'POUR_PIECES', label: 'Pour pièces' },
] as const

export function getCategoryLabel(value: string): string {
  const cat = CATEGORIES.find((c) => c.value === value)
  return cat ? cat.label : value
}

export function getConditionLabel(value: string): string {
  const cond = CONDITIONS.find((c) => c.value === value)
  return cond ? cond.label : value
}
