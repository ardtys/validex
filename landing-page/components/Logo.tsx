'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'nav'
  withGlow?: boolean
  className?: string
}

export default function Logo({ size = 'medium', withGlow = true, className = '' }: LogoProps) {
  const sizes = {
    nav: {
      width: 180,
      height: 45,
      containerClass: 'h-11'
    },
    small: {
      width: 140,
      height: 35,
      containerClass: 'h-9'
    },
    medium: {
      width: 200,
      height: 50,
      containerClass: 'h-12'
    },
    large: {
      width: 260,
      height: 65,
      containerClass: 'h-16'
    }
  }

  const { width, height, containerClass } = sizes[size]

  const glowClass = withGlow
    ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] hover:drop-shadow-[0_0_20px_rgba(56,189,248,0.7)] transition-all duration-300'
    : ''

  return (
    <div className={`relative inline-flex items-center ${containerClass} ${className}`}>
      <Image
        src="/validex.png"
        alt="VALIDEX"
        width={width}
        height={height}
        className={`h-full w-auto object-contain ${glowClass}`}
        priority
        quality={100}
      />
    </div>
  )
}
