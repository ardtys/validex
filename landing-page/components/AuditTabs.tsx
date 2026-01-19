'use client'

import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, User, Sparkles, Share2 } from 'lucide-react'

interface AuditData {
  tokenInfo: {
    name: string
    symbol: string
    address: string
  }
  riskScore: number
  riskLevel: string
  authorityStatus: {
    mintAuthority: { active: boolean }
    freezeAuthority: { active: boolean }
  }
  warnings: string[]
}

interface DeveloperData {
  deployerAddress: string
  tokensCreatedCount: number
  ruggedCount: number
  winRate: number
  riskLevel: string
  pastTokens: Array<{
    tokenAddress: string
    status: string
    ageInDays: number
  }>
}

interface AuditTabsProps {
  auditData: AuditData
  developerData?: DeveloperData
  loading?: boolean
}

type TabType = 'security' | 'detective' | 'aura'

export default function AuditTabs({ auditData, developerData, loading = false }: AuditTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('security')
  const [auraText, setAuraText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Typewriter effect untuk Aura's text
  useEffect(() => {
    if (activeTab === 'aura') {
      setIsTyping(true)
      const fullText = generateAuraRoast(auditData, developerData)
      let currentIndex = 0

      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setAuraText(fullText.substring(0, currentIndex))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(typingInterval)
        }
      }, 30) // Speed of typing

      return () => clearInterval(typingInterval)
    }
  }, [activeTab, auditData, developerData])

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-cyber-green-neon'
    if (riskScore >= 50) return 'text-yellow-400'
    return 'text-cyber-red-neon'
  }

  const getShieldColor = (riskScore: number) => {
    if (riskScore >= 80) return 'border-cyber-green shadow-glow-green'
    if (riskScore >= 50) return 'border-yellow-400 shadow-yellow-400/50'
    return 'border-cyber-red-neon shadow-glow-red'
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Tab Headers */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-cyber-purple/30 pb-2">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-300 ${
            activeTab === 'security'
              ? 'bg-cyber-purple text-white shadow-neon-purple'
              : 'bg-cyber-darker text-gray-400 hover:text-white hover:bg-cyber-purple/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={20} />
            Security
          </div>
        </button>

        <button
          onClick={() => setActiveTab('detective')}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-300 ${
            activeTab === 'detective'
              ? 'bg-cyber-purple text-white shadow-neon-purple'
              : 'bg-cyber-darker text-gray-400 hover:text-white hover:bg-cyber-purple/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={20} />
            The Detective
          </div>
        </button>

        <button
          onClick={() => setActiveTab('aura')}
          className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-300 ${
            activeTab === 'aura'
              ? 'bg-cyber-purple text-white shadow-neon-purple'
              : 'bg-cyber-darker text-gray-400 hover:text-white hover:bg-cyber-purple/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            Aura's Vibe Check
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* Tab 1: Security */}
        {activeTab === 'security' && (
          <div className="animate-slide-up">
            <SecurityTab
              auditData={auditData}
              getRiskColor={getRiskColor}
              getShieldColor={getShieldColor}
            />
          </div>
        )}

        {/* Tab 2: The Detective */}
        {activeTab === 'detective' && (
          <div className="animate-slide-up">
            {developerData ? (
              <DetectiveTab developerData={developerData} loading={loading} />
            ) : (
              <div className="text-center py-20">
                <User className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400">Developer data not available</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Aura's Vibe Check */}
        {activeTab === 'aura' && (
          <div className="animate-slide-up">
            <AuraTab auraText={auraText} isTyping={isTyping} auditData={auditData} />
          </div>
        )}
      </div>
    </div>
  )
}

// Security Tab Component
function SecurityTab({
  auditData,
  getRiskColor,
  getShieldColor,
}: {
  auditData: AuditData
  getRiskColor: (score: number) => string
  getShieldColor: (score: number) => string
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left: Big Shield Icon */}
      <div className="flex flex-col items-center justify-center p-8 bg-cyber-darker rounded-2xl border-2 border-cyber-purple/30">
        <div
          className={`w-48 h-48 rounded-full border-8 ${getShieldColor(
            auditData.riskScore
          )} flex items-center justify-center mb-6 animate-glow`}
        >
          <Shield size={96} className={getRiskColor(auditData.riskScore)} />
        </div>

        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${getRiskColor(auditData.riskScore)}`}>
            {auditData.riskScore}/100
          </div>
          <div className="text-2xl font-semibold text-white mb-4">{auditData.riskLevel}</div>
          <div className="text-gray-400">{auditData.tokenInfo.name}</div>
        </div>
      </div>

      {/* Right: Technical Details */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4">Security Checks</h3>

        {auditData.warnings.map((warning, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border ${
              warning.includes('✅')
                ? 'bg-cyber-green/10 border-cyber-green/30'
                : 'bg-cyber-red/10 border-cyber-red/30'
            }`}
          >
            <p className="text-sm text-white leading-relaxed">{warning}</p>
          </div>
        ))}

        {/* Authority Status Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-cyber-black border border-cyber-purple/20">
            <div className="text-sm text-gray-400 mb-1">Mint Authority</div>
            <div
              className={`font-bold ${
                auditData.authorityStatus.mintAuthority.active
                  ? 'text-cyber-red-neon'
                  : 'text-cyber-green-neon'
              }`}
            >
              {auditData.authorityStatus.mintAuthority.active ? 'ACTIVE ⚠️' : 'REVOKED ✓'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-cyber-black border border-cyber-purple/20">
            <div className="text-sm text-gray-400 mb-1">Freeze Authority</div>
            <div
              className={`font-bold ${
                auditData.authorityStatus.freezeAuthority.active
                  ? 'text-cyber-red-neon'
                  : 'text-cyber-green-neon'
              }`}
            >
              {auditData.authorityStatus.freezeAuthority.active ? 'ACTIVE ⚠️' : 'REVOKED ✓'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Detective Tab Component
function DetectiveTab({
  developerData,
  loading,
}: {
  developerData: DeveloperData
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyber-purple border-t-transparent mx-auto mb-4" />
        <p className="text-gray-400">Investigating developer history...</p>
      </div>
    )
  }

  const getRiskLevelColor = (riskLevel: string) => {
    if (riskLevel === 'Serial Scammer') return 'text-cyber-red-neon'
    if (riskLevel === 'High Risk') return 'text-red-400'
    if (riskLevel === 'Medium Risk') return 'text-yellow-400'
    if (riskLevel === 'Clean') return 'text-cyber-green-neon'
    return 'text-gray-400'
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Left: Developer Profile Card */}
      <div className="md:col-span-1">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-darker to-cyber-dark border-2 border-cyber-purple/30 sticky top-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-green flex items-center justify-center mx-auto mb-4">
            <User size={48} className="text-white" />
          </div>

          <div className="text-center mb-6">
            <div className="text-xs text-gray-500 mb-1">Developer Wallet</div>
            <div className="text-sm font-mono text-gray-300 break-all">
              {developerData.deployerAddress.substring(0, 8)}...
              {developerData.deployerAddress.substring(developerData.deployerAddress.length - 6)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Risk Level</div>
              <div className={`text-xl font-bold ${getRiskLevelColor(developerData.riskLevel)}`}>
                {developerData.riskLevel}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">
                  {developerData.tokensCreatedCount}
                </div>
                <div className="text-xs text-gray-400">Tokens Created</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-cyber-red-neon">
                  {developerData.ruggedCount}
                </div>
                <div className="text-xs text-gray-400">Likely Rugged</div>
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-cyber-green-neon">
                {developerData.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Past Projects List */}
      <div className="md:col-span-2">
        <h3 className="text-2xl font-bold text-white mb-4">Past Projects</h3>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {developerData.pastTokens.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No past projects found
            </div>
          ) : (
            developerData.pastTokens.map((token, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                  token.status === 'Likely Rugged'
                    ? 'bg-cyber-red/10 border-cyber-red/50'
                    : token.status === 'Suspicious'
                    ? 'bg-yellow-500/10 border-yellow-500/50'
                    : 'bg-cyber-green/10 border-cyber-green/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-mono text-sm text-gray-300 mb-2">
                      {token.tokenAddress.substring(0, 16)}...
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        {token.status === 'Likely Rugged' ? (
                          <AlertTriangle size={14} className="text-cyber-red-neon" />
                        ) : (
                          <CheckCircle size={14} className="text-cyber-green-neon" />
                        )}
                        <span
                          className={
                            token.status === 'Likely Rugged'
                              ? 'text-cyber-red-neon font-semibold'
                              : 'text-cyber-green-neon'
                          }
                        >
                          {token.status}
                        </span>
                      </div>

                      <div className="text-gray-400">{token.ageInDays} days old</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Aura's Vibe Check Tab Component
function AuraTab({
  auraText,
  isTyping,
  auditData,
}: {
  auraText: string
  isTyping: boolean
  auditData: AuditData
}) {
  const handleShareToTwitter = () => {
    const tweetText = `Just checked ${auditData.tokenInfo.name} on @SolanaGuard!\n\nRisk Score: ${auditData.riskScore}/100\nVerdict: ${auditData.riskLevel}\n\n🛡️ Stay safe in crypto!`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(twitterUrl, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Aura Avatar & Chat Bubble */}
      <div className="flex gap-6 items-start mb-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyber-purple to-cyber-green p-1">
            <div className="w-full h-full rounded-full bg-cyber-black flex items-center justify-center">
              <Sparkles size={40} className="text-cyber-purple-neon" />
            </div>
          </div>
          <div className="text-center mt-2">
            <div className="text-sm font-bold text-gradient">Aura</div>
            <div className="text-xs text-gray-500">AI Analyst</div>
          </div>
        </div>

        {/* Chat Bubble */}
        <div className="flex-1 p-6 rounded-2xl bg-cyber-darker border-2 border-cyber-purple/30 relative">
          <div className="absolute -left-3 top-8 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-cyber-purple/30 border-b-8 border-b-transparent" />

          <div
            className="font-mono text-white leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            {auraText}
            {isTyping && <span className="animate-pulse">▋</span>}
          </div>

          {!isTyping && auraText && (
            <div className="mt-6 pt-6 border-t border-cyber-purple/20">
              <button
                onClick={handleShareToTwitter}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyber-purple to-cyber-green text-white font-semibold hover:shadow-glow-purple transition-all flex items-center gap-2 mx-auto"
              >
                <Share2 size={18} />
                Share to X (Twitter)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-cyber-black/50 border border-cyber-purple/20 text-center">
        <p className="text-xs text-gray-500">
          Aura's analysis is AI-generated and for entertainment purposes. Always DYOR!
        </p>
      </div>
    </div>
  )
}

// Generate Aura's Roast Text
function generateAuraRoast(auditData: AuditData, developerData?: DeveloperData): string {
  const riskScore = auditData.riskScore
  const tokenName = auditData.tokenInfo.name
  const mintActive = auditData.authorityStatus.mintAuthority.active
  const freezeActive = auditData.authorityStatus.freezeAuthority.active

  let roast = `Alright, let's talk about ${tokenName}...\n\n`

  if (riskScore >= 80) {
    roast += `Honestly? This token is looking pretty solid. Risk score of ${riskScore}/100 - that's what I like to see! 🎯\n\n`
    roast += `The devs actually revoked their mint authority (shocking, I know), and the freeze authority is disabled. It's like finding a unicorn in the crypto jungle.\n\n`
    roast += `That said, this is crypto we're talking about. Don't bet your rent money. But if you're gonna ape into something, at least this one passed the vibe check. ✨`
  } else if (riskScore >= 50) {
    roast += `Okay so... ${riskScore}/100. Not terrible, but not great either. It's like getting a C+ in school - you passed, but nobody's proud.\n\n`

    if (mintActive) {
      roast += `The mint authority is still ACTIVE. Translation: devs can print money like the Fed. Red flag much? 🚩\n\n`
    }

    if (developerData && developerData.ruggedCount > 0) {
      roast += `Oh, and fun fact: this developer has ${developerData.ruggedCount} rugged projects in their history. So they've got experience... just not the good kind. 💀\n\n`
    }

    roast += `Look, you could risk it. But when this goes south, don't come crying to me. I warned you. 🤷`
  } else {
    roast += `OH BOY. Where do I even start? Risk score: ${riskScore}/100. That's not just a red flag, that's the ENTIRE circus. 🎪\n\n`

    if (mintActive) {
      roast += `Mint authority? ACTIVE. Meaning devs can literally print infinite tokens and dump on you. It's like playing poker with someone who can shuffle new aces into the deck whenever they want.\n\n`
    }

    if (freezeActive) {
      roast += `Freeze authority is enabled too. So they can literally FREEZE your tokens. You'd have a better chance keeping your money in a sketchy ATM in a dark alley.\n\n`
    }

    if (developerData && developerData.riskLevel === 'Serial Scammer') {
      roast += `And the cherry on top? This developer is literally flagged as a "Serial Scammer". They've rugged ${developerData.ruggedCount} projects before. At this point, it's not even a rugpull - it's their business model. 💸\n\n`
    }

    roast += `My honest advice? RUN. Delete this from your watchlist. Forget it exists. This is financial natural selection waiting to happen.\n\n`
    roast += `But hey, DYOR right? Just don't say I didn't warn you when you're holding a bag of worthless tokens. 🗑️`
  }

  roast += `\n\n- Aura 💜`

  return roast
}
