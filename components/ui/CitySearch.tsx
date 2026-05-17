'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, LocateFixed } from 'lucide-react'

export interface CityResult {
  label: string
  city: string
  postcode: string
  lat: number
  lng: number
}

interface Props {
  defaultValue?: string
  onSelect: (result: CityResult) => void
  inputStyle?: React.CSSProperties
  placeholder?: string
}

export default function CitySearch({ defaultValue = '', onSelect, inputStyle, placeholder }: Props) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<CityResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=6&autocomplete=1`
      )
      const data = await res.json()
      const results: CityResult[] = (data.features ?? []).map((f: {
        geometry: { coordinates: [number, number] }
        properties: { city: string; postcode: string }
      }) => ({
        label: `${f.properties.city} · ${f.properties.postcode}`,
        city: f.properties.city,
        postcode: f.properties.postcode,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }))
      setSuggestions(results)
      setOpen(results.length > 0)
      setActiveIndex(-1)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 280)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); select(suggestions[activeIndex]) }
    if (e.key === 'Escape') setOpen(false)
  }

  async function locateMe() {
    if (!navigator.geolocation) {
      setLocateError('Géolocalisation non supportée par votre navigateur.')
      return
    }
    setLocating(true)
    setLocateError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lon=${lng}&lat=${lat}&limit=1`
          )
          const data = await res.json()
          const f = data.features?.[0]
          if (f && f.properties.city) {
            const result: CityResult = {
              label: `${f.properties.city} (${f.properties.postcode})`,
              city: f.properties.city,
              postcode: f.properties.postcode ?? '',
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            }
            setQuery(`${result.city} (${result.postcode})`)
            setSuggestions([])
            setOpen(false)
            onSelect(result)
          } else {
            setLocateError('Ville non trouvée pour votre position.')
          }
        } catch {
          setLocateError('Erreur lors de la recherche de votre ville.')
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        if (err.code === 1) setLocateError('Accès à la position refusé.')
        else setLocateError('Impossible d\'obtenir votre position.')
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }

  function select(s: CityResult) {
    setQuery(`${s.city} (${s.postcode})`)
    setSuggestions([])
    setOpen(false)
    onSelect(s)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
        <MapPin
          size={14}
          style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ml)', pointerEvents: 'none' }}
        />
        {loading && (
          <Loader2
            size={13}
            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ml)', animation: 'spin 1s linear infinite' }}
          />
        )}
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? 'Ville ou code postal...'}
          style={{ ...inputStyle, paddingLeft: 36 }}
          autoComplete="off"
        />
        </div>

        {/* Bouton Me localiser */}
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          title="Me localiser automatiquement"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 14px',
            height: inputStyle?.padding ? undefined : 42,
            minHeight: 42,
            borderRadius: 'var(--rs)',
            border: '0.5px solid var(--borderS)',
            background: locating ? 'var(--sand)' : 'var(--chalk)',
            color: locating ? 'var(--ml)' : 'var(--cs)',
            cursor: locating ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { if (!locating) (e.currentTarget as HTMLElement).style.background = 'var(--sand)' }}
          onMouseLeave={(e) => { if (!locating) (e.currentTarget as HTMLElement).style.background = 'var(--chalk)' }}
        >
          {locating
            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <LocateFixed size={13} />
          }
          {locating ? 'Localisation...' : 'Me localiser'}
        </button>
      </div>

      {locateError && (
        <p style={{ fontSize: 11, color: '#C03030', marginTop: 4 }}>{locateError}</p>
      )}

      {open && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--chalk)',
            border: '0.5px solid var(--borderS)',
            borderRadius: 'var(--rs)',
            boxShadow: '0 8px 24px rgba(28,28,26,0.12)',
            overflow: 'hidden',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => select(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                background: i === activeIndex ? 'var(--sand)' : 'none',
                border: 'none',
                borderBottom: i < suggestions.length - 1 ? '0.5px solid var(--border)' : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              <MapPin size={12} style={{ color: 'var(--ml)', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 13, color: 'var(--charcoal)', fontWeight: 500 }}>{s.city}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{s.postcode}</span>
              </div>
            </button>
          ))}
          <div style={{ padding: '6px 14px', borderTop: '0.5px solid var(--border)' }}>
            <span style={{ fontSize: 10, color: 'var(--ml)' }}>Données © adresse.data.gouv.fr</span>
          </div>
        </div>
      )}
    </div>
  )
}
