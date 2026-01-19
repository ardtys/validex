import { NextRequest, NextResponse } from 'next/server'
import {
  Connection,
  PublicKey,
} from '@solana/web3.js'
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'

// Types
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

export async function POST(request: NextRequest) {
  try {
    const { tokenAddress } = await request.json()

    // Validate token address
    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      )
    }

    // Validate Solana address format
    let mintPublicKey: PublicKey
    try {
      mintPublicKey = new PublicKey(tokenAddress)
    } catch {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      )
    }

    // Connect to Solana
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    // Get mint info
    const mintInfo = await getMint(
      connection,
      mintPublicKey,
      'confirmed',
      TOKEN_PROGRAM_ID
    )

    // Check authorities
    const authorityStatus: AuthorityStatus = {
      mintAuthority: {
        active: mintInfo.mintAuthority !== null,
        address: mintInfo.mintAuthority ? mintInfo.mintAuthority.toBase58() : null,
      },
      freezeAuthority: {
        active: mintInfo.freezeAuthority !== null,
        address: mintInfo.freezeAuthority ? mintInfo.freezeAuthority.toBase58() : null,
      },
    }

    // Get metadata
    const metadata = await getTokenMetadata(connection, mintPublicKey)

    // Get additional data (in parallel for better performance)
    const [creationDate, holderStats, liquidityInfo, developerInfo] = await Promise.all([
      getCreationDate(connection, mintPublicKey),
      getTopHolders(connection, mintPublicKey, mintInfo.decimals, mintInfo.supply),
      getLiquidityInfo(connection, mintPublicKey),
      getDeveloperInfo(connection, mintPublicKey),
    ])

    // Get market info
    const marketInfo = await getMarketInfo(connection, mintPublicKey, metadata?.symbol || 'UNKNOWN')

    // Calculate detailed score breakdown
    const scoreBreakdown = calculateScoreBreakdown(
      authorityStatus,
      metadata?.isMutable || false,
      holderStats,
      liquidityInfo
    )

    // Calculate risk score with holder concentration
    const { riskScore, warnings } = calculateRiskScore(
      authorityStatus,
      metadata?.isMutable || false,
      holderStats
    )

    // Determine risk level
    const riskLevel = determineRiskLevel(riskScore)

    // Build token info
    const tokenInfo: TokenInfo = {
      address: tokenAddress,
      name: metadata?.name || 'Unknown Token',
      symbol: metadata?.symbol || 'UNKNOWN',
      decimals: mintInfo.decimals,
      totalSupply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toFixed(mintInfo.decimals),
      metadataUri: metadata?.uri || '',
      imageUri: metadata?.image || '',
      createdAt: creationDate,
    }

    const result: AuditResult = {
      tokenInfo,
      authorityStatus,
      holderStats,
      liquidityInfo,
      scoreBreakdown,
      developerInfo,
      marketInfo,
      metadataIsMutable: metadata?.isMutable || false,
      riskScore,
      riskLevel,
      warnings,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Audit error:', error)

    if (error.message?.includes('could not find account')) {
      return NextResponse.json(
        { error: 'Token not found. Please check the address.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to audit token', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to get token metadata
async function getTokenMetadata(connection: Connection, mintPublicKey: PublicKey) {
  try {
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
    )

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )

    const accountInfo = await connection.getAccountInfo(metadataPDA)

    if (!accountInfo) {
      return null
    }

    // Simple metadata parsing
    const data = accountInfo.data

    // Try to get metadata URI and fetch it
    try {
      // Metaplex metadata structure is complex, let's try to parse it
      const nameStart = 65
      const nameLength = data.readUInt32LE(nameStart)
      const name = data.slice(nameStart + 4, nameStart + 4 + nameLength).toString('utf8').replace(/\0/g, '').trim()

      const symbolStart = nameStart + 4 + nameLength
      const symbolLength = data.readUInt32LE(symbolStart)
      const symbol = data.slice(symbolStart + 4, symbolStart + 4 + symbolLength).toString('utf8').replace(/\0/g, '').trim()

      const uriStart = symbolStart + 4 + symbolLength
      const uriLength = data.readUInt32LE(uriStart)
      const uri = data.slice(uriStart + 4, uriStart + 4 + uriLength).toString('utf8').replace(/\0/g, '').trim()

      // Fetch metadata JSON if URI exists
      let image = ''
      if (uri && uri.startsWith('http')) {
        try {
          const response = await fetch(uri)
          const metadata = await response.json()
          image = metadata.image || ''
        } catch (e) {
          console.error('Failed to fetch metadata JSON:', e)
        }
      }

      // Check if mutable (byte at position 114)
      const isMutable = data[114] === 1

      return {
        name,
        symbol,
        uri,
        image,
        isMutable,
      }
    } catch (e) {
      console.error('Failed to parse metadata:', e)
      return null
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return null
  }
}

// Calculate risk score
function calculateRiskScore(
  authorityStatus: AuthorityStatus,
  isMutable: boolean,
  holderStats?: HolderStats
): { riskScore: number; warnings: string[] } {
  let score = 100
  const warnings: string[] = []

  if (authorityStatus.mintAuthority.active) {
    score -= 50
    warnings.push('⚠️ mint authority active - devs can print unlimited tokens')
  } else {
    warnings.push('✅ mint authority revoked')
  }

  if (authorityStatus.freezeAuthority.active) {
    score -= 20
    warnings.push('⚠️ freeze authority active - devs can freeze your tokens')
  } else {
    warnings.push('✅ freeze authority revoked')
  }

  if (isMutable) {
    score -= 10
    warnings.push('⚠️ metadata mutable - name/image can change')
  } else {
    warnings.push('✅ metadata immutable')
  }

  // Check holder concentration
  if (holderStats) {
    if (holderStats.top10Concentration > 80) {
      score -= 15
      warnings.push('⚠️ top 10 holders own ' + holderStats.top10Concentration.toFixed(1) + '% - high concentration risk')
    } else if (holderStats.top10Concentration > 50) {
      score -= 5
      warnings.push('⚠️ top 10 holders own ' + holderStats.top10Concentration.toFixed(1) + '% - moderate concentration')
    } else {
      warnings.push('✅ good holder distribution (' + holderStats.top10Concentration.toFixed(1) + '% in top 10)')
    }

    if (holderStats.totalHolders < 10) {
      score -= 10
      warnings.push('⚠️ very few holders (' + holderStats.totalHolders + ') - low liquidity risk')
    } else if (holderStats.totalHolders < 100) {
      score -= 5
      warnings.push('⚠️ limited holders (' + holderStats.totalHolders + ') - early stage token')
    }
  }

  score = Math.max(0, score)
  return { riskScore: score, warnings }
}

// Determine risk level
function determineRiskLevel(score: number): RiskLevel {
  if (score >= 80) {
    return 'Safe'
  } else if (score >= 50) {
    return 'Caution'
  } else {
    return 'Rug Pull Risk'
  }
}

// Get top token holders
async function getTopHolders(
  connection: Connection,
  mintPublicKey: PublicKey,
  decimals: number,
  totalSupply: bigint
): Promise<HolderStats> {
  try {
    // Get all token accounts for this mint
    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, // Size of token account
          },
          {
            memcmp: {
              offset: 0, // Mint address offset
              bytes: mintPublicKey.toBase58(),
            },
          },
        ],
      }
    )

    // Parse and sort holders
    const holders = accounts
      .map((account) => {
        const parsed = account.account.data as any
        const balance = parsed.parsed?.info?.tokenAmount?.amount || '0'
        return {
          address: account.pubkey.toBase58(),
          balance: balance,
          amount: BigInt(balance),
        }
      })
      .filter((holder) => holder.amount > 0n)
      .sort((a, b) => (a.amount > b.amount ? -1 : 1))

    const totalHolders = holders.length

    // Get top 10 holders
    const topHolders = holders.slice(0, 10).map((holder) => {
      const balance = Number(holder.amount) / Math.pow(10, decimals)
      const percentage = (Number(holder.amount) * 100) / Number(totalSupply)
      return {
        address: holder.address,
        balance: balance.toFixed(decimals),
        percentage: parseFloat(percentage.toFixed(2)),
      }
    })

    // Calculate top 10 concentration
    const top10Total = holders
      .slice(0, 10)
      .reduce((sum, holder) => sum + holder.amount, 0n)
    const top10Concentration = (Number(top10Total) * 100) / Number(totalSupply)

    return {
      totalHolders,
      topHolders,
      top10Concentration: parseFloat(top10Concentration.toFixed(2)),
    }
  } catch (error) {
    console.error('Error fetching holders:', error)
    return {
      totalHolders: 0,
      topHolders: [],
      top10Concentration: 0,
    }
  }
}

