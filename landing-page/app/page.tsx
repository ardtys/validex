'use client'

import React, { useState } from 'react'
import { Shield, Zap, Droplets, Lock, TrendingUp, Users, CheckCircle, AlertTriangle, Sparkles, Loader2 } from 'lucide-react'
import GlowButton from '@/components/GlowButton'
import FeatureCard from '@/components/FeatureCard'
import AuditResultCard from '@/components/AuditResultCard'
import GlassNav from '@/components/GlassNav'
import GlassCard from '@/components/GlassCard'
import Logo from '@/components/Logo'

type RiskLevel = 'Safe' | 'Caution' | 'Rug Pull Risk'

interface AuthorityStatus {
  mintAuthority: {
    active: boolean
    address: string | null
  }
  freezeAuthority: {
    active: boolean
    address: string | null
  }
}

interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  metadataUri: string
  imageUri?: string
  createdAt?: string
}

interface TopHolder {
  address: string
  balance: string
  percentage: number
}

interface LiquidityInfo {
  hasPool: boolean
  poolAddress?: string
  liquidityUSD?: number
  locked: boolean
  lockDuration?: string
}

interface HolderStats {
  totalHolders: number
  topHolders: TopHolder[]
  top10Concentration: number
}

interface ScoreBreakdown {
  authority: { score: number; maxScore: number; status: string }
  holders: { score: number; maxScore: number; status: string }
  metadata: { score: number; maxScore: number; status: string }
  liquidity: { score: number; maxScore: number; status: string }
  overall: { score: number; maxScore: number; status: string }
}

interface CreatorToken {
  address: string
  name: string
  symbol: string
  createdAt: string
  isRugged?: boolean
}

interface DeveloperInfo {
  address: string
  totalTokensCreated: number
  previousTokens: CreatorToken[]
  rugPullHistory: number
  reputation: 'Trusted' | 'Neutral' | 'Suspicious' | 'Scammer'
}

interface MarketInfo {
  tradingPairs: Array<{
    dex: string
    pair: string
    liquidity?: number
  }>
  ecosystem: string[]
  relatedTokens: string[]
}

interface AuditResult {
  tokenInfo: TokenInfo
  authorityStatus: AuthorityStatus
  holderStats?: HolderStats
  liquidityInfo?: LiquidityInfo
  scoreBreakdown?: ScoreBreakdown
  developerInfo?: DeveloperInfo
  marketInfo?: MarketInfo
  metadataIsMutable: boolean
  riskScore: number
  riskLevel: RiskLevel
  warnings: string[]
  timestamp: string
}

