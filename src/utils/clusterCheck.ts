/**
 * Holder Cluster Analysis Tool
 *
 * Efficient analysis of token holder funding sources using Helius RPC
 * with intelligent rate limiting to avoid 429 errors
 *
 * Features:
 * - Concurrent request processing with p-limit
 * - Automatic retry with exponential backoff
 * - CEX wallet detection
 * - Funding source tracing
 * - Cluster grouping
 */

import {
  Connection,
  PublicKey,
  ParsedAccountData,
  ParsedTransactionWithMeta,
} from '@solana/web3.js';
import pLimit from 'p-limit';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=3ad61b57-e57d-4bc9-9176-cbd567b737ad';
const MAX_CONCURRENT_REQUESTS = 5; // Helius can handle more, but safe default
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

// Known CEX wallets (add more as needed)
const KNOWN_CEX_WALLETS = new Set([
  '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9', // Binance
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS', // Coinbase
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE', // FTX (historical)
  // Add more CEX deposit addresses here
]);

// ============================================================================
// TYPES
// ============================================================================

interface HolderInfo {
  address: string;
  balance: number;
  percentage: number;
  funderAddress: string | null;
  fundingTransaction: string | null;
  isCEXFunded: boolean;
}

interface FundingCluster {
  funderAddress: string;
  controlledHolders: HolderInfo[];
  totalPercentage: number;
  holderCount: number;
  suspicionLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

interface ClusterAnalysisResult {
  tokenAddress: string;
  topHolders: HolderInfo[];
  clusters: FundingCluster[];
  totalClusteredPercentage: number;
  cexFundedPercentage: number;
  analysisTimestamp: string;
  verdict: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = i === attempts - 1;
      const is429 = error.message?.includes('429') || error.message?.includes('rate limit');

      if (isLastAttempt || !is429) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = RETRY_DELAY_MS * Math.pow(2, i);
      console.log(`⏳ Rate limited, retrying in ${delay}ms... (attempt ${i + 1}/${attempts})`);
      await sleep(delay);
    }
  }

  throw new Error('Max retry attempts reached');
}

/**
 * Check if address is a known CEX wallet
 */
function isCEXWallet(address: string): boolean {
  return KNOWN_CEX_WALLETS.has(address);
}

// ============================================================================
// CLUSTER ANALYSIS
// ============================================================================

/**
 * Main cluster analysis function
 */
export async function analyzeTokenClusters(tokenAddress: string): Promise<ClusterAnalysisResult> {
  console.log('='.repeat(60));
  console.log('🔍 Starting Holder Cluster Analysis');
  console.log('='.repeat(60));
  console.log(`Token: ${tokenAddress}`);
  console.log(`RPC: ${HELIUS_RPC_URL.split('?')[0]}`);
  console.log(`Concurrency: ${MAX_CONCURRENT_REQUESTS} requests`);
  console.log('='.repeat(60));
  console.log();

  const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
  const mintPubkey = new PublicKey(tokenAddress);

  // Step 1: Fetch top 20 holders
  console.log('📊 Step 1: Fetching top 20 holders...');
  const topHolders = await fetchTopHolders(connection, mintPubkey);
  console.log(`✅ Found ${topHolders.length} top holders`);
  console.log();

  // Step 2: Trace funding sources (with rate limiting)
  console.log('🕵️ Step 2: Tracing funding sources...');
  console.log(`   Using p-limit with concurrency: ${MAX_CONCURRENT_REQUESTS}`);
  const holdersWithFunding = await traceFundingSourcesConcurrent(connection, topHolders);
  console.log(`✅ Traced funding for ${holdersWithFunding.length} holders`);
  console.log();

  // Step 3: Group into clusters
  console.log('🔗 Step 3: Grouping into clusters...');
  const clusters = groupIntoClusters(holdersWithFunding);
  console.log(`✅ Found ${clusters.length} funding clusters`);
  console.log();

  // Step 4: Calculate metrics
  const totalClusteredPercentage = clusters.reduce((sum, c) => sum + c.totalPercentage, 0);
  const cexFundedPercentage = holdersWithFunding
    .filter(h => h.isCEXFunded)
    .reduce((sum, h) => sum + h.percentage, 0);

  const verdict = determineVerdict(clusters, totalClusteredPercentage);

  // Print results
  printResults(clusters, totalClusteredPercentage, cexFundedPercentage, verdict);

  return {
    tokenAddress,
    topHolders: holdersWithFunding,
    clusters,
    totalClusteredPercentage: Math.round(totalClusteredPercentage * 10) / 10,
    cexFundedPercentage: Math.round(cexFundedPercentage * 10) / 10,
    analysisTimestamp: new Date().toISOString(),
    verdict,
  };
}

/**
 * Fetch top 20 token holders
 */
