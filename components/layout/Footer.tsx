import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-thin border-charcoal/10 bg-chalk mt-auto">
      <div className="page-container py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="font-serif text-2xl text-charcoal">
              Ohaia
            </Link>
            <p className="text-sm text-charcoal/50 max-w-xs">
              L&apos;économie circulaire, simplement.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-charcoal/40">Acheter</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/annonces?mode=VENTE" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Vente
                  </Link>
                </li>
                <li>
                  <Link href="/annonces?mode=TROC" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Troc
                  </Link>
                </li>
                <li>
                  <Link href="/annonces?mode=DON" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Don
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-charcoal/40">Vendre</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/publier" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Publier une annonce
                  </Link>
                </li>
                <li>
                  <Link href="/messages" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Mes messages
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-charcoal/40">Ohaia</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/a-propos" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/conditions" className="text-sm text-charcoal/60 hover:text-charcoal transition-colors">
                    Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-thin border-charcoal/8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-charcoal/35">
            &copy; {new Date().getFullYear()} Ohaia. Tous droits réservés.
          </p>
          <p className="text-xs text-charcoal/35">
            Fait avec soin en France
          </p>
        </div>
      </div>
    </footer>
  )
}
