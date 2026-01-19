import { PublicKey } from '@solana/web3.js';

/**
 * Level risiko token
 */
export type RiskLevel = 'Safe' | 'Caution' | 'Rug Pull Risk';

/**
 * Status authority (apakah masih aktif atau sudah di-revoke)
 */
export interface AuthorityStatus {
  mintAuthority: {
    active: boolean;
    address: string | null;
  };
  freezeAuthority: {
    active: boolean;
    address: string | null;
  };
}

/**
 * Informasi metadata token
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  isMutable: boolean;
}

/**
 * Informasi supply token
 */
export interface TokenSupply {
  totalSupply: string;
  decimals: number;
}

/**
 * Informasi lengkap tentang token
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  metadataUri: string;
}

/**
 * Hasil audit lengkap
 */
export interface AuditResult {
  tokenInfo: TokenInfo;
  authorityStatus: AuthorityStatus;
  metadataIsMutable: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  warnings: string[];
  timestamp: string;
}

/**
 * Request body untuk API
 */
export interface AuditRequest {
  tokenAddress: string;
}

/**
 * Response error API
 */
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}
