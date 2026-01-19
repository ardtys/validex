'use client'

import React, { useState } from 'react'
import { Shield, Zap, Droplets, Lock, TrendingUp, Users, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import GlowButton from '@/components/GlowButton'
import FeatureCard from '@/components/FeatureCard'
import AuditResultCard from '@/components/AuditResultCard'
import GlassNav from '@/components/GlassNav'
import GlassCard from '@/components/GlassCard'
import Logo from '@/components/Logo'

export default function Home() {
  const [tokenAddress, setTokenAddress] = useState('')

  const handleAudit = () => {
    if (tokenAddress.trim()) {
      console.log('Auditing token:', tokenAddress)
      // Here you would call your backend API
      alert(`Auditing token: ${tokenAddress}`)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Animated Background with Cyan Glow */}
      <div className="fixed inset-0 z-0">
        {/* Main cyan glow spots */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-cyber-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyber-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Additional subtle glows */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyber-cyan/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid overlay for tech feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <GlassNav />

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-32 pb-32 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-cyan border border-cyber-cyan/40 mb-8 animate-slide-up shadow-neon-cyan">
              <Sparkles className="text-cyber-cyan-neon" size={18} />
              <span className="text-sm font-semibold text-gradient-cyan">Real-time Solana Token Security Analysis</span>
            </div>

            {/* Headline with Cyan Glow */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-slide-up">
              Don't Get <span className="text-gradient glow-text">Rugged</span>.
              <br />
              <span className="text-white">Audit Any Solana Token</span>
              <br />
              in <span className="text-gradient glow-text">Seconds</span>.
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-14 max-w-3xl mx-auto animate-slide-up leading-relaxed">
              Protect yourself from rug pulls, honeypots, and scams. Get instant security analysis
              powered by <span className="text-cyber-cyan-neon font-semibold">advanced on-chain scanning</span>.
            </p>

            {/* Input Section with Glassmorphism */}
            <div className="max-w-3xl mx-auto mb-10 animate-slide-up">
              <GlassCard variant="dark" className="p-3 shadow-glow-cyan">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Paste Solana token address (CA)..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    className="flex-1 px-6 py-5 bg-cyber-black/50 rounded-xl border border-cyber-cyan/20 focus:border-cyber-cyan focus:outline-none focus:ring-2 focus:ring-cyber-cyan/30 text-white placeholder-gray-500 transition-all"
                  />
                  <GlowButton onClick={handleAudit} className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Shield size={22} />
                      <span>Audit Now</span>
                    </div>
                  </GlowButton>
                </div>
              </GlassCard>
              <p className="text-sm text-gray-500 mt-5 font-mono">
                Example: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
              </p>
            </div>

            {/* Trust Badges with Glassmorphism */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm animate-slide-up">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass">
                <CheckCircle className="text-cyber-green-neon" size={20} />
                <span className="text-gray-300 font-medium">10,000+ Tokens Scanned</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass">
                <Zap className="text-cyber-cyan-neon" size={20} />
                <span className="text-gray-300 font-medium">Instant Results</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass">
                <Lock className="text-cyber-blue-neon" size={20} />
                <span className="text-gray-300 font-medium">100% Secure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Comprehensive</span> Security Checks
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our advanced scanning engine analyzes every critical aspect of token security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={AlertTriangle}
              title="Mint Authority Check"
              description="Detect if developers can mint unlimited tokens. Protects you from hidden inflation and token dilution attacks."
            />
            <FeatureCard
              icon={Lock}
              title="Honeypot Detector"
              description="Simulate buy/sell transactions to detect if tokens can be sold. Identifies locked liquidity traps instantly."
            />
            <FeatureCard
              icon={Droplets}
              title="Liquidity Analysis"
              description="Verify liquidity pool security and lock status. Ensures your investment is protected from rug pulls."
            />
          </div>

          {/* Additional Features Row */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
            <FeatureCard
              icon={Shield}
              title="Freeze Authority"
              description="Check if developers can freeze token accounts. Prevents wallet lockout scenarios."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Holder Analysis"
              description="Analyze token distribution and top holders. Identify whale concentration risks."
            />
            <FeatureCard
              icon={Zap}
              title="Real-time Updates"
              description="Get live data from Solana mainnet. Always up-to-date with current on-chain state."
            />
          </div>
        </section>

        {/* Live Demo Section */}
        <section id="demo" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See It In <span className="text-gradient">Action</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Here's what a typical audit report looks like
            </p>
          </div>

          <AuditResultCard />
        </section>

        {/* Trust Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-cyber-darker to-cyber-dark border border-cyber-purple/30 p-12 text-center">
              <Users className="mx-auto mb-6 text-cyber-purple-neon" size={48} />
              <h2 className="text-3xl font-bold mb-4">Trusted by the Solana Community</h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of traders who protect their investments with SolanaGuard
              </p>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div>
                  <div className="text-4xl font-bold text-gradient mb-2">10,000+</div>
                  <div className="text-gray-400">Tokens Scanned</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient mb-2">5,000+</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gradient mb-2">99.9%</div>
                  <div className="text-gray-400">Accuracy Rate</div>
                </div>
              </div>

              {/* Partner Logos Placeholder */}
              <div className="mt-12 pt-12 border-t border-cyber-purple/20">
                <p className="text-sm text-gray-500 mb-6">As featured on</p>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className="px-6 py-3 rounded-lg bg-cyber-black/50 border border-cyber-purple/20 text-gray-400">
                    Solana FM
                  </div>
                  <div className="px-6 py-3 rounded-lg bg-cyber-black/50 border border-cyber-purple/20 text-gray-400">
                    DexScreener
                  </div>
                  <div className="px-6 py-3 rounded-lg bg-cyber-black/50 border border-cyber-purple/20 text-gray-400">
                    Birdeye
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <GlassCard variant="cyan" className="max-w-4xl mx-auto text-center p-16 shadow-glow-cyan">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/20 to-cyber-blue/20 rounded-2xl blur-2xl" />

              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-bold mb-6">
                  Start Auditing <span className="text-gradient glow-text">Today</span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
                  Protect your crypto investments with <span className="text-cyber-cyan-neon font-semibold">real-time security analysis</span>
                </p>
                <GlowButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className="flex items-center gap-3">
                    <Shield size={22} />
                    <span>Audit Your First Token</span>
                  </div>
                </GlowButton>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className="border-t border-cyber-cyan/10 py-12 mt-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Logo */}
              <a href="/" className="transition-transform hover:scale-105 duration-300">
                <Logo size="medium" withGlow={true} />
              </a>

              {/* Links */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
                <a href="#" className="hover:text-cyber-cyan-neon transition-colors">Documentation</a>
                <a href="#" className="hover:text-cyber-cyan-neon transition-colors">API</a>
                <a href="#" className="hover:text-cyber-cyan-neon transition-colors">Twitter</a>
                <a href="#" className="hover:text-cyber-cyan-neon transition-colors">Discord</a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-12 pt-8 border-t border-cyber-cyan/10">
              <div className="max-w-4xl mx-auto">
                <GlassCard variant="dark" className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="text-cyber-red-neon flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        <strong className="text-cyber-red-neon">IMPORTANT DISCLAIMER:</strong> This tool provides automated security analysis based on on-chain data and is not financial advice.
                        Always conduct your own research (DYOR) before making any investment decisions.
                        VALIDEX is not responsible for any financial losses incurred from token investments.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">
                © 2026 VALIDEX. Built with 💙 for the Solana community.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
