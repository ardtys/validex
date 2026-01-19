'use client'

import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'cyan' | 'dark'
  hoverGlow?: boolean
}

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  hoverGlow = true
}: GlassCardProps) {
  const variantStyles = {
    default: 'glass',
    cyan: 'glass-cyan',
    dark: 'glass-dark'
  }

  const hoverStyle = hoverGlow
    ? 'hover:shadow-glass-hover hover:border-cyber-cyan/40 transition-all duration-300'
    : ''

  return (
    <div className={`${variantStyles[variant]} rounded-2xl ${hoverStyle} ${className}`}>
      {children}
    </div>
  )
}
