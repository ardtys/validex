'use client'

import React from 'react'

interface TerminalProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export default function Terminal({ children, className = '', title }: TerminalProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Terminal Window */}
      <div className="glass-dark rounded-lg border border-cyber-cyan/20 shadow-glow-cyan overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-cyber-cyan/20 bg-cyber-black/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {title && (
            <span className="text-xs text-gray-400 font-mono ml-2">{title}</span>
          )}
        </div>

        {/* Terminal Content */}
        <div className="p-6 font-mono text-sm leading-relaxed">
          {children}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyber-cyan/10 to-cyber-blue/10 rounded-lg blur-xl" />
    </div>
  )
}
