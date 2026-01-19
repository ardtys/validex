import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  ConfirmedSignatureInfo,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * Interface untuk hasil analisis developer
 */
export interface DeveloperAnalysis {
  deployerAddress: string;
  tokensCreatedCount: number;
  ruggedCount: number;
  suspiciousCount: number;
  winRate: number;
  riskLevel: 'Serial Scammer' | 'High Risk' | 'Medium Risk' | 'Clean' | 'Unknown';
  pastTokens: PastTokenInfo[];
  analysisTimestamp: string;
}

/**
 * Interface untuk informasi token masa lalu
 */
export interface PastTokenInfo {
  tokenAddress: string;
  createdAt: string;
  status: 'Active' | 'Likely Rugged' | 'Suspicious' | 'Unknown';
  liquidityEstimate?: number;
  ageInDays: number;
}

/**
 * Kelas untuk melacak dan menganalisis developer/deployer wallet
 */
export class DeveloperTracker {
  private connection: Connection;
  private readonly PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
  private readonly TOKEN_PROGRAM = TOKEN_PROGRAM_ID;
  private readonly RAYDIUM_PROGRAM = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Fungsi utama untuk menganalisis developer
   */
  async analyzeDeveloper(tokenAddress: string): Promise<DeveloperAnalysis> {
    try {
      console.log(`🔍 Starting developer analysis for token: ${tokenAddress}`);

      // Step 1: Find deployer wallet
      const deployerAddress = await this.findDeployer(tokenAddress);

      if (!deployerAddress) {
        throw new Error('Could not identify token deployer');
      }

      console.log(`✅ Deployer identified: ${deployerAddress}`);

      // Step 2: Scan past deployments
      const pastTokens = await this.scanPastDeployments(deployerAddress);

      console.log(`📊 Found ${pastTokens.length} past token deployments`);

      // Step 3: Analyze each token for rug pull indicators
      const analyzedTokens = await this.analyzeTokenStatus(pastTokens);

      // Step 4: Calculate statistics
      const ruggedCount = analyzedTokens.filter(t => t.status === 'Likely Rugged').length;
      const suspiciousCount = analyzedTokens.filter(t => t.status === 'Suspicious').length;
      const activeCount = analyzedTokens.filter(t => t.status === 'Active').length;
      const totalTokens = analyzedTokens.length;

      const winRate = totalTokens > 0 ? (activeCount / totalTokens) * 100 : 0;
      const riskLevel = this.determineRiskLevel(ruggedCount, suspiciousCount, totalTokens, winRate);

      return {
        deployerAddress,
        tokensCreatedCount: totalTokens,
        ruggedCount,
        suspiciousCount,
        winRate: Math.round(winRate * 10) / 10,
        riskLevel,
        pastTokens: analyzedTokens,
        analysisTimestamp: new Date().toISOString(),
      };

    } catch (error: any) {
      console.error('Developer analysis error:', error);
      throw new Error(`Failed to analyze developer: ${error.message}`);
    }
  }

  /**
   * Step 1: Menemukan alamat deployer dari token address
   */
  private async findDeployer(tokenAddress: string): Promise<string | null> {
    try {
      const mintPubkey = new PublicKey(tokenAddress);

      // Cari semua signature untuk mint account ini
      const signatures = await this.connection.getSignaturesForAddress(
        mintPubkey,
        { limit: 100 }, // Ambil 100 transaksi terakhir
        'confirmed'
      );

      if (signatures.length === 0) {
        return null;
      }

      // Ambil transaksi PERTAMA (creation transaction) - yang paling lama
      const firstSignature = signatures[signatures.length - 1];

      // Fetch detail transaksi
      const transaction = await this.connection.getParsedTransaction(
        firstSignature.signature,
        {
          maxSupportedTransactionVersion: 0,
        }
      );

      if (!transaction || !transaction.transaction) {
        return null;
      }

      // Deployer adalah fee payer (yang membayar transaksi)
      const feePayer = transaction.transaction.message.accountKeys[0].pubkey.toBase58();

      return feePayer;

    } catch (error) {
      console.error('Error finding deployer:', error);
      return null;
    }
  }

  /**
   * Step 2: Scan riwayat deployment token oleh wallet ini
   */
  private async scanPastDeployments(deployerAddress: string): Promise<PastTokenInfo[]> {
    try {
      const deployerPubkey = new PublicKey(deployerAddress);
      const pastTokens: PastTokenInfo[] = [];

      // Ambil riwayat transaksi deployer (batch untuk menghindari rate limit)
      const signatures = await this.connection.getSignaturesForAddress(
        deployerPubkey,
        { limit: 1000 }, // Limit untuk menghindari rate limit
        'confirmed'
      );

      console.log(`📜 Scanning ${signatures.length} transactions...`);

      // Process dalam batch untuk menghindari rate limit
      const batchSize = 10;
      for (let i = 0; i < Math.min(signatures.length, 100); i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);

        const transactions = await Promise.all(
          batch.map(sig =>
            this.connection.getParsedTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0,
            }).catch(() => null)
          )
        );

        for (let j = 0; j < transactions.length; j++) {
          const tx = transactions[j];
          const sig = batch[j];

          if (!tx || !tx.meta) continue;

          // Cek apakah transaksi ini adalah pembuatan token baru
          const isTokenCreation = this.isTokenCreationTransaction(tx);

          if (isTokenCreation) {
            // Extract token address dari transaksi
            const tokenAddress = this.extractTokenAddressFromTransaction(tx);

            if (tokenAddress) {
              const ageInDays = Math.floor(
                (Date.now() - (sig.blockTime || 0) * 1000) / (1000 * 60 * 60 * 24)
              );

              pastTokens.push({
                tokenAddress,
                createdAt: new Date((sig.blockTime || 0) * 1000).toISOString(),
                status: 'Unknown',
                ageInDays,
              });
            }
          }
        }

