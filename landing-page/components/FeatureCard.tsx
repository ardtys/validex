'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative p-6 rounded-xl glass-dark hover:glass-cyan transition-all duration-300 hover:shadow-glow-cyan">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 to-cyber-blue/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-xl border border-cyber-cyan/50 animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Icon with glow */}
        <div className="mb-4 inline-block p-3 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan-neon group-hover:shadow-neon-cyan group-hover:animate-float transition-all">
          <Icon size={32} />
        </div>

        {/* Title with gradient on hover */}
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-gradient-cyan transition-all">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
          {description}
        </p>
      </div>
    </div>
  )
}
