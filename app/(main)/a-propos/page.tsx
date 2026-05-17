export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'A propos - Ohaia',
  description: 'Pourquoi Ohaia existe, ce en quoi nous croyons, et les personnes derriere la plateforme.',
}

export default function AProposPage() {
  return (
    <div style={{ background: 'var(--chalk)', color: 'var(--charcoal)' }}>

      {/* Hero */}
      <section
        style={{
          background: 'var(--charcoal)',
          color: 'var(--chalk)',
          padding: '96px 24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.4,
            marginBottom: 28,
          }}
        >
          À propos d&apos;Ohaia
        </p>
        <h1
          className="font-serif"
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 400,
            lineHeight: 1.2,
            maxWidth: 680,
            margin: '0 auto 28px',
          }}
        >
          La meilleure production est celle qu&apos;on n&apos;a pas faite.
        </h1>
        <p style={{ fontSize: 15, opacity: 0.5, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Ohaia est une plateforme d&apos;échanges locaux, vente, troc, don, pensée pour que les objets circulent plutôt qu&apos;ils ne s&apos;accumulent.
        </p>
      </section>

      {/* Manifeste + stats */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 20,
            }}
          >
            Pourquoi trois modes
          </p>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.35, marginBottom: 20 }}>
            Vendre, troquer, donner, trois gestes, une même conviction.
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--muted)' }}>
            Une plateforme qui ne propose que la vente encourage à tout monnayer. Une plateforme qui ne propose que le don décourage ceux qui ont besoin de récupérer quelque chose en échange. Ohaia réunit les trois parce que chaque situation est différente, et que forcer un seul modèle revient à en exclure une partie des gens.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--muted)', marginTop: 14 }}>
            Ce qui compte, c&apos;est que l&apos;objet trouve quelqu&apos;un à qui il manquait, peu importe la forme que prend l&apos;échange.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', border: '0.5px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
          {[
            { val: '0 €',   label: 'de frais sur les dons et le troc' },
            { val: '0',     label: 'publicité, jamais' },
            { val: '100 %', label: 'hébergement européen' },
            { val: '∞',     label: 'objets qui méritent une seconde vie' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--chalk)', padding: '28px 20px' }}>
              <p className="font-serif" style={{ fontSize: 30, marginBottom: 6 }}>{s.val}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Histoire */}
      <section style={{ background: 'var(--sand)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: 20,
            }}
          >
            L&apos;origine
          </p>
          <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.35, marginBottom: 24 }}>
            Des cartons, des livres, et l&apos;envie que ça serve à quelqu&apos;un.
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--muted)' }}>
            Céline et Pascal déménagent en 2023. Ils ont des livres, des disques, des affaires de cuisine qu&apos;ils ne veulent pas jeter mais qu&apos;ils n&apos;ont pas le temps de vendre. Ils essaient les grandes plateformes. Les interfaces sont épuisantes, les frais opaques, les acheteurs fantômes. Ils finissent par poser des cartons devant leur porte avec un mot manuscrit.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--muted)', marginTop: 16 }}>
            Ohaia est née de cette frustration, et de l&apos;idée qu&apos;il devrait exister un endroit simple, local, sans friction, où faire circuler les objets entre voisins et personnes proches.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--muted)', marginTop: 16 }}>
            Le nom vient du basque <em>oiha</em>, qui désigne la forêt, un espace vivant fait d&apos;interdépendances naturelles où rien ne se perd vraiment. Coïncidence heureuse, <em>oiha</em> signifie aussi oasis en maori, un lieu de ressource et de passage, un endroit où l&apos;on se retrouve.
          </p>
        </div>
      </section>

      {/* Pull quote */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <blockquote style={{ maxWidth: 640, margin: '0 auto' }}>
          <p
            className="font-serif"
            style={{ fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 400, lineHeight: 1.4, color: 'var(--charcoal)', marginBottom: 20 }}
          >
            &ldquo;Ce que vous ne voulez plus a peut-être exactement la forme de ce dont quelqu&apos;un d&apos;autre a besoin.&rdquo;
          </p>
          <footer style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Pascal, cofondateur
          </footer>
        </blockquote>
      </section>

      {/* Engagements */}
      <section style={{ background: 'var(--charcoal)', color: 'var(--chalk)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: 0.4,
              marginBottom: 40,
              textAlign: 'center',
            }}
          >
            Nos engagements
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
            {[
              {
                title: 'Pas de publicité.',
                body: "Jamais. Pas de bannières, pas de ciblage, pas de données vendues à des annonceurs. Le modèle économique repose sur une commission réduite sur les ventes, et rien d'autre.",
              },
              {
                title: "Pas d'algorithme de rétention.",
                body: "Ohaia ne cherche pas à vous garder le plus longtemps possible. Vous venez, vous trouvez ce qu'il vous faut, vous partez. C'est tout.",
              },
              {
                title: 'Des frais transparents.',
                body: "Les dons sont gratuits. Les échanges sont gratuits. Une petite commission s'applique uniquement sur les ventes, clairement affichée avant toute transaction.",
              },
            ].map((e) => (
              <div key={e.title}>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>{e.title}</p>
                <p style={{ fontSize: 12, lineHeight: 1.8, opacity: 0.55 }}>{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          L&apos;équipe
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          {[
            {
              name: 'Céline',
              role: 'Cofondatrice, produit',
              why: "Convaincue que la sobriété ne devrait pas demander d'effort.",
            },
            {
              name: 'Pascal',
              role: 'Cofondateur, technique',
              why: "Croit qu'un bon outil est un outil qu'on oublie d'utiliser tellement il est évident.",
            },
            {
              name: 'Idir',
              role: 'Design & expérience',
              why: "Pense que la forme d'une interface dit quelque chose sur les valeurs de ceux qui l'ont faite.",
            },
          ].map((p) => (
            <div
              key={p.name}
              style={{
                padding: 24,
                background: 'var(--sand)',
                borderRadius: 'var(--r)',
                border: '0.5px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--charcoal)',
                  color: 'var(--chalk)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                {p.name[0]}
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.name}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.role}</p>
              <p style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--muted)', fontStyle: 'italic' }}>{p.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact + CTA */}
      <section style={{ background: 'var(--sand)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 400, lineHeight: 1.3, marginBottom: 20 }}>
            Chaque échange sur Ohaia, c&apos;est une chose intéressante ou utile qu&apos;on n&apos;a pas fabriquée.
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 40 }}>
            On ne prétend pas changer le monde. On essaie juste de rendre un peu plus facile le fait de ne pas l&apos;abîmer.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/annonces"
              style={{
                background: 'var(--charcoal)',
                color: 'var(--chalk)',
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Voir les annonces
            </Link>
            <Link
              href="/rejoindre"
              style={{
                background: 'transparent',
                color: 'var(--charcoal)',
                padding: '12px 28px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                border: '0.5px solid var(--charcoal)',
                textDecoration: 'none',
              }}
            >
              Rejoindre Ohaia
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
