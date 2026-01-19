import {
  Connection,
  PublicKey,
  ParsedAccountData,
} from '@solana/web3.js';

/**
 * Interface untuk hasil analisis cluster
 */
export interface ClusterAnalysis {
  totalClusterPercentage: number;
  verdict: 'High Manipulation Risk' | 'Medium Risk' | 'Low Risk' | 'Clean';
  clusters: FundingCluster[];
  topHolders: HolderInfo[];
  analysisTimestamp: string;
  manipulationScore: number;
}

/**
 * Interface untuk cluster funding
 */
export interface FundingCluster {
  funderAddress: string;
  controlledHolders: string[];
  totalPercentage: number;
  suspicionLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

/**
 * Interface untuk informasi holder
 */
export interface HolderInfo {
  address: string;
  balance: number;
  percentage: number;
  funderAddress: string | null;
  fundingTransaction: string | null;
}

/**
 * Kelas untuk mendeteksi insider bundling dan manipulasi
 */
export class InsiderBundlingDetector {
  private connection: Connection;
  private readonly MAX_HOLDERS_TO_ANALYZE = 20;
  private readonly RATE_LIMIT_DELAY = 250; // ms

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Fungsi utama untuk menganalisis token clusters
   */
  async analyzeTokenClusters(tokenAddress: string): Promise<ClusterAnalysis> {
    try {
      console.log(`🔍 Starting cluster analysis for token: ${tokenAddress}`);

      const mintPubkey = new PublicKey(tokenAddress);

      // Step 1: Fetch top holders
      console.log('📊 Fetching top holders...');
      const topHolders = await this.fetchTopHolders(mintPubkey);

      if (topHolders.length === 0) {
        throw new Error('No holders found for this token');
      }

      console.log(`✅ Found ${topHolders.length} top holders`);

      // Step 2: Trace funding sources untuk setiap holder
      console.log('🕵️ Tracing funding sources...');
      const holdersWithFunding = await this.traceFundingSources(topHolders);

      // Step 3: Group holders berdasarkan funding source
      console.log('🔗 Grouping into clusters...');
      const clusters = this.groupIntoClusters(holdersWithFunding);

      // Step 4: Calculate manipulation metrics
      const totalClusterPercentage = this.calculateClusterPercentage(clusters);
      const manipulationScore = this.calculateManipulationScore(clusters, holdersWithFunding);
      const verdict = this.determineVerdict(totalClusterPercentage, manipulationScore, clusters);

      console.log(`✅ Analysis complete! Manipulation score: ${manipulationScore}/100`);

      return {
        totalClusterPercentage: Math.round(totalClusterPercentage * 10) / 10,
        verdict,
        clusters,
        topHolders: holdersWithFunding,
        analysisTimestamp: new Date().toISOString(),
        manipulationScore: Math.round(manipulationScore),
      };

    } catch (error: any) {
      console.error('Cluster analysis error:', error);
      throw new Error(`Failed to analyze clusters: ${error.message}`);
    }
  }

  /**
   * Step 1: Fetch top 20 holders
   */
  private async fetchTopHolders(mintPubkey: PublicKey): Promise<HolderInfo[]> {
    try {
      // Get largest token accounts
      const largestAccounts = await this.connection.getTokenLargestAccounts(mintPubkey);

      // Get total supply untuk calculate percentage
      const mintInfo = await this.connection.getParsedAccountInfo(mintPubkey);
      let totalSupply = 0;

      if (mintInfo.value && mintInfo.value.data) {
        const data = mintInfo.value.data as ParsedAccountData;
        if (data.parsed && data.parsed.info) {
          totalSupply = parseFloat(data.parsed.info.supply);
        }
      }

      const holders: HolderInfo[] = [];

      for (let i = 0; i < Math.min(largestAccounts.value.length, this.MAX_HOLDERS_TO_ANALYZE); i++) {
        const account = largestAccounts.value[i];
        const balance = parseFloat(account.amount);
        const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

        // Get owner dari token account
        const accountInfo = await this.connection.getParsedAccountInfo(account.address);
        let ownerAddress = account.address.toBase58();

        if (accountInfo.value && accountInfo.value.data) {
          const data = accountInfo.value.data as ParsedAccountData;
          if (data.parsed && data.parsed.info && data.parsed.info.owner) {
            ownerAddress = data.parsed.info.owner;
          }
        }

        holders.push({
          address: ownerAddress,
          balance,
          percentage: Math.round(percentage * 100) / 100,
          funderAddress: null,
          fundingTransaction: null,
        });

        // Rate limiting
        await this.sleep(this.RATE_LIMIT_DELAY);
      }

      return holders;

    } catch (error) {
      console.error('Error fetching top holders:', error);
      return [];
    }
  }

