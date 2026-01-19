'use client'

import React from 'react'
import { Shield, Check, X, AlertTriangle } from 'lucide-react'

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

interface AuditResultCardProps {
  auditResult?: AuditResult
}

export default function AuditResultCard({ auditResult }: AuditResultCardProps) {
  // Default example data if no auditResult provided
  const defaultData: AuditResult = {
    tokenInfo: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      totalSupply: '1000000000',
      metadataUri: '',
      imageUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      createdAt: '2021-01-01T00:00:00.000Z'
    },
    authorityStatus: {
      mintAuthority: { active: false, address: null },
      freezeAuthority: { active: false, address: null }
    },
    holderStats: {
      totalHolders: 15234,
      topHolders: [
        { address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', balance: '45000000.000000', percentage: 4.5 },
        { address: '36gYye6ENmJfYH3IVzhTU8FnP3WaMLwZ2TCH2xmLdvY8', balance: '32000000.000000', percentage: 3.2 },
        { address: 'HcXLCJKEXFwJk6ixJuiPMxwE3G8WjF2S7mLp6vQGXjvE', balance: '28000000.000000', percentage: 2.8 },
        { address: 'C5vMdPJGYGGvVANbVpbYWvpjqGLSL5X8YhpxFTdNvNWw', balance: '21000000.000000', percentage: 2.1 },
        { address: 'BYePaYfG2wWyFSX4BjvQrqwkJVNqHRXSMfZTWLfX3mZm', balance: '18000000.000000', percentage: 1.8 }
      ],
      top10Concentration: 18.7
    },
    scoreBreakdown: {
      authority: { score: 50, maxScore: 50, status: 'Good' },
      holders: { score: 25, maxScore: 25, status: 'Good Distribution' },
      metadata: { score: 10, maxScore: 10, status: 'Immutable' },
      liquidity: { score: 15, maxScore: 15, status: 'Good' },
      overall: { score: 100, maxScore: 100, status: 'Safe' }
    },
    developerInfo: {
      address: 'CirclePay8ufWuM2YRgpfcPTvDWPVtPHEjqHNzpM5h',
      totalTokensCreated: 3,
      previousTokens: [
        { address: 'EPjF...Dt1v', name: 'USD Coin', symbol: 'USDC', createdAt: '2021-01-01', isRugged: false },
        { address: '4zMM...7cQ8', name: 'Euro Coin', symbol: 'EURC', createdAt: '2022-06-15', isRugged: false }
      ],
      rugPullHistory: 0,
      reputation: 'Trusted'
    },
    marketInfo: {
      tradingPairs: [
        { dex: 'Raydium', pair: 'USDC/SOL', liquidity: 12500000 },
        { dex: 'Orca', pair: 'USDC/USDT', liquidity: 8900000 }
      ],
      ecosystem: ['Solana Native', 'DeFi', 'Stablecoin'],
      relatedTokens: ['USDT', 'SOL', 'EURC']
    },
    metadataIsMutable: false,
    riskScore: 95,
    riskLevel: 'Safe',
    warnings: [
      '✅ mint authority revoked',
      '✅ freeze authority revoked',
      '✅ metadata immutable',
      '✅ good holder distribution (18.7% in top 10)'
    ],
    timestamp: new Date().toISOString()
  }

  const data = auditResult || defaultData

  // Determine colors based on risk level
  const getRiskColors = () => {
    switch (data.riskLevel) {
      case 'Safe':
        return {
          border: 'border-cyber-green/50',
          bg: 'bg-cyber-green/20',
          text: 'text-cyber-green-neon',
          glow: 'shadow-glow-green'
        }
      case 'Caution':
        return {
          border: 'border-yellow-500/50',
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          glow: 'shadow-glow-yellow'
        }
      case 'Rug Pull Risk':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          glow: 'shadow-glow-red'
        }
    }
  }

  const colors = getRiskColors()

  // Format timestamp
  const timeAgo = () => {
    const now = new Date()
    const timestamp = new Date(data.timestamp)
    const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  // Truncate address
  const truncateAddress = (addr: string) => {
    if (addr.length <= 12) return addr
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }
  return (
    <div className={`max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-cyber-darker to-cyber-dark border-2 ${colors.border} ${colors.glow} animate-slide-up`}>
      {/* Token Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            {/* Token Image */}
            <div className="relative">
              {data.tokenInfo.imageUri ? (
                <img
                  src={data.tokenInfo.imageUri}
                  alt={data.tokenInfo.symbol}
                  className="w-16 h-16 rounded-full border-2 border-cyber-cyan/30"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling
                    if (fallback) (fallback as HTMLElement).style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-cyber-cyan via-cyber-blue to-cyber-purple flex items-center justify-center ${data.tokenInfo.imageUri ? 'hidden' : 'flex'}`}>
                <Shield className="text-white" size={28} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{data.tokenInfo.name}</h3>
              <p className="text-gray-400 text-sm font-mono">{data.tokenInfo.symbol}</p>
              <p className="text-xs text-gray-600 font-mono mt-1">
                {truncateAddress(data.tokenInfo.address)}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Score Badge */}
        <div className="text-right">
          <div className={`inline-block px-6 py-3 rounded-xl ${colors.bg} border ${colors.border}`}>
            <div className={`text-3xl font-bold ${colors.text}`}>{data.riskScore}/100</div>
            <div className={`text-xs ${colors.text} mt-1`}>{data.riskLevel.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-cyber-black/50 border border-cyber-cyan/20">
          <p className="text-xs text-gray-500 font-mono mb-1">total supply</p>
          <p className="text-white font-mono font-semibold">{parseFloat(data.tokenInfo.totalSupply).toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-cyber-black/50 border border-cyber-cyan/20">
          <p className="text-xs text-gray-500 font-mono mb-1">decimals</p>
          <p className="text-white font-mono font-semibold">{data.tokenInfo.decimals}</p>
        </div>
        {data.holderStats && (
          <div className="p-3 rounded-lg bg-cyber-black/50 border border-cyber-cyan/20">
            <p className="text-xs text-gray-500 font-mono mb-1">total holders</p>
            <p className="text-white font-mono font-semibold">{data.holderStats.totalHolders.toLocaleString()}</p>
          </div>
        )}
        {data.tokenInfo.createdAt && (
          <div className="p-3 rounded-lg bg-cyber-black/50 border border-cyber-cyan/20">
            <p className="text-xs text-gray-500 font-mono mb-1">created</p>
            <p className="text-white font-mono font-semibold text-xs">{new Date(data.tokenInfo.createdAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent mb-6" />

      {/* Warnings */}
      <div className="space-y-3">
        {data.warnings.map((warning, index) => {
          const isGood = warning.startsWith('✅')
          const isBad = warning.startsWith('⚠️')

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg bg-cyber-black/50 border ${
                isGood ? 'border-cyber-green/30' : isBad ? 'border-yellow-500/30' : 'border-red-500/30'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isGood ? 'bg-cyber-green/20' : isBad ? 'bg-yellow-500/20' : 'bg-red-500/20'
              }`}>
                {isGood ? (
                  <Check className="text-cyber-green-neon" size={20} />
                ) : isBad ? (
                  <AlertTriangle className="text-yellow-400" size={20} />
                ) : (
                  <X className="text-red-400" size={20} />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-mono ${
                  isGood ? 'text-gray-300' : isBad ? 'text-yellow-200' : 'text-red-200'
                }`}>
                  {warning.replace('✅ ', '').replace('⚠️ ', '')}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Score Breakdown Section */}
      {data.scoreBreakdown && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent my-6" />

          <div className="space-y-4">
            <h4 className="text-sm font-mono text-gray-400">detailed score breakdown</h4>

            <div className="space-y-3">
              {/* Authority Score */}
              <div className="p-4 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">authority</span>
                  <span className="text-sm font-mono text-white">
                    {data.scoreBreakdown.authority.score}/{data.scoreBreakdown.authority.maxScore}
                  </span>
                </div>
                <div className="w-full bg-cyber-black/50 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-blue"
                    style={{ width: `${(data.scoreBreakdown.authority.score / data.scoreBreakdown.authority.maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500">{data.scoreBreakdown.authority.status}</span>
              </div>

              {/* Holders Score */}
              <div className="p-4 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">holder distribution</span>
                  <span className="text-sm font-mono text-white">
                    {data.scoreBreakdown.holders.score}/{data.scoreBreakdown.holders.maxScore}
                  </span>
                </div>
                <div className="w-full bg-cyber-black/50 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-blue"
                    style={{ width: `${(data.scoreBreakdown.holders.score / data.scoreBreakdown.holders.maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500">{data.scoreBreakdown.holders.status}</span>
              </div>

              {/* Metadata Score */}
              <div className="p-4 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">metadata</span>
                  <span className="text-sm font-mono text-white">
                    {data.scoreBreakdown.metadata.score}/{data.scoreBreakdown.metadata.maxScore}
                  </span>
                </div>
                <div className="w-full bg-cyber-black/50 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-blue"
                    style={{ width: `${(data.scoreBreakdown.metadata.score / data.scoreBreakdown.metadata.maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500">{data.scoreBreakdown.metadata.status}</span>
              </div>

              {/* Liquidity Score */}
              <div className="p-4 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">liquidity</span>
                  <span className="text-sm font-mono text-white">
                    {data.scoreBreakdown.liquidity.score}/{data.scoreBreakdown.liquidity.maxScore}
                  </span>
                </div>
                <div className="w-full bg-cyber-black/50 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-blue"
                    style={{ width: `${(data.scoreBreakdown.liquidity.score / data.scoreBreakdown.liquidity.maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500">{data.scoreBreakdown.liquidity.status}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Holders Section */}
      {data.holderStats && data.holderStats.topHolders.length > 0 && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-mono text-gray-400">top holders</h4>
              <span className="text-xs font-mono text-gray-500">
                top 10 own {data.holderStats.top10Concentration.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              {data.holderStats.topHolders.slice(0, 5).map((holder, index) => (
                <div
                  key={holder.address}
                  className="flex items-center justify-between p-3 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10 hover:border-cyber-cyan/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-600 w-6">#{index + 1}</span>
                    <span className="text-xs font-mono text-gray-400">
                      {truncateAddress(holder.address)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-white">{parseFloat(holder.balance).toLocaleString()} {data.tokenInfo.symbol}</p>
                    <p className="text-xs font-mono text-gray-500">{holder.percentage.toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Developer Info Section */}
      {data.developerInfo && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent my-6" />

          <div className="space-y-4">
            <h4 className="text-sm font-mono text-gray-400">developer analysis</h4>

            <div className="p-4 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">creator address</span>
                  <span className="text-xs font-mono text-white">{truncateAddress(data.developerInfo.address)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">tokens created</span>
                  <span className="text-xs font-mono text-white">{data.developerInfo.totalTokensCreated}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">rug pull history</span>
                  <span className={`text-xs font-mono ${data.developerInfo.rugPullHistory > 0 ? 'text-red-400' : 'text-cyber-green-neon'}`}>
                    {data.developerInfo.rugPullHistory} tokens
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-500">reputation</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    data.developerInfo.reputation === 'Trusted' ? 'bg-cyber-green/20 text-cyber-green-neon' :
                    data.developerInfo.reputation === 'Neutral' ? 'bg-gray-500/20 text-gray-300' :
                    data.developerInfo.reputation === 'Suspicious' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {data.developerInfo.reputation}
                  </span>
                </div>
              </div>

              {data.developerInfo.previousTokens.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cyber-cyan/10">
                  <p className="text-xs font-mono text-gray-500 mb-2">previous tokens:</p>
                  <div className="space-y-2">
                    {data.developerInfo.previousTokens.slice(0, 3).map((token) => (
                      <div key={token.address} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-400">{token.symbol}</span>
                        <span className={token.isRugged ? 'text-red-400' : 'text-gray-500'}>
                          {token.isRugged ? '⚠️ rugged' : '✅ active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Market Info Section */}
      {data.marketInfo && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent my-6" />

          <div className="space-y-4">
            <h4 className="text-sm font-mono text-gray-400">market & ecosystem</h4>

            <div className="p-4 rounded-lg bg-cyber-black/30 border border-cyber-cyan/10">
              {data.marketInfo.ecosystem.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-mono text-gray-500 mb-2">ecosystem:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.marketInfo.ecosystem.map((eco, index) => (
                      <span key={index} className="text-xs font-mono px-2 py-1 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
                        {eco}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.marketInfo.tradingPairs.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-gray-500 mb-2">trading pairs:</p>
                  <div className="space-y-2">
                    {data.marketInfo.tradingPairs.map((pair, index) => (
                      <div key={index} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-400">{pair.dex}</span>
                        <span className="text-white">{pair.pair}</span>
                        {pair.liquidity && (
                          <span className="text-gray-500">${pair.liquidity.toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.marketInfo.ecosystem.length === 0 && data.marketInfo.tradingPairs.length === 0 && (
                <p className="text-xs font-mono text-gray-500 text-center py-2">no market data available</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer Badge */}
      <div className="mt-6 pt-6 border-t border-cyber-purple/20 text-center">
        <p className="text-sm text-gray-400">
          scanned <span className={`${colors.text} font-semibold`}>{timeAgo()}</span>
        </p>
      </div>
    </div>
  )
}