async function fetchTopHolders(
  connection: Connection,
  mintPubkey: PublicKey
): Promise<HolderInfo[]> {
  const largestAccounts = await retryWithBackoff(() =>
    connection.getTokenLargestAccounts(mintPubkey)
  );

  // Get total supply
  const mintInfo = await retryWithBackoff(() =>
    connection.getParsedAccountInfo(mintPubkey)
  );

  let totalSupply = 0;
  if (mintInfo.value && mintInfo.value.data) {
    const data = mintInfo.value.data as ParsedAccountData;
    if (data.parsed?.info?.supply) {
      totalSupply = parseFloat(data.parsed.info.supply);
    }
  }

  const holders: HolderInfo[] = [];

  // Get owner addresses for each token account
  for (let i = 0; i < Math.min(largestAccounts.value.length, 20); i++) {
    const account = largestAccounts.value[i];
    const balance = parseFloat(account.amount);
    const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

    // Get token account owner
    const accountInfo = await retryWithBackoff(() =>
      connection.getParsedAccountInfo(account.address)
    );

    let ownerAddress = account.address.toBase58();

    if (accountInfo.value && accountInfo.value.data) {
      const data = accountInfo.value.data as ParsedAccountData;
      if (data.parsed?.info?.owner) {
        ownerAddress = data.parsed.info.owner;
      }
    }

    holders.push({
      address: ownerAddress,
      balance,
      percentage: Math.round(percentage * 100) / 100,
      funderAddress: null,
      fundingTransaction: null,
      isCEXFunded: false,
    });

    // Small delay to avoid rate limiting
    await sleep(100);
  }

  return holders;
}

/**
 * Trace funding sources with concurrent processing (p-limit)
 */
async function traceFundingSourcesConcurrent(
  connection: Connection,
  holders: HolderInfo[]
): Promise<HolderInfo[]> {
  // Create rate limiter
  const limit = pLimit(MAX_CONCURRENT_REQUESTS);

  // Create array of promises
  const promises = holders.map((holder, index) =>
    limit(async () => {
      console.log(`   [${index + 1}/${holders.length}] Tracing ${holder.address.substring(0, 8)}...`);

      try {
        const funding = await traceSingleHolderFunding(connection, holder.address);

        return {
          ...holder,
          ...funding,
        };
      } catch (error: any) {
        console.error(`   ❌ Failed to trace ${holder.address}: ${error.message}`);
        return holder;
      }
    })
  );

  // Wait for all promises to complete
  const results = await Promise.all(promises);

  return results;
}

/**
 * Trace funding source for a single holder
 */
async function traceSingleHolderFunding(
  connection: Connection,
  holderAddress: string
): Promise<{
  funderAddress: string | null;
  fundingTransaction: string | null;
  isCEXFunded: boolean;
}> {
  try {
    const holderPubkey = new PublicKey(holderAddress);

    // Get earliest transaction (creation/funding)
    const signatures = await retryWithBackoff(() =>
      connection.getSignaturesForAddress(holderPubkey, { limit: 1000 })
    );

    if (signatures.length === 0) {
      return { funderAddress: null, fundingTransaction: null, isCEXFunded: false };
    }

    // Get the FIRST transaction (oldest)
    const firstSignature = signatures[signatures.length - 1];

    // Fetch transaction details
    const transaction = await retryWithBackoff(() =>
      connection.getParsedTransaction(firstSignature.signature, {
        maxSupportedTransactionVersion: 0,
      })
    );

    if (!transaction || !transaction.meta) {
      return { funderAddress: null, fundingTransaction: null, isCEXFunded: false };
    }

    // Find funder (who sent SOL to this wallet)
    const funderAddress = extractFunderFromTransaction(transaction, holderAddress);
    const isCEX = funderAddress ? isCEXWallet(funderAddress) : false;

    return {
      funderAddress,
      fundingTransaction: firstSignature.signature,
      isCEXFunded: isCEX,
    };

  } catch (error) {
    return { funderAddress: null, fundingTransaction: null, isCEXFunded: false };
  }
}

/**
 * Extract funder address from transaction
 */
function extractFunderFromTransaction(
  transaction: ParsedTransactionWithMeta,
  recipientAddress: string
): string | null {
  try {
    if (!transaction.transaction || !transaction.meta) return null;

    const accountKeys = transaction.transaction.message.accountKeys;
    const preBalances = transaction.meta.preBalances;
    const postBalances = transaction.meta.postBalances;

    // Find account whose balance decreased (sender/funder)
    for (let i = 0; i < accountKeys.length; i++) {
      const preBalance = preBalances[i] || 0;
      const postBalance = postBalances[i] || 0;
      const accountKey = accountKeys[i].pubkey.toBase58();

      // Balance decreased and not the recipient = funder
      if (preBalance > postBalance && accountKey !== recipientAddress) {
        return accountKey;
      }
    }

    // Fallback: return fee payer (first account)
    return accountKeys[0].pubkey.toBase58();

  } catch (error) {
    return null;
  }
}