// Get token creation date
async function getCreationDate(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<string | undefined> {
  try {
    const signatures = await connection.getSignaturesForAddress(mintPublicKey, {
      limit: 1,
    })

    if (signatures.length > 0) {
      const signature = signatures[signatures.length - 1]
      if (signature.blockTime) {
        return new Date(signature.blockTime * 1000).toISOString()
      }
    }
    return undefined
  } catch (error) {
    console.error('Error fetching creation date:', error)
    return undefined
  }
}

// Get liquidity info (simplified - checks for common DEX pools)
async function getLiquidityInfo(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<LiquidityInfo> {
  try {
    // This is a simplified version - real implementation would need to:
    // 1. Query Raydium/Orca/Jupiter pools
    // 2. Check LP token locks
    // 3. Calculate liquidity in USD

    // For now, return basic structure
    return {
      hasPool: false,
      locked: false,
    }
  } catch (error) {
    console.error('Error fetching liquidity info:', error)
    return {
      hasPool: false,
      locked: false,
    }
  }
}

// Get developer info and token history
async function getDeveloperInfo(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<DeveloperInfo | undefined> {
  try {
    // Get mint authority as creator
    const mintInfo = await getMint(connection, mintPublicKey, 'confirmed', TOKEN_PROGRAM_ID)

    // If no mint authority, try to get update authority from metadata
    let creatorAddress: string | null = null

    if (mintInfo.mintAuthority) {
      creatorAddress = mintInfo.mintAuthority.toBase58()
    } else {
      // Try to get update authority from metadata as fallback
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintPublicKey.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
      )

      const accountInfo = await connection.getAccountInfo(metadataPDA)
      if (accountInfo) {
        // Update authority is at byte 1 (after key byte)
        const updateAuthority = new PublicKey(accountInfo.data.slice(1, 33))
        creatorAddress = updateAuthority.toBase58()
      }
    }

    if (!creatorAddress) {
      return undefined
    }

    // Get signatures for this creator to find other mints
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(creatorAddress),
      { limit: 100 }
    )

    // Count mint initialization transactions
    let mintCount = 0
    const previousTokens: CreatorToken[] = []

    // This is a simplified check - in production, you'd parse transactions to find InitializeMint
    // For now, we estimate based on signature count
    mintCount = Math.max(1, Math.floor(signatures.length / 20)) // Rough estimate

    // Build reputation based on mint authority status
    let reputation: 'Trusted' | 'Neutral' | 'Suspicious' | 'Scammer' = 'Neutral'

    if (!mintInfo.mintAuthority && !mintInfo.freezeAuthority) {
      reputation = 'Trusted' // Both authorities revoked
    } else if (mintInfo.mintAuthority && mintInfo.freezeAuthority) {
      reputation = 'Suspicious' // Both authorities active
    }

    return {
      address: creatorAddress,
      totalTokensCreated: mintCount,
      previousTokens: previousTokens,
      rugPullHistory: 0, // Would need historical data
      reputation,
    }
  } catch (error) {
    console.error('Error fetching developer info:', error)
    return undefined
  }
}

// Get market info and trading pairs from DexScreener
async function getMarketInfo(
  connection: Connection,
  mintPublicKey: PublicKey,
  symbol: string
): Promise<MarketInfo> {
  try {
    const ecosystem: string[] = []
    const tradingPairs: Array<{ dex: string; pair: string; liquidity?: number }> = []
    const relatedTokens: string[] = []

    // Query DexScreener API for real-time trading pairs
    try {
      const tokenAddress = mintPublicKey.toBase58()
      const dexScreenerResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
        {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      )

      if (dexScreenerResponse.ok) {
        const data = await dexScreenerResponse.json()

        if (data.pairs && Array.isArray(data.pairs)) {
          // Get top 5 pairs by liquidity
          const topPairs = data.pairs
            .filter((pair: any) => pair.chainId === 'solana')
            .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
            .slice(0, 5)

          topPairs.forEach((pair: any) => {
            tradingPairs.push({
              dex: pair.dexId || 'Unknown DEX',
              pair: pair.baseToken?.symbol && pair.quoteToken?.symbol
                ? `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`
                : 'Unknown Pair',
              liquidity: pair.liquidity?.usd || undefined
            })

            // Add quote token to related tokens
            if (pair.quoteToken?.symbol && !relatedTokens.includes(pair.quoteToken.symbol)) {
              relatedTokens.push(pair.quoteToken.symbol)
            }
          })

          // Determine ecosystem based on pairs and metadata
          if (topPairs.length > 0) {
            ecosystem.push('DeFi')

            const hasStablecoinPair = topPairs.some((p: any) =>
              ['USDC', 'USDT', 'DAI'].includes(p.quoteToken?.symbol)
            )
            if (hasStablecoinPair) {
              if (symbol.match(/^(USDC|USDT|DAI|BUSD)$/i)) {
                ecosystem.push('Stablecoin')
              }
            }

            const hasRaydium = topPairs.some((p: any) => p.dexId?.toLowerCase().includes('raydium'))
            const hasOrca = topPairs.some((p: any) => p.dexId?.toLowerCase().includes('orca'))

            if (hasRaydium || hasOrca) {
              ecosystem.push('Solana Native')
            }
          }
        }
      }
    } catch (apiError) {
      console.error('DexScreener API error:', apiError)
      // Continue with empty data if API fails
    }

    // Fallback: basic classification if no API data
    if (ecosystem.length === 0) {
      if (symbol.match(/^(USDC|USDT|DAI|BUSD)$/i)) {
        ecosystem.push('Stablecoin', 'DeFi')
      } else {
        ecosystem.push('Solana Native')
      }
    }

    return {
      tradingPairs,
      ecosystem,
      relatedTokens,
    }
  } catch (error) {
    console.error('Error fetching market info:', error)
    return {
      tradingPairs: [],
      ecosystem: ['Solana Native'],
      relatedTokens: [],
    }
  }
}

// Calculate detailed score breakdown
function calculateScoreBreakdown(
  authorityStatus: AuthorityStatus,
  isMutable: boolean,
  holderStats?: HolderStats,
  liquidityInfo?: LiquidityInfo
): ScoreBreakdown {
  // Authority score (50 points max)
  let authorityScore = 50
  if (authorityStatus.mintAuthority.active) authorityScore -= 40
  if (authorityStatus.freezeAuthority.active) authorityScore -= 10

  const authorityStatus_text = authorityScore >= 40 ? 'Good' : authorityScore >= 25 ? 'Moderate Risk' : 'High Risk'

  // Holders score (25 points max)
  let holdersScore = 25
  if (holderStats) {
    if (holderStats.top10Concentration > 80) holdersScore -= 15
    else if (holderStats.top10Concentration > 50) holdersScore -= 8

    if (holderStats.totalHolders < 10) holdersScore -= 10
    else if (holderStats.totalHolders < 100) holdersScore -= 5
  }
  const holdersStatus = holdersScore >= 20 ? 'Good Distribution' : holdersScore >= 10 ? 'Moderate Concentration' : 'High Concentration Risk'

  // Metadata score (10 points max)
  const metadataScore = isMutable ? 0 : 10
  const metadataStatus = isMutable ? 'Mutable' : 'Immutable'

  // Liquidity score (15 points max)
  let liquidityScore = 15
  if (liquidityInfo) {
    if (!liquidityInfo.hasPool) liquidityScore -= 10
    if (!liquidityInfo.locked) liquidityScore -= 5
  }
  const liquidityStatus = liquidityScore >= 10 ? 'Good' : liquidityScore >= 5 ? 'Moderate' : 'Poor'

  // Overall
  const overallScore = authorityScore + holdersScore + metadataScore + liquidityScore
  const overallStatus = overallScore >= 80 ? 'Safe' : overallScore >= 50 ? 'Caution' : 'High Risk'

  return {
    authority: { score: authorityScore, maxScore: 50, status: authorityStatus_text },
    holders: { score: holdersScore, maxScore: 25, status: holdersStatus },
    metadata: { score: metadataScore, maxScore: 10, status: metadataStatus },
    liquidity: { score: liquidityScore, maxScore: 15, status: liquidityStatus },
    overall: { score: overallScore, maxScore: 100, status: overallStatus },
  }
}
