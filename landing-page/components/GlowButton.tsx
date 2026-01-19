'use client'

import React from 'react'

interface GlowButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function GlowButton({
  children,
  onClick,
  className = '',
  variant = 'primary'
}: GlowButtonProps) {
  const baseStyles = "px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden"

  const variantStyles = {
    primary: "bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-cyan-bright text-white shadow-neon-cyan hover:shadow-glow-cyan",
    secondary: "glass-cyan border-2 border-cyber-cyan/50 text-cyber-cyan-neon hover:border-cyber-cyan hover:shadow-neon-cyan",
    ghost: "border-2 border-cyber-cyan/30 text-cyber-cyan-light hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:shadow-neon-cyan"
  }

  return (
    <button
      onClick={onClick}
      className={`group ${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {/* Animated background shimmer effect */}
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      <span className="relative z-10">{children}</span>
    </button>
  )
}