/**
 * Group holders into funding clusters
 */
function groupIntoClusters(holders: HolderInfo[]): FundingCluster[] {
  const clusterMap = new Map<string, HolderInfo[]>();

  // Group by funder (excluding CEX-funded and null funders)
  for (const holder of holders) {
    if (!holder.funderAddress || holder.isCEXFunded) continue;

    const funder = holder.funderAddress;
    if (!clusterMap.has(funder)) {
      clusterMap.set(funder, []);
    }
    clusterMap.get(funder)!.push(holder);
  }

  // Convert to cluster objects (only clusters with 2+ holders)
  const clusters: FundingCluster[] = [];

  for (const [funderAddress, controlledHolders] of clusterMap.entries()) {
    if (controlledHolders.length < 2) continue;

    const totalPercentage = controlledHolders.reduce((sum, h) => sum + h.percentage, 0);
    const suspicionLevel = determineSuspicionLevel(controlledHolders.length, totalPercentage);

    clusters.push({
      funderAddress,
      controlledHolders,
      totalPercentage: Math.round(totalPercentage * 10) / 10,
      holderCount: controlledHolders.length,
      suspicionLevel,
    });
  }

  // Sort by total percentage (descending)
  clusters.sort((a, b) => b.totalPercentage - a.totalPercentage);

  return clusters;
}

/**
 * Determine suspicion level for a cluster
 */
function determineSuspicionLevel(
  holderCount: number,
  totalPercentage: number
): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (totalPercentage > 30 && holderCount >= 3) return 'Critical';
  if (totalPercentage > 20 || holderCount >= 5) return 'High';
  if (totalPercentage > 10 || holderCount >= 3) return 'Medium';
  return 'Low';
}

/**
 * Determine overall verdict
 */
function determineVerdict(clusters: FundingCluster[], totalClusteredPercentage: number): string {
  const criticalClusters = clusters.filter(c => c.suspicionLevel === 'Critical').length;
  const highClusters = clusters.filter(c => c.suspicionLevel === 'High').length;

  if (criticalClusters > 0 || totalClusteredPercentage > 40) {
    return '🚨 HIGH MANIPULATION RISK - Multiple wallets controlled by single entity detected';
  }

  if (highClusters > 0 || totalClusteredPercentage > 25) {
    return '⚠️ MEDIUM RISK - Some clustering detected, proceed with caution';
  }

  if (totalClusteredPercentage > 10) {
    return '⚠️ LOW RISK - Minor clustering detected';
  }

  return '✅ CLEAN - No significant clustering detected';
}

/**
 * Print analysis results
 */
function printResults(
  clusters: FundingCluster[],
  totalClusteredPercentage: number,
  cexFundedPercentage: number,
  verdict: string
) {
  console.log('='.repeat(60));
  console.log('📊 ANALYSIS RESULTS');
  console.log('='.repeat(60));
  console.log();

  console.log(`Total Clustered Supply: ${totalClusteredPercentage.toFixed(2)}%`);
  console.log(`CEX-Funded Supply: ${cexFundedPercentage.toFixed(2)}%`);
  console.log();

  if (clusters.length === 0) {
    console.log('✅ No suspicious clusters detected!');
  } else {
    console.log(`Found ${clusters.length} funding clusters:\n`);

    clusters.forEach((cluster, idx) => {
      console.log(`Cluster ${idx + 1} [${cluster.suspicionLevel}]:`);
      console.log(`  Funder: ${cluster.funderAddress}`);
      console.log(`  Controls: ${cluster.holderCount} wallets`);
      console.log(`  Total Holding: ${cluster.totalPercentage.toFixed(2)}% of supply`);
      console.log(`  Holders:`);
      cluster.controlledHolders.forEach(h => {
        console.log(`    - ${h.address.substring(0, 8)}... (${h.percentage.toFixed(2)}%)`);
      });
      console.log();
    });
  }

  console.log('='.repeat(60));
  console.log(`VERDICT: ${verdict}`);
  console.log('='.repeat(60));
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

/**
 * Run from command line
 */
async function main() {
  const tokenAddress = process.argv[2];

  if (!tokenAddress) {
    console.error('Usage: ts-node clusterCheck.ts <token-address>');
    console.error('Example: ts-node clusterCheck.ts EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    process.exit(1);
  }

  try {
    const result = await analyzeTokenClusters(tokenAddress);

    // Optionally save to file
    // fs.writeFileSync('cluster-analysis.json', JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  HolderInfo,
  FundingCluster,
  ClusterAnalysisResult,
};
