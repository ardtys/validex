'use client'

import React, { useState } from 'react'
import { Book, Code, Shield, Zap, Terminal as TerminalIcon, Database, AlertTriangle, CheckCircle } from 'lucide-react'
import GlassNav from '@/components/GlassNav'
import Terminal from '@/components/Terminal'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('quickstart')

  const tabs = [
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'checks', label: 'Security Checks', icon: Shield },
    { id: 'integration', label: 'Integration', icon: Database },
    { id: 'faq', label: 'FAQ', icon: Book },
  ]

  return (
    <main className="min-h-screen bg-cyber-dark-blue">
      <GlassNav />

      {/* Hero */}
      <section className="container mx-auto px-6 pt-32 pb-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyber-cyan/30 mb-6">
            <Book className="w-4 h-4 text-cyber-cyan-neon" />
            <span className="text-sm font-mono text-gray-300">Documentation</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">build with</span><br />
            <span className="text-gradient glow-text">validex</span>
          </h1>

          <p className="text-xl text-gray-300 leading-relaxed">
            everything you need to integrate solana token security scanning into your dapp.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan-neon'
                    : 'glass-dark border border-cyber-cyan/10 text-gray-400 hover:border-cyber-cyan/30 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Quick Start */}
          {activeTab === 'quickstart' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-mono">
                  <span className="text-gray-400">//</span> <span className="text-white">quick start</span>
                </h2>
                <p className="text-gray-400 mb-8">get up and running in under 5 minutes.</p>
              </div>

              {/* Installation */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white font-mono">1. Installation</h3>
                <Terminal title="install.sh">
                  <div className="space-y-2">
                    <p className="text-cyber-cyan-light"># using npm</p>
                    <p className="text-gray-300">npm install @validex/sdk</p>
                    <p className="text-cyber-cyan-light mt-4"># using yarn</p>
                    <p className="text-gray-300">yarn add @validex/sdk</p>
                    <p className="text-cyber-cyan-light mt-4"># using pnpm</p>
                    <p className="text-gray-300">pnpm add @validex/sdk</p>
                  </div>
                </Terminal>
              </div>

              {/* Basic Usage */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white font-mono">2. Basic Usage</h3>
                <Terminal title="example.ts">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">import</p> <span className="text-gray-300">{'{ ValidexClient }'}</span> <p className="text-purple-400">from</p> <span className="text-green-400">'@validex/sdk'</span>
                    <p className="text-gray-500 mt-3">// initialize client</p>
                    <p className="text-purple-400">const</p> <span className="text-gray-300">validex = </span><p className="text-purple-400">new</p> <span className="text-yellow-400">ValidexClient</span><span className="text-gray-300">()</span>

                    <p className="text-gray-500 mt-4">// scan a token</p>
                    <p className="text-purple-400">const</p> <span className="text-gray-300">result = </span><p className="text-purple-400">await</p> <span className="text-gray-300">validex.</span><span className="text-yellow-400">scanToken</span><span className="text-gray-300">(</span>
                    <p className="text-green-400 ml-4">'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'</p>
                    <span className="text-gray-300">)</span>

                    <p className="text-gray-500 mt-4">// check results</p>
                    <p className="text-purple-400">if</p> <span className="text-gray-300">(result.riskScore {'<'} </span><span className="text-orange-400">30</span><span className="text-gray-300">) {'{'}</span>
                    <p className="text-gray-300 ml-4">console.</p><span className="text-yellow-400">log</span><span className="text-gray-300">(</span><span className="text-green-400">'Token is safe!'</span><span className="text-gray-300">)</span>
                    <span className="text-gray-300">{'}'}</span>
                  </div>
                </Terminal>
              </div>

              {/* Response Structure */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white font-mono">3. Response Structure</h3>
                <Terminal title="response.json">
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">{'{'}</p>
                    <p className="text-gray-300 ml-4"><span className="text-blue-400">"address"</span>: <span className="text-green-400">"EPjF...Dt1v"</span>,</p>
                    <p className="text-gray-300 ml-4"><span className="text-blue-400">"riskScore"</span>: <span className="text-orange-400">15</span>,</p>
                    <p className="text-gray-300 ml-4"><span className="text-blue-400">"checks"</span>: {'{'}</p>
                    <p className="text-gray-300 ml-8"><span className="text-blue-400">"mintAuthority"</span>: {'{'}</p>
                    <p className="text-gray-300 ml-12"><span className="text-blue-400">"status"</span>: <span className="text-green-400">"revoked"</span>,</p>
                    <p className="text-gray-300 ml-12"><span className="text-blue-400">"safe"</span>: <span className="text-orange-400">true</span></p>
                    <p className="text-gray-300 ml-8">{'},'}</p>
                    <p className="text-gray-300 ml-8"><span className="text-blue-400">"freezeAuthority"</span>: {'{'}</p>
                    <p className="text-gray-300 ml-12"><span className="text-blue-400">"status"</span>: <span className="text-green-400">"revoked"</span>,</p>
                    <p className="text-gray-300 ml-12"><span className="text-blue-400">"safe"</span>: <span className="text-orange-400">true</span></p>
                    <p className="text-gray-300 ml-8">{'},'}</p>
                    <p className="text-gray-300 ml-8"><span className="text-blue-400">"liquidity"</span>: {'{ ... },'}</p>
                    <p className="text-gray-300 ml-8"><span className="text-blue-400">"holders"</span>: {'{ ... }'}</p>
                    <p className="text-gray-300 ml-4">{'}'}</p>
                    <p className="text-gray-300">{'}'}</p>
                  </div>
                </Terminal>
              </div>
            </div>
          )}

          {/* API Reference */}
          {activeTab === 'api' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-mono">
                  <span className="text-gray-400">//</span> <span className="text-white">api reference</span>
                </h2>
                <p className="text-gray-400 mb-8">complete api documentation for validex sdk.</p>
              </div>

              {/* scanToken */}
              <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-mono">GET</span>
                    <span className="text-white font-mono">scanToken(address)</span>
                  </div>
                  <p className="text-gray-400 text-sm">Performs a comprehensive security scan on a token.</p>
                </div>

                <Terminal title="usage.ts">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">const</p> <span className="text-gray-300">result = </span><p className="text-purple-400">await</p> <span className="text-gray-300">validex.</span><span className="text-yellow-400">scanToken</span><span className="text-gray-300">(</span>
                    <p className="text-green-400 ml-4">'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'</p>
                    <span className="text-gray-300">)</span>
                  </div>
                </Terminal>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-mono text-gray-300">Parameters:</p>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm text-gray-400">
                      <span className="text-blue-400 font-mono">address</span>
                      <span className="text-gray-500"> (string)</span> - The Solana token mint address
                    </p>
                  </div>
                  <p className="text-sm font-mono text-gray-300 mt-4">Returns:</p>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">
                      <span className="text-blue-400 font-mono">Promise&lt;ScanResult&gt;</span> - Comprehensive scan results
                    </p>
                  </div>
                </div>
              </div>

              {/* getTokenMetadata */}
              <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono">GET</span>
                    <span className="text-white font-mono">getTokenMetadata(address)</span>
                  </div>
                  <p className="text-gray-400 text-sm">Fetches token metadata (name, symbol, logo, etc).</p>
                </div>

                <Terminal title="usage.ts">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">const</p> <span className="text-gray-300">metadata = </span><p className="text-purple-400">await</p> <span className="text-gray-300">validex.</span><span className="text-yellow-400">getTokenMetadata</span><span className="text-gray-300">(</span>
                    <p className="text-green-400 ml-4">'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'</p>
                    <span className="text-gray-300">)</span>
                    <p className="text-gray-300 mt-2">console.</p><span className="text-yellow-400">log</span><span className="text-gray-300">(metadata.name) </span><span className="text-gray-500">// "USD Coin"</span>
                  </div>
                </Terminal>
              </div>

              {/* checkMintAuthority */}
              <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-mono">CHECK</span>
                    <span className="text-white font-mono">checkMintAuthority(address)</span>
                  </div>
                  <p className="text-gray-400 text-sm">Checks if mint authority is revoked or active.</p>
                </div>

                <Terminal title="usage.ts">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">const</p> <span className="text-gray-300">mintCheck = </span><p className="text-purple-400">await</p> <span className="text-gray-300">validex.</span><span className="text-yellow-400">checkMintAuthority</span><span className="text-gray-300">(</span>
                    <p className="text-green-400 ml-4">'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'</p>
                    <span className="text-gray-300">)</span>
                    <p className="text-gray-500 mt-2">// Returns: {'{ status: "revoked", safe: true }'}</p>
                  </div>
                </Terminal>
              </div>
            </div>
          )}

          {/* Security Checks */}
          {activeTab === 'checks' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-mono">
                  <span className="text-gray-400">//</span> <span className="text-white">security checks explained</span>
                </h2>
                <p className="text-gray-400 mb-8">what each check does and why it matters.</p>
              </div>

              {/* Mint Authority */}
              <div className="glass-dark p-6 rounded-lg border border-red-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white font-mono">Mint Authority</h3>
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-mono">CRITICAL</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      checks if developers can mint unlimited new tokens. if mint authority is active, devs can create infinite supply and dump on holders. this is the #1 rug pull method.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-cyber-cyan-neon" />
                      <span className="text-sm font-mono text-white">Safe</span>
                    </div>
                    <p className="text-xs text-gray-400">Mint authority is revoked. No one can create new tokens.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-mono text-white">Dangerous</span>
                    </div>
                    <p className="text-xs text-gray-400">Mint authority active. Devs can mint anytime.</p>
                  </div>
                </div>
              </div>

              {/* Freeze Authority */}
              <div className="glass-dark p-6 rounded-lg border border-yellow-500/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <Shield className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white font-mono">Freeze Authority</h3>
                      <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-mono">HIGH</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      checks if developers can freeze token accounts. if active, devs can lock your tokens so you can't sell. common tactic to prevent sells during a rug pull.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-cyber-cyan-neon" />
                      <span className="text-sm font-mono text-white">Safe</span>
                    </div>
                    <p className="text-xs text-gray-400">Freeze authority revoked. You can always sell.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-mono text-white">Dangerous</span>
                    </div>
                    <p className="text-xs text-gray-400">Freeze authority active. Devs can lock your tokens.</p>
                  </div>
                </div>
              </div>

              {/* Liquidity */}
              <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-cyber-cyan/10">
                    <Database className="w-6 h-6 text-cyber-cyan-neon" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white font-mono">Liquidity Analysis</h3>
                      <span className="px-2 py-1 rounded bg-cyber-cyan/20 text-cyber-cyan-neon text-xs font-mono">CORE</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      analyzes liquidity pool size, LP token burn status, and lock periods. if LP isn't locked or burned, devs can remove all liquidity instantly (rug pull).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-cyber-black/50 border border-cyber-cyan/10 mt-6">
                  <p className="text-sm font-mono text-gray-300 mb-3">We check:</p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan-neon" />
                      Total liquidity (SOL + Token)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan-neon" />
                      LP token burn status (burned = permanent)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan-neon" />
                      Lock period and expiry date
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan-neon" />
                      % of supply in liquidity pool
                    </li>
                  </ul>
                </div>
              </div>

              {/* Holder Distribution */}
              <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-cyber-cyan/10">
                    <TerminalIcon className="w-6 h-6 text-cyber-cyan-neon" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white font-mono">Holder Distribution</h3>
                      <span className="px-2 py-1 rounded bg-cyber-cyan/20 text-cyber-cyan-neon text-xs font-mono">SMART</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                      analyzes top 20 holders to detect concentration risk. if top wallets control too much supply, they can dump and crash the price. we also detect wallet clustering (same funder = likely same person).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20 mt-6">
                  <p className="text-sm font-mono text-gray-300 mb-3">Red flags:</p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Top 10 holders own &gt;50% of supply
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Multiple wallets funded by same address
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Sudden large transfers before launch
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Integration */}
          {activeTab === 'integration' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-mono">
                  <span className="text-gray-400">//</span> <span className="text-white">integration guides</span>
                </h2>
                <p className="text-gray-400 mb-8">integrate validex into your dapp or bot.</p>
              </div>

              {/* React Integration */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white font-mono">React / Next.js</h3>
                <Terminal title="TokenScanner.tsx">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">import</p> <span className="text-gray-300">{'{ useState }'}</span> <p className="text-purple-400">from</p> <span className="text-green-400">'react'</span>
                    <p className="text-purple-400">import</p> <span className="text-gray-300">{'{ ValidexClient }'}</span> <p className="text-purple-400">from</p> <span className="text-green-400">'@validex/sdk'</span>

                    <p className="text-purple-400 mt-3">export default function</p> <span className="text-yellow-400">TokenScanner</span><span className="text-gray-300">() {'{'}</span>
                    <p className="text-purple-400 ml-4">const</p> <span className="text-gray-300">[result, setResult] = </span><span className="text-yellow-400">useState</span><span className="text-gray-300">(</span><span className="text-orange-400">null</span><span className="text-gray-300">)</span>

                    <p className="text-purple-400 ml-4 mt-2">const</p> <span className="text-yellow-400">scanToken</span> <span className="text-gray-300">= </span><span className="text-purple-400">async</span> <span className="text-gray-300">(address) {'=>'} {'{'}</span>
                    <p className="text-purple-400 ml-8">const</p> <span className="text-gray-300">validex = </span><span className="text-purple-400">new</span> <span className="text-yellow-400">ValidexClient</span><span className="text-gray-300">()</span>
                    <p className="text-purple-400 ml-8">const</p> <span className="text-gray-300">data = </span><span className="text-purple-400">await</span> <span className="text-gray-300">validex.</span><span className="text-yellow-400">scanToken</span><span className="text-gray-300">(address)</span>
                    <p className="text-gray-300 ml-8">setResult(data)</p>
                    <p className="text-gray-300 ml-4">{'}'}</p>

                    <p className="text-purple-400 ml-4 mt-2">return</p> <span className="text-gray-300">{'<div>...</div>'}</span>
                    <span className="text-gray-300">{'}'}</span>
                  </div>
                </Terminal>
              </div>

              {/* Discord Bot */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white font-mono">Discord Bot</h3>
                <Terminal title="bot.js">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">const</p> <span className="text-gray-300">{'{ ValidexClient }'} = </span><span className="text-yellow-400">require</span><span className="text-gray-300">(</span><span className="text-green-400">'@validex/sdk'</span><span className="text-gray-300">)</span>
                    <p className="text-purple-400">const</p> <span className="text-gray-300">validex = </span><span className="text-purple-400">new</span> <span className="text-yellow-400">ValidexClient</span><span className="text-gray-300">()</span>

                    <p className="text-gray-300 mt-3">client.</p><span className="text-yellow-400">on</span><span className="text-gray-300">(</span><span className="text-green-400">'messageCreate'</span><span className="text-gray-300">, </span><span className="text-purple-400">async</span> <span className="text-gray-300">(message) {'=>'} {'{'}</span>
                    <p className="text-purple-400 ml-4">if</p> <span className="text-gray-300">(message.content.</span><span className="text-yellow-400">startsWith</span><span className="text-gray-300">(</span><span className="text-green-400">'!scan'</span><span className="text-gray-300">)) {'{'}</span>
                    <p className="text-purple-400 ml-8">const</p> <span className="text-gray-300">address = message.content.</span><span className="text-yellow-400">split</span><span className="text-gray-300">(</span><span className="text-green-400">' '</span><span className="text-gray-300">)[</span><span className="text-orange-400">1</span><span className="text-gray-300">]</span>
                    <p className="text-purple-400 ml-8">const</p> <span className="text-gray-300">result = </span><span className="text-purple-400">await</span> <span className="text-gray-300">validex.</span><span className="text-yellow-400">scanToken</span><span className="text-gray-300">(address)</span>
                    <p className="text-gray-300 ml-8">message.</p><span className="text-yellow-400">reply</span><span className="text-gray-300">(</span><span className="text-green-400">`Risk Score: ${'{result.riskScore}'}/100`</span><span className="text-gray-300">)</span>
                    <p className="text-gray-300 ml-4">{'}'}</p>
                    <span className="text-gray-300">{'})'}</span>
                  </div>
                </Terminal>
              </div>

              {/* Telegram Bot */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white font-mono">Telegram Bot</h3>
                <Terminal title="telegram-bot.js">
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-400">const</p> <span className="text-gray-300">{'{ Telegraf }'} = </span><span className="text-yellow-400">require</span><span className="text-gray-300">(</span><span className="text-green-400">'telegraf'</span><span className="text-gray-300">)</span>
                    <p className="text-purple-400">const</p> <span className="text-gray-300">{'{ ValidexClient }'} = </span><span className="text-yellow-400">require</span><span className="text-gray-300">(</span><span className="text-green-400">'@validex/sdk'</span><span className="text-gray-300">)</span>

                    <p className="text-purple-400 mt-3">const</p> <span className="text-gray-300">bot = </span><span className="text-purple-400">new</span> <span className="text-yellow-400">Telegraf</span><span className="text-gray-300">(process.env.</span><span className="text-orange-400">BOT_TOKEN</span><span className="text-gray-300">)</span>
                    <p className="text-purple-400">const</p> <span className="text-gray-300">validex = </span><span className="text-purple-400">new</span> <span className="text-yellow-400">ValidexClient</span><span className="text-gray-300">()</span>

                    <p className="text-gray-300 mt-3">bot.</p><span className="text-yellow-400">command</span><span className="text-gray-300">(</span><span className="text-green-400">'scan'</span><span className="text-gray-300">, </span><span className="text-purple-400">async</span> <span className="text-gray-300">(ctx) {'=>'} {'{'}</span>
                    <p className="text-purple-400 ml-4">const</p> <span className="text-gray-300">address = ctx.message.text.</span><span className="text-yellow-400">split</span><span className="text-gray-300">(</span><span className="text-green-400">' '</span><span className="text-gray-300">)[</span><span className="text-orange-400">1</span><span className="text-gray-300">]</span>
                    <p className="text-purple-400 ml-4">const</p> <span className="text-gray-300">result = </span><span className="text-purple-400">await</span> <span className="text-gray-300">validex.</span><span className="text-yellow-400">scanToken</span><span className="text-gray-300">(address)</span>
                    <p className="text-gray-300 ml-4">ctx.</p><span className="text-yellow-400">reply</span><span className="text-gray-300">(</span><span className="text-green-400">`🔍 Risk: ${'{result.riskScore}'}/100`</span><span className="text-gray-300">)</span>
                    <span className="text-gray-300">{'})'}</span>
                  </div>
                </Terminal>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-mono">
                  <span className="text-gray-400">//</span> <span className="text-white">frequently asked questions</span>
                </h2>
              </div>

              <div className="space-y-6">
                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">Is validex free?</h3>
                  <p className="text-gray-400">yes. validex is completely free to use. no api keys, no rate limits, no bullshit. just paste a token address and scan.</p>
                </div>

                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">How accurate are the scans?</h3>
                  <p className="text-gray-400">we pull data directly from solana blockchain using helius rpc. the data is as accurate as the blockchain itself. our risk scores are based on proven red flags that indicate rug pulls.</p>
                </div>

                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">Can I use this for my trading bot?</h3>
                  <p className="text-gray-400">absolutely. our sdk is designed for bots and dapps. check the integration guide above for examples with discord, telegram, and more.</p>
                </div>

                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">What networks do you support?</h3>
                  <p className="text-gray-400">currently we only support solana mainnet. we're exploring support for other networks based on demand.</p>
                </div>

                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">Does a low risk score guarantee safety?</h3>
                  <p className="text-gray-400">no tool can guarantee 100% safety. validex checks for common rug pull methods, but there are always creative ways to scam. always dyor and never invest more than you can afford to lose.</p>
                </div>

                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">How often is data updated?</h3>
                  <p className="text-gray-400">every scan fetches fresh data from the blockchain in real-time. we also have a webhook system that alerts you if a token's security status changes (like mint authority being activated).</p>
                </div>

                <div className="glass-dark p-6 rounded-lg border border-cyber-cyan/20">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">Can I contribute to validex?</h3>
                  <p className="text-gray-400">yes! validex is open source. check our github for contribution guidelines. we're especially looking for help with new security check ideas and additional network support.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 font-mono">
            <span className="text-white">start building</span>
          </h2>
          <p className="text-gray-400 mb-8">integrate validex into your dapp in minutes.</p>
          <div className="flex gap-4 justify-center">
            <a
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-3 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 hover:border-cyber-cyan rounded-lg text-cyber-cyan-neon font-mono transition-all duration-200 hover:shadow-neon-cyan"
            >
              try demo →
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 glass-dark hover:bg-white/5 border border-cyber-cyan/20 hover:border-cyber-cyan/30 rounded-lg text-gray-300 hover:text-white font-mono transition-all duration-200"
            >
              scan a token
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