  /**
   * Step 2: Trace funding source untuk setiap holder
   * Ini adalah bagian PALING KOMPLEKS - mencari transaksi pertama wallet
   */
  private async traceFundingSources(holders: HolderInfo[]): Promise<HolderInfo[]> {
    const holdersWithFunding: HolderInfo[] = [];

    for (const holder of holders) {
      try {
        const holderPubkey = new PublicKey(holder.address);

        // Ambil signature PALING LAMA (transaksi pertama)
        // Kita fetch dari belakang dengan before parameter
        const signatures = await this.connection.getSignaturesForAddress(
          holderPubkey,
          {
            limit: 1000, // Ambil banyak untuk cari yang paling lama
          },
          'confirmed'
        );

        if (signatures.length === 0) {
          holdersWithFunding.push(holder);
          continue;
        }

        // Ambil transaksi PERTAMA (index terakhir)
        const firstSignature = signatures[signatures.length - 1];

        // Fetch detail transaksi pertama
        const transaction = await this.connection.getParsedTransaction(
          firstSignature.signature,
          {
            maxSupportedTransactionVersion: 0,
          }
        );

        if (!transaction || !transaction.meta) {
          holdersWithFunding.push(holder);
          continue;
        }

        // Cari siapa yang transfer SOL ke wallet ini pertama kali
        const funderAddress = this.extractFunderFromTransaction(
          transaction,
          holder.address
        );

        holdersWithFunding.push({
          ...holder,
          funderAddress,
          fundingTransaction: firstSignature.signature,
        });

        // Rate limiting - SANGAT PENTING untuk menghindari ban
        await this.sleep(this.RATE_LIMIT_DELAY);

      } catch (error) {
        console.error(`Error tracing funding for ${holder.address}:`, error);
        holdersWithFunding.push(holder);
      }
    }

    return holdersWithFunding;
  }

  /**
   * Helper: Extract funder address dari transaksi
   */
  private extractFunderFromTransaction(
    transaction: any,
    recipientAddress: string
  ): string | null {
    try {
      if (!transaction.transaction || !transaction.meta) return null;

      const accountKeys = transaction.transaction.message.accountKeys;
      const preBalances = transaction.meta.preBalances;
      const postBalances = transaction.meta.postBalances;

      // Cari account yang balance-nya berkurang (sender)
      for (let i = 0; i < accountKeys.length; i++) {
        const preBalance = preBalances[i] || 0;
        const postBalance = postBalances[i] || 0;
        const accountKey = accountKeys[i].pubkey.toBase58();

        // Jika balance berkurang dan bukan recipient, ini adalah funder
        if (preBalance > postBalance && accountKey !== recipientAddress) {
          return accountKey;
        }
      }

      // Fallback: return fee payer (biasanya sender)
      return accountKeys[0].pubkey.toBase58();

    } catch (error) {
      return null;
    }
  }

  /**
   * Step 3: Group holders berdasarkan funder yang sama
   */
  private groupIntoClusters(holders: HolderInfo[]): FundingCluster[] {
    const clusterMap = new Map<string, HolderInfo[]>();

    // Group by funder address
    for (const holder of holders) {
      if (!holder.funderAddress) continue;

      const funder = holder.funderAddress;
      if (!clusterMap.has(funder)) {
        clusterMap.set(funder, []);
      }
      clusterMap.get(funder)!.push(holder);
    }

    // Convert to FundingCluster array
    const clusters: FundingCluster[] = [];

    for (const [funderAddress, controlledHolders] of clusterMap.entries()) {
      // Only consider clusters with 2+ holders
      if (controlledHolders.length < 2) continue;

      const totalPercentage = controlledHolders.reduce(
        (sum, holder) => sum + holder.percentage,
        0
      );

      const suspicionLevel = this.determineSuspicionLevel(
        controlledHolders.length,
        totalPercentage
      );

      clusters.push({
        funderAddress,
        controlledHolders: controlledHolders.map(h => h.address),
        totalPercentage: Math.round(totalPercentage * 10) / 10,
        suspicionLevel,
      });
    }

    // Sort by totalPercentage (descending)
    clusters.sort((a, b) => b.totalPercentage - a.totalPercentage);

    return clusters;
  }

