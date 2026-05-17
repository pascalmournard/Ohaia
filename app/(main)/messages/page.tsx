import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages',
  description: 'Vos conversations sur Ohaia.',
}

export default function MessagesPage() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--chalk)' }}>
      <div className="text-center">
        <p className="font-serif text-[28px] mb-2" style={{ color: 'rgba(28,28,26,0.12)' }}>Sélectionnez une conversation</p>
        <p className="text-[13px]" style={{ color: 'var(--ml)' }}>Choisissez une conversation dans la liste</p>
      </div>
    </div>
  )
}
