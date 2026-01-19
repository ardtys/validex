'use client'

import React, { useEffect, useState } from 'react'
import Logo from './Logo'

export default function GlassNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-dark shadow-glow-cyan py-4'
          : 'bg-transparent py-8'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center transition-transform hover:scale-105 duration-300"
          >
            <Logo size="nav" withGlow={true} />
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/features"
              className="text-gray-300 hover:text-cyber-cyan-neon transition-colors relative group font-mono text-sm"
            >
              features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyber-cyan-neon to-cyber-blue-neon group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="/demo"
              className="text-gray-300 hover:text-cyber-cyan-neon transition-colors relative group font-mono text-sm"
            >
              demo
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyber-cyan-neon to-cyber-blue-neon group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="/docs"
              className="text-gray-300 hover:text-cyber-cyan-neon transition-colors relative group font-mono text-sm"
            >
              docs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyber-cyan-neon to-cyber-blue-neon group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="/"
              className="px-6 py-2 rounded-lg glass-cyan border border-cyber-cyan/30 hover:border-cyber-cyan hover:shadow-neon-cyan transition-all duration-300"
            >
              <span className="text-cyber-cyan-neon font-mono text-sm font-bold">scan token</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