  /**
   * Calculate total percentage yang dikuasai clusters
   */
  private calculateClusterPercentage(clusters: FundingCluster[]): number {
    return clusters.reduce((sum, cluster) => sum + cluster.totalPercentage, 0);
  }

  /**
   * Calculate manipulation score (0-100)
   */
  private calculateManipulationScore(
    clusters: FundingCluster[],
    holders: HolderInfo[]
  ): number {
    let score = 0;

    // Factor 1: Jumlah cluster yang suspicious (max 40 points)
    const criticalClusters = clusters.filter(c => c.suspicionLevel === 'Critical').length;
    const highClusters = clusters.filter(c => c.suspicionLevel === 'High').length;
    score += Math.min(criticalClusters * 20 + highClusters * 10, 40);

    // Factor 2: Total percentage dikuasai clusters (max 40 points)
    const clusterPercentage = this.calculateClusterPercentage(clusters);
    if (clusterPercentage > 50) {
      score += 40;
    } else if (clusterPercentage > 30) {
      score += 30;
    } else if (clusterPercentage > 15) {
      score += 15;
    }

    // Factor 3: Concentration di top 3 holders (max 20 points)
    const top3Percentage = holders
      .slice(0, 3)
      .reduce((sum, h) => sum + h.percentage, 0);

    if (top3Percentage > 60) {
      score += 20;
    } else if (top3Percentage > 40) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Determine suspicion level untuk cluster
   */
  private determineSuspicionLevel(
    holderCount: number,
    totalPercentage: number
  ): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (totalPercentage > 30 && holderCount >= 3) {
      return 'Critical';
    }

    if (totalPercentage > 20 || holderCount >= 5) {
      return 'High';
    }

    if (totalPercentage > 10 || holderCount >= 3) {
      return 'Medium';
    }

    return 'Low';
  }

  /**
   * Determine final verdict
   */
  private determineVerdict(
    clusterPercentage: number,
    manipulationScore: number,
    clusters: FundingCluster[]
  ): 'High Manipulation Risk' | 'Medium Risk' | 'Low Risk' | 'Clean' {
    const criticalClusters = clusters.filter(c => c.suspicionLevel === 'Critical').length;

    if (clusterPercentage > 30 || manipulationScore > 70 || criticalClusters > 0) {
      return 'High Manipulation Risk';
    }

    if (clusterPercentage > 15 || manipulationScore > 40) {
      return 'Medium Risk';
    }

    if (clusterPercentage > 5 || manipulationScore > 20) {
      return 'Low Risk';
    }

    return 'Clean';
  }

  /**
   * Helper: Sleep untuk rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * RATE LIMIT MANAGEMENT TIPS:
 *
 * 1. Public RPC (api.mainnet-beta.solana.com):
 *    - Limit: ~100 requests/10 seconds
 *    - Strategy: Delay 250ms antar request
 *
 * 2. Premium RPC (QuickNode, Alchemy, Helius):
 *    - Limit: Lebih tinggi (check provider)
 *    - Strategy: Bisa reduce delay jadi 100-150ms
 *
 * 3. Batch Processing:
 *    - Process holders dalam batch kecil (5-10)
 *    - Pause 1-2 detik antar batch
 *
 * 4. Caching:
 *    - Cache hasil analisis (TTL 5-10 menit)
 *    - Jangan re-analyze token yang sama terlalu sering
 *
 * 5. Error Handling:
 *    - Implement exponential backoff on 429 errors
 *    - Retry failed requests max 3x
 */
