'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src?: string | null
  name?: string | null
  size?: number
  background?: string
  border?: string
  fontSize?: number
  color?: string
}

export default function Avatar({
  src,
  name,
  size = 88,
  background = '#2D4A3E',
  border = '3px solid var(--chalk)',
  fontSize,
  color = 'white',
}: Props) {
  const [failed, setFailed] = useState(false)
  const initial = name?.[0]?.toUpperCase() || '?'
  const fs = fontSize ?? Math.round(size * 0.34)

  if (src && !failed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <Image
          src={src}
          alt={name || ''}
          fill
          className="object-cover"
          onError={() => setFailed(true)}
          unoptimized={src.startsWith('blob:') || src.startsWith('data:')}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background,
        border,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: fs,
        fontWeight: 400,
        color,
        overflow: 'hidden',
      }}
    >
      {initial}
    </div>
  )
}