        // Sleep untuk menghindari rate limit
        if (i + batchSize < signatures.length) {
          await this.sleep(200); // 200ms delay
        }
      }

      return pastTokens;

    } catch (error) {
      console.error('Error scanning past deployments:', error);
      return [];
    }
  }

  /**
   * Step 3: Analyze status setiap token (Active / Rugged / Suspicious)
   */
  private async analyzeTokenStatus(tokens: PastTokenInfo[]): Promise<PastTokenInfo[]> {
    const analyzedTokens: PastTokenInfo[] = [];

    // Process dalam batch kecil
    const batchSize = 5;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      const analyzed = await Promise.all(
        batch.map(async (token) => {
          try {
            // Cek apakah mint account masih ada
            const mintPubkey = new PublicKey(token.tokenAddress);
            const accountInfo = await this.connection.getAccountInfo(mintPubkey);

            if (!accountInfo) {
              return {
                ...token,
                status: 'Likely Rugged' as const,
              };
            }

            // Estimasi liquidity dengan mengecek token accounts
            const largestAccounts = await this.connection.getTokenLargestAccounts(mintPubkey);

            let totalBalance = 0;
            for (const account of largestAccounts.value) {
              totalBalance += Number(account.amount);
            }

            // Simple heuristic: jika balance sangat rendah, kemungkinan rugged
            const status = this.determineTokenStatus(totalBalance, token.ageInDays);

            return {
              ...token,
              status,
              liquidityEstimate: totalBalance,
            };

          } catch (error) {
            return {
              ...token,
              status: 'Unknown' as const,
            };
          }
        })
      );

      analyzedTokens.push(...analyzed);

      // Sleep untuk rate limit
      if (i + batchSize < tokens.length) {
        await this.sleep(300);
      }
    }

    return analyzedTokens;
  }

  /**
   * Helper: Cek apakah transaksi adalah token creation
   */
  private isTokenCreationTransaction(tx: ParsedTransactionWithMeta): boolean {
    if (!tx.transaction || !tx.transaction.message) return false;

    const instructions = tx.transaction.message.instructions;

    // Cek apakah ada instruksi initializeMint atau createToken
    for (const instruction of instructions) {
      if ('parsed' in instruction) {
        const parsed = instruction.parsed;
        if (
          parsed.type === 'initializeMint' ||
          parsed.type === 'initializeMint2' ||
          (parsed.info && parsed.info.mint)
        ) {
          return true;
        }
      }

      // Cek interaksi dengan Pump.fun atau program token lainnya
      if ('programId' in instruction) {
        const programId = instruction.programId.toBase58();
        if (
          programId === this.TOKEN_PROGRAM.toBase58() ||
          programId === this.PUMP_FUN_PROGRAM.toBase58()
        ) {
          // Ini mungkin token creation
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Helper: Extract token address dari transaksi
   */
  private extractTokenAddressFromTransaction(tx: ParsedTransactionWithMeta): string | null {
    if (!tx.transaction || !tx.transaction.message) return null;

    const instructions = tx.transaction.message.instructions;

    for (const instruction of instructions) {
      if ('parsed' in instruction) {
        const parsed = instruction.parsed;

        // Cek untuk initializeMint
        if (parsed.type === 'initializeMint' || parsed.type === 'initializeMint2') {
          return parsed.info?.mint || null;
        }
      }
    }

    // Fallback: cek dari post token balances
    if (tx.meta?.postTokenBalances && tx.meta.postTokenBalances.length > 0) {
      return tx.meta.postTokenBalances[0].mint;
    }

    return null;
  }

  /**
   * Helper: Tentukan status token berdasarkan balance dan umur
   */
  private determineTokenStatus(
    balance: number,
    ageInDays: number
  ): 'Active' | 'Likely Rugged' | 'Suspicious' {
    // Jika balance sangat rendah dan token sudah lama, kemungkinan rugged
    if (balance < 1000 && ageInDays > 7) {
      return 'Likely Rugged';
    }

    // Jika balance rendah tapi token masih baru, suspicious
    if (balance < 10000 && ageInDays > 2) {
      return 'Suspicious';
    }

    return 'Active';
  }

  /**
   * Helper: Tentukan risk level developer
   */
  private determineRiskLevel(
    ruggedCount: number,
    suspiciousCount: number,
    totalTokens: number,
    winRate: number
  ): 'Serial Scammer' | 'High Risk' | 'Medium Risk' | 'Clean' | 'Unknown' {
    if (totalTokens === 0) return 'Unknown';

    const rugRate = (ruggedCount / totalTokens) * 100;

    if (rugRate > 70 || (ruggedCount >= 3 && winRate < 20)) {
      return 'Serial Scammer';
    }

    if (rugRate > 40 || (ruggedCount >= 2 && winRate < 40)) {
      return 'High Risk';
    }

    if (rugRate > 20 || suspiciousCount > ruggedCount) {
      return 'Medium Risk';
    }

    if (winRate > 60 && ruggedCount === 0) {
      return 'Clean';
    }

    return 'Medium Risk';
  }

  /**
   * Helper: Sleep utility untuk rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
