'use client'

import Link from 'next/link'

const STATS = [
  { num: '284 k', label: 'Annonces actives' },
  { num: '62 t',  label: 'CO₂ évité' },
  { num: '18 k',  label: 'Trocs réalisés' },
  { num: '6 200', label: 'Objets donnés' },
]

const MODES_STRIP = [
  {
    color: '#2D4A3E', light: '#E8F0ED',
    title: 'Acheter · Vendre',
    desc: 'Des objets de qualité, à des prix justes, entre personnes. Pas d\'intermédiaire, pas de frais cachés.',
    count: '248 000 annonces',
  },
  {
    color: '#4A3520', light: '#F0EBE3',
    title: 'Troquer',
    desc: 'Échangez sans argent. Ce que vous n\'utilisez plus contre ce dont vous avez besoin.',
    count: '18 400 propositions',
  },
  {
    color: '#2A3D52', light: '#E5ECF4',
    title: 'Donner',
    desc: 'Offrez une seconde vie à vos objets. Quelqu\'un près de chez vous en a besoin.',
    count: '6 200 à adopter',
  },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--chalk)', color: 'var(--charcoal)' }}>

      {/* ─── HERO ─── */}
      <div
        style={{
          padding: '88px 32px 80px',
          textAlign: 'center',
          maxWidth: 780,
          margin: '0 auto',
          animation: 'obFadeUp 0.5s ease both',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--muted)',
            marginBottom: 24,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D4A3E', display: 'inline-block' }} />
          Acheter · Troquer · Donner
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2A3D52', display: 'inline-block' }} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(38px, 6vw, 56px)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-1px',
            marginBottom: 22,
            color: 'var(--charcoal)',
          }}
        >
          L&rsquo;économie du lien,<br />
          <em style={{ fontStyle: 'italic', color: 'var(--muted)' }}>près de chez vous.</em>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            fontWeight: 300,
            color: 'var(--muted)',
            lineHeight: 1.75,
            maxWidth: 480,
            margin: '0 auto 38px',
          }}
        >
          Ohaia réunit achat, troc et don dans un même espace. Simple, beau, humain.
          Pour ce qui vous appartient, et ce qui peut appartenir à quelqu&rsquo;un d&rsquo;autre.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/rejoindre"
            style={{
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 500,
              padding: '14px 32px',
              borderRadius: 100,
              border: 'none',
              background: 'var(--charcoal)',
              color: 'var(--chalk)',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '0.87'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = '1'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            Commencer
          </Link>
          <Link
            href="/annonces"
            style={{
              fontFamily: 'inherit',
              fontSize: 14,
              padding: '13px 28px',
              borderRadius: 100,
              border: '0.5px solid var(--borderS)',
              background: 'none',
              color: 'var(--cs)',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            Voir les annonces
          </Link>
        </div>

        {/* Note */}
        <p style={{ fontSize: 11, color: 'var(--ml)', marginTop: 16 }}>
          Gratuit · Sans publicité · Sans algorithme caché
        </p>
      </div>

      {/* ─── STATS BAR ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '24px 32px',
          borderTop: '0.5px solid var(--border)',
          borderBottom: '0.5px solid var(--border)',
          background: 'var(--sand)',
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: 'center',
              padding: '4px 40px',
              borderRight: i < STATS.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 28,
                fontWeight: 400,
                color: 'var(--charcoal)',
                marginBottom: 2,
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── 3 MODES STRIP ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
        }}
      >
        {MODES_STRIP.map((m, i) => (
          <Link
            key={m.title}
            href="/rejoindre"
            style={{
              display: 'block',
              padding: '32px 28px',
              borderRight: i < 2 ? '0.5px solid var(--border)' : 'none',
              borderBottom: '0.5px solid var(--border)',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--sand)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: m.light,
                marginBottom: 16,
              }}
            />
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 20,
                fontWeight: 400,
                color: 'var(--charcoal)',
                marginBottom: 6,
              }}
            >
              {m.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                lineHeight: 1.6,
                fontWeight: 300,
                marginBottom: 16,
              }}
            >
              {m.desc}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: m.color, display: 'flex', alignItems: 'center', gap: 5 }}>
              {m.count}
              <span style={{ color: 'var(--ml)' }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── MANIFESTO BAND ─── */}
      <div style={{ background: 'var(--charcoal)', padding: '72px 32px', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 400,
            color: 'var(--chalk)',
            lineHeight: 1.15,
            marginBottom: 16,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Les objets ont une vie.<br />
          <em style={{ fontStyle: 'italic', color: 'var(--ml)' }}>Aidons-les à continuer.</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ml)', fontWeight: 300, maxWidth: 400, margin: '0 auto 32px' }}>
          Chaque achat de produit neuf évité, chaque troc réalisé, chaque don accepté est un acte concret pour la planète, et pour le lien humain.
        </p>
        <Link
          href="/rejoindre"
          style={{
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 500,
            padding: '13px 28px',
            borderRadius: 100,
            background: 'var(--chalk)',
            color: 'var(--charcoal)',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Rejoindre Ohaia
        </Link>
      </div>

      {/* ─── FOOTER ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '28px 32px',
          borderTop: '0.5px solid var(--border)',
        }}
      >
        <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: 'var(--muted)' }}>Ohaia</span>
        <div style={{ display: 'flex', gap: 20, fontSize: 11, color: 'var(--ml)' }}>
          {['À propos', 'Confidentialité', 'CGU', 'Contact'].map((l) => (
            <span key={l} style={{ cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--ml)' }}>© 2026 Ohaia</span>
      </div>

    </div>
  )
}
