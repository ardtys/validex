'use client'

import React from 'react'
import { Shield, Lock, AlertTriangle, Users, Zap, Code, Eye, Database, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react'
import GlassNav from '@/components/GlassNav'
import Terminal from '@/components/Terminal'

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-cyber-dark-blue">
      <GlassNav />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyber-cyan/30 mb-6">
            <Activity className="w-4 h-4 text-cyber-cyan-neon" />
            <span className="text-sm font-mono text-gray-300">15+ Security Checks</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">deep dive into</span><br />
            <span className="text-gradient glow-text">every security risk</span>
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            we don't just scan - we analyze 15+ critical security vectors to give you a complete picture of token safety. here's exactly what we check.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto space-y-20">

          {/* Feature 1 - Mint Authority */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-mono text-red-300">Critical Check</span>
              </div>

              <h2 className="text-3xl font-bold text-white">Mint Authority Detection</h2>

              <p className="text-gray-300 leading-relaxed">
                the #1 rug pull method. if devs can mint unlimited tokens, they can dump on you anytime. we check if mint authority is revoked or still active.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyber-cyan-neon mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-mono text-sm mb-1">Authority Revoked</p>
                    <p className="text-gray-400 text-sm">✅ Safe - no one can mint new tokens</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-mono text-sm mb-1">Authority Active</p>
                    <p className="text-gray-400 text-sm">🚨 Risk - devs can mint anytime</p>
                  </div>
                </div>
              </div>
            </div>

            <Terminal title="mint-check.sh">
              <div className="space-y-2 text-sm">
                <p className="text-cyber-cyan-light">// checking mint authority...</p>
                <p className="text-gray-300">$ getMint(tokenAddress)</p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-400">→ fetching on-chain data...</p>
                  <p className="text-gray-400">→ parsing mint account...</p>
                  <p className="text-gray-400">→ analyzing authority...</p>
                </div>
                <div className="mt-3 p-3 rounded bg-red-500/10 border border-red-500/30">
                  <p className="text-red-300 font-bold">⚠ MINT AUTHORITY DETECTED</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Authority: 7xKX...abc (active)
                  </p>
                </div>
              </div>
            </Terminal>
          </div>

          {/* Feature 2 - Freeze Authority */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Terminal title="freeze-check.sh">
              <div className="space-y-2 text-sm">
                <p className="text-cyber-cyan-light">// checking freeze authority...</p>
                <p className="text-gray-300">$ checkFreezeAuthority()</p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-400">→ scanning token accounts...</p>
                  <p className="text-gray-400">→ verifying freeze status...</p>
                </div>
                <div className="mt-3 p-3 rounded bg-cyber-cyan/10 border border-cyber-cyan/30">
                  <p className="text-cyber-cyan-neon font-bold">✓ FREEZE AUTHORITY REVOKED</p>
                  <p className="text-gray-400 text-xs mt-1">
                    No one can freeze your tokens
                  </p>
                </div>
              </div>
            </Terminal>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <Lock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-mono text-yellow-300">High Priority</span>
              </div>

              <h2 className="text-3xl font-bold text-white">Freeze Authority Check</h2>

              <p className="text-gray-300 leading-relaxed">
                can devs freeze your tokens so you can't sell? this is a red flag. we verify if freeze authority is properly revoked.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyber-cyan-neon mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-mono text-sm mb-1">Properly Revoked</p>
                    <p className="text-gray-400 text-sm">✅ You can always sell</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-mono text-sm mb-1">Still Active</p>
                    <p className="text-gray-400 text-sm">🚨 Devs can lock your tokens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Liquidity Analysis */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30">
                <Database className="w-5 h-5 text-cyber-cyan-neon" />
                <span className="text-sm font-mono text-cyber-cyan-light">Core Feature</span>
              </div>

              <h2 className="text-3xl font-bold text-white">Liquidity Pool Analysis</h2>

              <p className="text-gray-300 leading-relaxed">
                is there enough liquidity? is it locked? we analyze LP size, lock status, and whether devs can rug the pool.
              </p>

              <div className="space-y-4">
                <div className="glass-dark p-4 rounded-lg border border-cyber-cyan/20">
                  <p className="text-white font-mono text-sm mb-2">We Check:</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyber-cyan-neon" />
                      Total liquidity (SOL + Token)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyber-cyan-neon" />
                      LP token burn status
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyber-cyan-neon" />
                      Lock period and expiry
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyber-cyan-neon" />
                      % of supply in liquidity
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Terminal title="liquidity-scan.sh">
              <div className="space-y-2 text-sm">
                <p className="text-cyber-cyan-light">// analyzing liquidity pool...</p>
                <p className="text-gray-300">$ analyzeLiquidity(poolAddress)</p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-400">→ fetching pool data...</p>
                  <p className="text-gray-400">→ checking LP tokens...</p>
                  <p className="text-gray-400">→ verifying locks...</p>
                </div>
                <div className="mt-3 p-3 rounded bg-cyber-black/50 border border-cyber-cyan/20">
                  <p className="text-white font-mono mb-2">Results:</p>
                  <p className="text-gray-400 text-xs">Total LP: 45.2 SOL (~$5,430)</p>
                  <p className="text-gray-400 text-xs">LP Burned: 100% 🔥</p>
                  <p className="text-gray-400 text-xs">Lock Status: Permanent ✓</p>
                  <p className="text-cyber-cyan-neon text-xs mt-2">→ Liquidity is SAFE</p>
                </div>
              </div>
            </Terminal>
          </div>

          {/* Feature 4 - Holder Distribution */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <Terminal title="holder-analysis.sh">
              <div className="space-y-2 text-sm">
                <p className="text-cyber-cyan-light">// analyzing top holders...</p>
                <p className="text-gray-300">$ getTopHolders(20)</p>
                <div className="mt-3 space-y-1">
                  <p className="text-gray-400">→ fetching largest accounts...</p>
                  <p className="text-gray-400">→ calculating distribution...</p>
                  <p className="text-gray-400">→ detecting clusters...</p>
                </div>
                <div className="mt-3 p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-yellow-300 font-bold">⚠ CONCENTRATION DETECTED</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Top 10 holders: 67% of supply
                  </p>
                  <p className="text-gray-400 text-xs">
                    Possible insider control
                  </p>
                </div>
              </div>
            </Terminal>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30">
                <Users className="w-5 h-5 text-cyber-cyan-neon" />
                <span className="text-sm font-mono text-cyber-cyan-light">Smart Detection</span>
              </div>

              <h2 className="text-3xl font-bold text-white">Holder Distribution</h2>

              <p className="text-gray-300 leading-relaxed">
                do top wallets own everything? are they controlled by same person? we analyze holder concentration and detect suspicious clustering.
              </p>

              <div className="space-y-3">
                <div className="glass-dark p-4 rounded-lg border border-cyber-cyan/20">
                  <p className="text-white font-mono text-sm mb-3">Red Flags:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400">Top 10 holders &gt; 50% supply</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400">Multiple wallets same funding source</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-400">Sudden large transfers pre-launch</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* All Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 font-mono">
            <span className="text-gray-400">//</span> <span className="text-white">complete feature list</span>
          </h2>
          <p className="text-gray-400 mb-12">everything we check, automatically.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Mint Authority', desc: 'Can devs mint unlimited tokens?' },
              { icon: Lock, title: 'Freeze Authority', desc: 'Can devs freeze your wallet?' },
              { icon: Database, title: 'Liquidity Status', desc: 'Is LP locked or removable?' },
              { icon: Users, title: 'Holder Distribution', desc: 'Who owns the supply?' },
              { icon: TrendingUp, title: 'Supply Analysis', desc: 'Total supply and circulation' },
              { icon: Code, title: 'Contract Verification', desc: 'Is it verified on-chain?' },
              { icon: Eye, title: 'Transfer Tax', desc: 'Hidden buy/sell taxes?' },
              { icon: Activity, title: 'Trading Activity', desc: 'Volume and transaction count' },
              { icon: Zap, title: 'Price Impact', desc: 'Slippage on buys/sells' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="glass-dark p-6 rounded-lg border border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-all"
              >
                <feature.icon className="w-8 h-8 text-cyber-cyan-neon mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 font-mono">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 font-mono">
            <span className="text-white">ready to scan?</span>
          </h2>
          <p className="text-gray-400 mb-8">all these checks run automatically in seconds.</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 hover:border-cyber-cyan rounded-lg text-cyber-cyan-neon font-mono transition-all duration-200 hover:shadow-neon-cyan"
          >
            scan a token →
          </a>
        </div>
      </section>
    </main>
  )
}