export default function Home() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAudit = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address')
      return
    }

    setIsLoading(true)
    setError(null)
    setAuditResult(null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddress: tokenAddress.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to audit token')
      }

      setAuditResult(data)

      // Scroll to results
      setTimeout(() => {
        document.getElementById('audit-results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    } catch (err: any) {
      setError(err.message || 'Failed to audit token. Please try again.')
      console.error('Audit error:', err)
    } finally {
      setIsLoading(false)
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
        <section className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Text */}
              <div className="space-y-6">
                {/* Small badge */}
                <div className="inline-flex items-center gap-2 text-sm text-gray-400 font-mono">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>live on solana</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="text-white">stop getting</span>
                  <br />
                  <span className="text-gradient glow-text">rugged</span>
                  <span className="text-white">.</span>
                </h1>

                {/* Subtext */}
                <div className="space-y-4">
                  <p className="text-xl text-gray-300 leading-relaxed">
                    scan any solana token before you buy. check if it's safe or a scam.
                  </p>
                  <p className="text-base text-gray-400 leading-relaxed">
                    checks mint authority, liquidity locks, holder distribution, and honeypot patterns.
                    built because people keep losing money to obvious rug pulls.
                  </p>
                </div>

                {/* Quick info */}
                <div className="flex items-center gap-6 text-sm text-gray-500 font-mono">
                  <span>• free to use</span>
                  <span>• no signup</span>
                  <span>• instant results</span>
                </div>
              </div>

              {/* Right - Input */}
              <div className="space-y-4">
                <GlassCard variant="dark" className="p-6">
                  <label className="block text-sm text-gray-400 mb-3 font-mono">
                    paste token address
                  </label>
                  <input
                    type="text"
                    placeholder="EPjFWdd5Aufq..."
                    value={tokenAddress}
                    onChange={(e) => {
                      setTokenAddress(e.target.value)
                      setError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleAudit()
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-cyber-black/50 rounded-lg border border-cyber-cyan/20 focus:border-cyber-cyan focus:outline-none text-white placeholder-gray-600 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  {error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-400 font-mono">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleAudit}
                    disabled={isLoading}
                    className="mt-4 w-full px-6 py-3 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 hover:border-cyber-cyan rounded-lg text-cyber-cyan-neon font-mono font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>scanning...</span>
                      </>
                    ) : (
                      <span>scan token →</span>
                    )}
                  </button>
                </GlassCard>

                {/* Example with token image */}
                <div className="flex items-center gap-3 p-3 rounded-lg glass">
                  <img
                    src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
                    alt="USDC"
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-mono">try example:</p>
                    <p className="text-xs text-gray-400 font-mono break-all">
                      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 font-mono">
                <span className="text-gray-500">//</span> what we check
              </h2>
              <p className="text-lg text-gray-400">
                the important stuff that matters. no fluff.
              </p>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={AlertTriangle}
              title="mint authority"
              description="can devs print unlimited tokens? we check if mint authority is revoked. this is #1 rug pull method."
            />
            <FeatureCard
              icon={Lock}
              title="freeze authority"
              description="can they freeze your tokens so you can't sell? common trap. we verify it's disabled."
            />
            <FeatureCard
              icon={Droplets}
              title="liquidity check"
              description="is LP locked or burned? how much sol in pool? if not locked, devs can drain everything."
            />
            <FeatureCard
              icon={TrendingUp}
              title="holder distribution"
              description="do top 10 wallets own 90%? we check concentration. also trace if wallets are funded by same address."
            />
            <FeatureCard
              icon={Users}
              title="honeypot test"
              description="can you actually sell after buying? some tokens let you buy but not sell. we simulate both."
            />
            <FeatureCard
              icon={Zap}
              title="contract code"
              description="scans for hidden transfer taxes, blacklist functions, and sketchy code patterns."
            />
          </div>
          </div>
        </section>

        {/* Audit Results Section */}
        {auditResult && (
          <section id="audit-results" className="container mx-auto px-6 py-20">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 font-mono">
                  <span className="text-gray-500">//</span> scan results
                </h2>
                <p className="text-lg text-gray-400">
                  here's what we found
                </p>
              </div>

              <AuditResultCard auditResult={auditResult} />
            </div>
          </section>
        )}

        {/* Demo Section - only show if no results */}
        {!auditResult && (
          <section id="demo" className="container mx-auto px-6 py-20">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 font-mono">
                  <span className="text-gray-500">//</span> example scan
                </h2>
                <p className="text-lg text-gray-400">
                  this is what you get after scanning
                </p>
              </div>

              <AuditResultCard />
            </div>
          </section>
        )}

        {/* Why Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <GlassCard variant="dark" className="p-8 md:p-12">
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold font-mono">
                  why i built this
                </h2>

                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    tired of seeing people lose money to obvious scams. spent too much time manually checking contracts and helping friends avoid rug pulls.
                  </p>
                  <p>
                    solana moves fast. by the time you manually check everything, token already dumped. needed something instant.
                  </p>
                  <p>
                    this tool checks the most common red flags in seconds. not perfect, but catches 90% of scams. free to use, no signup, no tracking.
                  </p>
                  <p className="text-sm text-gray-500 font-mono pt-4 border-t border-gray-700">
                    — not financial advice. always dyor. but this helps.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-mono">
              try it. it's free.
            </h2>
            <p className="text-lg text-gray-400">
              no signup, no bs. just paste and scan.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 hover:border-cyber-cyan rounded-lg text-cyber-cyan-neon font-mono font-semibold transition-all duration-200"
            >
              <span>scan a token</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-cyber-cyan/10 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                {/* Logo & tagline */}
                <div className="flex items-center gap-4">
                  <a href="/" className="hover:opacity-80 transition-opacity">
                    <Logo size="small" withGlow={false} />
                  </a>
                  <div className="h-8 w-px bg-cyber-cyan/20" />
                  <span className="text-sm text-gray-500 font-mono">
                    built by someone who got rugged
                  </span>
                </div>

                {/* Links */}
                <div className="flex items-center gap-6 text-sm text-gray-500 font-mono">
                  <a href="#" className="hover:text-cyber-cyan-neon transition-colors">twitter</a>
                  <a href="#" className="hover:text-cyber-cyan-neon transition-colors">github</a>
                  <a href="#" className="hover:text-cyber-cyan-neon transition-colors">docs</a>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="pt-8 border-t border-cyber-cyan/10">
                <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                  <strong className="text-red-400">disclaimer:</strong> this tool checks on-chain data. not financial advice. scammers evolve, no tool is 100%. always dyor. if it looks too good to be true, it probably is. validex not responsible for your losses.
                </p>
                <p className="text-xs text-gray-700 mt-4 font-mono">
                  © 2024 validex · made for solana degens
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
