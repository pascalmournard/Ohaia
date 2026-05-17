'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  city: string
  mode?: string
}

const MODE_COLOR: Record<string, string> = {
  VENTE: '#2D4A3E',
  TROC: '#4A3520',
  DON: '#2A3D52',
}

export default function ListingMap({ lat, lng, city, mode = 'VENTE' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Inject Leaflet CSS once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const color = MODE_COLOR[mode] ?? MODE_COLOR.VENTE

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Zone floue pour préserver la vie privée (rayon ~800m)
      L.circle([lat, lng], {
        radius: 800,
        color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        opacity: 0.5,
      }).addTo(map)

      // Marker personnalisé
      const icon = L.divIcon({
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
          background: ${color}; border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          transform: rotate(-45deg);
        "></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<b style="font-size:13px">${city}</b><br><span style="font-size:11px;color:#888">Zone approximative</span>`)

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove()
        mapRef.current = null
      }
    }
  }, [lat, lng, city, mode])

  return (
    <div
      ref={containerRef}
      style={{
        height: 220,
        borderRadius: 'var(--rs)',
        overflow: 'hidden',
        border: '0.5px solid var(--border)',
      }}
    />
  )
}
