'use client'

import React, { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Search } from 'lucide-react'
import GlassNav from '@/components/GlassNav'
import Terminal from '@/components/Terminal'

export default function DemoPage() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<any>(null)

  const exampleTokens = [
    {
      name: 'SAFE Token',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      type: 'safe',
      description: 'USDC - mint & freeze revoked, good liquidity'
    },
    {
      name: 'RISKY Token',
      address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      type: 'risky',
      description: 'Example risky token - mint authority active'
    }
  ]

  const handleScan = async (address?: string) => {
    const addrToScan = address || tokenAddress
    if (!addrToScan) return

    setScanning(true)
    setResults(null)

    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock results based on address
    const isUSDC = addrToScan === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

    setResults({
      address: addrToScan,
      checks: [
        {
          name: 'Mint Authority',
          status: isUSDC ? 'safe' : 'danger',
          message: isUSDC
            ? 'Revoked - no one can mint new tokens'
            : 'Active - devs can mint unlimited tokens',
          details: isUSDC ? null : 'Authority: 7xKX...abc (active)'
        },
        {
          name: 'Freeze Authority',
          status: isUSDC ? 'safe' : 'warning',
          message: isUSDC
            ? 'Revoked - your tokens cannot be frozen'
            : 'Active - devs can freeze token accounts',
          details: null
        },
        {
          name: 'Liquidity Pool',
          status: isUSDC ? 'safe' : 'warning',
          message: isUSDC
            ? 'Multiple pools with deep liquidity'
            : 'Low liquidity - only 12.5 SOL',
          details: isUSDC ? null : 'Risk of high slippage'
        },
        {
          name: 'Holder Distribution',
          status: isUSDC ? 'safe' : 'danger',
          message: isUSDC
            ? 'Well distributed across 1M+ holders'
            : 'Top 10 holders own 73% of supply',
          details: isUSDC ? null : 'Possible insider control'
        },
        {
          name: 'Contract Verification',
          status: isUSDC ? 'safe' : 'safe',
          message: 'Verified on-chain',
          details: null
        }
      ],
      riskScore: isUSDC ? 10 : 75,
      recommendation: isUSDC
        ? 'This token appears safe based on all checks'
        : 'HIGH RISK - Multiple red flags detected. Do not ape in.'
    })

    setScanning(false)
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-400'
    if (score < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <main className="min-h-screen bg-cyber-dark-blue">
      <GlassNav />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyber-cyan/30 mb-6">
            <Search className="w-4 h-4 text-cyber-cyan-neon" />
            <span className="text-sm font-mono text-gray-300">Live Demo</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">try it</span><br />
            <span className="text-gradient glow-text">right now</span>
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            paste any solana token address and watch validex scan it in real-time. no signup, no bullshit.
          </p>
        </div>
      </section>

      {/* Scanner */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Terminal title="token-scanner.sh">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <span className="text-cyber-cyan-neon">$</span>
                <div className="flex-1">
                  <p className="text-gray-300 mb-3 font-mono">validex scan</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder="paste token address here..."
                      className="flex-1 bg-cyber-black/50 border border-cyber-cyan/30 rounded px-4 py-2 text-gray-300 font-mono text-sm focus:border-cyber-cyan focus:outline-none focus:ring-1 focus:ring-cyber-cyan"
                      disabled={scanning}
                    />
                    <button
                      onClick={() => handleScan()}
                      disabled={scanning || !tokenAddress}
                      className="px-6 py-2 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 hover:border-cyber-cyan rounded text-cyber-cyan-neon font-mono text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {scanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          scanning...
                        </>
                      ) : (
                        'scan'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {scanning && (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-gray-400">→ fetching token data...</p>
                  <p className="text-gray-400">→ checking mint authority...</p>
                  <p className="text-gray-400">→ analyzing liquidity pools...</p>
                  <p className="text-gray-400">→ scanning top holders...</p>
                  <p className="text-gray-400">→ verifying contract...</p>
                </div>
              )}

              {results && !scanning && (
                <div className="mt-6 space-y-4">
                  {/* Risk Score */}
                  <div className={`p-4 rounded-lg border ${
                    results.riskScore < 30
                      ? 'bg-green-500/10 border-green-500/30'
                      : results.riskScore < 60
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-gray-300">Risk Score</span>
                      <span className={`text-2xl font-bold font-mono ${getRiskColor(results.riskScore)}`}>
                        {results.riskScore}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-mono">{results.recommendation}</p>
                  </div>

                  {/* Checks */}
                  <div className="space-y-3">
                    {results.checks.map((check: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          check.status === 'safe'
                            ? 'bg-cyber-cyan/5 border-cyber-cyan/20'
                            : check.status === 'warning'
                            ? 'bg-yellow-500/5 border-yellow-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {check.status === 'safe' && <CheckCircle className="w-5 h-5 text-cyber-cyan-neon mt-0.5 flex-shrink-0" />}
                          {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />}
                          {check.status === 'danger' && <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />}
                          <div className="flex-1">
                            <p className="text-white font-mono text-sm mb-1">{check.name}</p>
                            <p className="text-gray-400 text-sm">{check.message}</p>
                            {check.details && (
                              <p className="text-gray-500 text-xs mt-1 font-mono">{check.details}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Terminal>
        </div>
      </section>

      {/* Example Tokens */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-3 font-mono">
            <span className="text-gray-400">//</span> <span className="text-white">try these examples</span>
          </h2>
          <p className="text-gray-400 mb-8">click to scan and see the difference between safe and risky tokens.</p>

          <div className="grid md:grid-cols-2 gap-6">
            {exampleTokens.map((token, idx) => (
              <div
                key={idx}
                className="glass-dark p-6 rounded-lg border border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-all cursor-pointer group"
                onClick={() => {
                  setTokenAddress(token.address)
                  handleScan(token.address)
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {token.type === 'safe' ? (
                      <CheckCircle className="w-5 h-5 text-cyber-cyan-neon" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                    <h3 className="text-lg font-bold text-white font-mono">{token.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-mono ${
                    token.type === 'safe'
                      ? 'bg-cyber-cyan/20 text-cyber-cyan-neon'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {token.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{token.description}</p>
                <p className="text-xs text-gray-500 font-mono break-all">{token.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 font-mono">
            <span className="text-gray-400">//</span> <span className="text-white">how it works</span>
          </h2>

          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40">
                  <span className="text-xl font-bold text-cyber-cyan-neon font-mono">1</span>
                </div>
                <h3 className="text-xl font-bold text-white">paste token address</h3>
                <p className="text-gray-400 leading-relaxed">
                  just copy any solana token address from dexscreener, raydium, or anywhere else. we'll handle the rest.
                </p>
              </div>

              <Terminal title="step-1.sh">
                <div className="space-y-2 text-sm">
                  <p className="text-cyber-cyan-light">// validex connects to solana</p>
                  <p className="text-gray-400">→ parsing token address...</p>
                  <p className="text-gray-400">→ fetching on-chain data...</p>
                  <p className="text-cyber-cyan-neon">✓ token found</p>
                </div>
              </Terminal>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <Terminal title="step-2.sh">
                <div className="space-y-2 text-sm">
                  <p className="text-cyber-cyan-light">// running 15+ security checks</p>
                  <p className="text-gray-400">→ mint authority: <span className="text-red-400">detected</span></p>
                  <p className="text-gray-400">→ freeze authority: <span className="text-cyber-cyan-neon">revoked</span></p>
                  <p className="text-gray-400">→ liquidity: <span className="text-yellow-400">low</span></p>
                  <p className="text-gray-400">→ holders: <span className="text-red-400">concentrated</span></p>
                </div>
              </Terminal>

              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40">
                  <span className="text-xl font-bold text-cyber-cyan-neon font-mono">2</span>
                </div>
                <h3 className="text-xl font-bold text-white">deep analysis</h3>
                <p className="text-gray-400 leading-relaxed">
                  we scan mint authority, freeze authority, liquidity pools, holder distribution, and more. all in seconds.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40">
                  <span className="text-xl font-bold text-cyber-cyan-neon font-mono">3</span>
                </div>
                <h3 className="text-xl font-bold text-white">get verdict</h3>
                <p className="text-gray-400 leading-relaxed">
                  we give you a clear risk score and tell you exactly what's wrong. no guessing, no jargon.
                </p>
              </div>

              <Terminal title="step-3.sh">
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
                    <p className="text-red-300 font-bold">RISK SCORE: 75/100</p>
                    <p className="text-gray-400 text-xs mt-2">
                      HIGH RISK - Multiple red flags detected.
                    </p>
                    <p className="text-gray-400 text-xs">
                      Do not ape in.
                    </p>
                  </div>
                </div>
              </Terminal>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 font-mono">
            <span className="text-white">ready to stay safe?</span>
          </h2>
          <p className="text-gray-400 mb-8">scan every token before you buy. it takes 5 seconds.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 hover:border-cyber-cyan rounded-lg text-cyber-cyan-neon font-mono transition-all duration-200 hover:shadow-neon-cyan"
          >
            back to home →
          </a>
        </div>
      </section>
    </main>
  )
}
