import {
  Connection,
  PublicKey,
  ParsedAccountData,
} from '@solana/web3.js';
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  AuditResult,
  AuthorityStatus,
  RiskLevel,
  TokenInfo,
} from '../types';

/**
 * Kelas utama untuk audit keamanan token Solana
 */
export class SolanaTokenAuditor {
  private connection: Connection;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Fungsi utama untuk melakukan audit lengkap pada token
   */
  async auditToken(tokenAddress: string): Promise<AuditResult> {
    try {
      const mintPublicKey = new PublicKey(tokenAddress);

      // 1. Ambil informasi mint account
      const mintInfo = await getMint(
        this.connection,
        mintPublicKey,
        'confirmed',
        TOKEN_PROGRAM_ID
      );

      // 2. Cek authority status
      const authorityStatus = this.checkAuthorities(mintInfo);

      // 3. Ambil metadata dari Metaplex
      const metadata = await this.getTokenMetadata(mintPublicKey);

      // 4. Hitung risk score
      const { riskScore, warnings } = this.calculateRiskScore(
        authorityStatus,
        metadata?.isMutable || false
      );

      // 5. Tentukan risk level
      const riskLevel = this.determineRiskLevel(riskScore);

      // 6. Susun informasi token
      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        name: metadata?.data.name.replace(/\0/g, '').trim() || 'Unknown',
        symbol: metadata?.data.symbol.replace(/\0/g, '').trim() || 'Unknown',
        decimals: mintInfo.decimals,
        totalSupply: (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toFixed(mintInfo.decimals),
        metadataUri: metadata?.data.uri.replace(/\0/g, '').trim() || 'No metadata',
      };

      return {
        tokenInfo,
        authorityStatus,
        metadataIsMutable: metadata?.isMutable || false,
        riskScore,
        riskLevel,
        warnings,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.message.includes('Invalid public key')) {
        throw new Error('Invalid token address format');
      }
      if (error.message.includes('could not find account')) {
        throw new Error('Token account not found. Please check the address.');
      }
      throw new Error(`Audit failed: ${error.message}`);
    }
  }

  /**
   * Cek status Mint Authority dan Freeze Authority
   */
  private checkAuthorities(mintInfo: any): AuthorityStatus {
    const mintAuthority = mintInfo.mintAuthority;
    const freezeAuthority = mintInfo.freezeAuthority;

    return {
      mintAuthority: {
        active: mintAuthority !== null,
        address: mintAuthority ? mintAuthority.toBase58() : null,
      },
      freezeAuthority: {
        active: freezeAuthority !== null,
        address: freezeAuthority ? freezeAuthority.toBase58() : null,
      },
    };
  }

  /**
   * Ambil metadata token menggunakan Metaplex
   */
  private async getTokenMetadata(mintPublicKey: PublicKey): Promise<any | null> {
    try {
      // Derive metadata PDA (Program Derived Address)
      const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
        'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
      );

      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPublicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const accountInfo = await this.connection.getAccountInfo(metadataPDA);

      if (!accountInfo) {
        return null;
      }

      // Deserialize metadata
      const metadata = Metadata.deserialize(accountInfo.data);

      return metadata[0];
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  /**
   * Hitung risk score berdasarkan parameter keamanan
   */
  private calculateRiskScore(
    authorityStatus: AuthorityStatus,
    isMutable: boolean
  ): { riskScore: number; warnings: string[] } {
    let score = 100;
    const warnings: string[] = [];

    // Kurangi 50 poin jika Mint Authority aktif
    if (authorityStatus.mintAuthority.active) {
      score -= 50;
      warnings.push(
        '⚠️ WARNING: Mint Authority is active - Developer can mint unlimited new tokens!'
      );
      warnings.push(
        `   Address: ${authorityStatus.mintAuthority.address}`
      );
    } else {
      warnings.push('✅ SAFE: Mint Authority has been revoked');
    }

    // Kurangi 20 poin jika Freeze Authority aktif
    if (authorityStatus.freezeAuthority.active) {
      score -= 20;
      warnings.push(
        '⚠️ CAUTION: Freeze Authority is active - Developer can freeze token accounts'
      );
      warnings.push(
        `   Address: ${authorityStatus.freezeAuthority.address}`
      );
    } else {
      warnings.push('✅ SAFE: Freeze Authority has been revoked');
    }

    // Kurangi 10 poin jika Metadata Mutable
    if (isMutable) {
      score -= 10;
      warnings.push(
        '⚠️ NOTICE: Metadata is mutable - Token name/symbol/image can be changed'
      );
    } else {
      warnings.push('✅ SAFE: Metadata is immutable');
    }

    // Pastikan score tidak negatif
    score = Math.max(0, score);

    return { riskScore: score, warnings };
  }

  /**
   * Tentukan risk level berdasarkan score
   */
  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 80) {
      return 'Safe';
    } else if (score >= 50) {
      return 'Caution';
    } else {
      return 'Rug Pull Risk';
    }
  }

  /**
   * Validasi apakah string adalah alamat Solana yang valid
   */
  static isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}
