'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoIntroProps {
  onDone: () => void
}

export default function VideoIntro({ onDone }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fading, setFading] = useState(false)
  const [muted, setMuted] = useState(true)

  function dismiss() {
    setFading(true)
    setTimeout(() => {
      sessionStorage.setItem('intro-seen', '1')
      onDone()
    }, 900)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
    v.addEventListener('ended', dismiss)
    return () => v.removeEventListener('ended', dismiss)
  }, [])

  function toggleMute() {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.9s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <video
        ref={videoRef}
        src="/videos/intro.mp4"
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Gradient bas */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 160,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Contrôles */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
        }}
      >
        {/* Son */}
        <button
          onClick={toggleMute}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '0.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            borderRadius: 999,
            padding: '8px 18px',
            fontSize: 12,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          {muted ? '🔇 Son' : '🔊 Son'}
        </button>

        {/* Passer */}
        <button
          onClick={dismiss}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '0.5px solid rgba(255,255,255,0.25)',
            color: '#fff',
            borderRadius: 999,
            padding: '8px 22px',
            fontSize: 12,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            letterSpacing: '0.04em',
          }}
        >
          Passer →
        </button>
      </div>
    </div>
  )
}
