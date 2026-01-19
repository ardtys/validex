/**
 * Helius DAS (Digital Asset Standard) API Integration
 *
 * Fast metadata fetching menggunakan Helius getAsset method
 * Lebih cepat daripada parsing on-chain account data manual
 *
 * Features:
 * - Token name, symbol, logo URI
 * - Mutable flag detection
 * - Collection info
 * - Cached responses untuk performance
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  logoUri: string | null;
  decimals: number;
  isMutable: boolean;
  updateAuthority: string | null;
  collection?: {
    name: string;
    family: string;
  };
  creators?: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface HeliusAssetResponse {
  interface: string;
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files?: Array<{
      uri: string;
      cdn_uri?: string;
      mime: string;
    }>;
    metadata: {
      name: string;
      symbol: string;
      description?: string;
      attributes?: any[];
    };
    links?: {
      image?: string;
      external_url?: string;
    };
  };
  authorities?: Array<{
    address: string;
    scopes: string[];
  }>;
  compression?: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    seq: number;
    leaf_id: number;
  };
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
  royalty?: {
    royalty_model: string;
    target: string | null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators?: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: string | null;
    ownership_model: string;
    owner: string;
  };
  supply?: {
    print_max_supply: number;
    print_current_supply: number;
    edition_nonce: number | null;
  };
  mutable: boolean;
  burnt: boolean;
}

// ============================================================================
// HELIUS DAS CLIENT
// ============================================================================

export class HeliusDASClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: TokenMetadata; timestamp: number }>;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string = process.env.HELIUS_API_KEY || '') {
    const baseURL = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.cache = new Map();
  }

  /**
   * Get token metadata menggunakan DAS API
   */
  async getTokenMetadata(mintAddress: string): Promise<TokenMetadata> {
    // Check cache first
    const cached = this.cache.get(mintAddress);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log(`✅ Cache hit for ${mintAddress}`);
      return cached.data;
    }

    try {
      console.log(`🔍 Fetching metadata for ${mintAddress} from Helius DAS API...`);

      // Call getAsset RPC method
      const response = await this.client.post('', {
        jsonrpc: '2.0',
        id: 'metadata-fetch',
        method: 'getAsset',
        params: {
          id: mintAddress,
          displayOptions: {
            showUnverifiedCollections: true,
            showCollectionMetadata: true,
            showGrandTotal: true,
            showFungible: true,
            showInscription: false,
          },
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error.message || 'Failed to fetch asset');
      }

      const asset: HeliusAssetResponse = response.data.result;

      // Parse metadata
      const metadata = this.parseAssetToMetadata(asset);

      // Cache result
      this.cache.set(mintAddress, {
        data: metadata,
        timestamp: Date.now(),
      });

      console.log(`✅ Metadata fetched: ${metadata.name} (${metadata.symbol})`);

      return metadata;

    } catch (error: any) {
      console.error(`❌ Failed to fetch metadata for ${mintAddress}:`, error.message);

      // Return fallback metadata
      return {
        address: mintAddress,
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        logoUri: null,
        decimals: 0,
        isMutable: false,
        updateAuthority: null,
      };
    }
  }

  /**
   * Batch get metadata untuk multiple tokens
   */
  async getTokenMetadataBatch(mintAddresses: string[]): Promise<TokenMetadata[]> {
    console.log(`📦 Fetching metadata for ${mintAddresses.length} tokens...`);

    const promises = mintAddresses.map(address => this.getTokenMetadata(address));
    const results = await Promise.allSettled(promises);

    return results.map((result, idx) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to fetch ${mintAddresses[idx]}:`, result.reason);
        return {
          address: mintAddresses[idx],
          name: 'Unknown',
          symbol: 'UNKNOWN',
          logoUri: null,
          decimals: 0,
          isMutable: false,
          updateAuthority: null,
        };
      }
    });
  }

  /**
   * Parse Helius asset response to our metadata format
   */
  private parseAssetToMetadata(asset: HeliusAssetResponse): TokenMetadata {
    // Extract basic info
    const name = asset.content?.metadata?.name || 'Unknown Token';
    const symbol = asset.content?.metadata?.symbol || 'UNKNOWN';

    // Get logo URI
    let logoUri: string | null = null;
    if (asset.content?.links?.image) {
      logoUri = asset.content.links.image;
    } else if (asset.content?.files && asset.content.files.length > 0) {
      logoUri = asset.content.files[0].cdn_uri || asset.content.files[0].uri;
    }

    // Get update authority
    const updateAuthority = asset.authorities?.find(
      auth => auth.scopes.includes('full')
    )?.address || null;

    // Parse collection info
    let collection: TokenMetadata['collection'] | undefined;
    if (asset.grouping && asset.grouping.length > 0) {
      const collectionGroup = asset.grouping.find(g => g.group_key === 'collection');
      if (collectionGroup) {
        collection = {
          name: collectionGroup.group_value,
          family: 'Unknown',
        };
      }
    }

    // Parse attributes
    let attributes: TokenMetadata['attributes'] | undefined;
    if (asset.content?.metadata?.attributes) {
      attributes = asset.content.metadata.attributes;
    }

    return {
      address: asset.id,
      name: name.replace(/\0/g, '').trim(),
      symbol: symbol.replace(/\0/g, '').trim(),
      logoUri,
      decimals: 0, // DAS API doesn't provide decimals directly, need to fetch from mint
      isMutable: asset.mutable,
      updateAuthority,
      collection,
      creators: asset.creators,
      attributes,
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ Cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let heliusClient: HeliusDASClient | null = null;

/**
 * Get singleton Helius DAS client instance
 */
export function getHeliusDASClient(apiKey?: string): HeliusDASClient {
  if (!heliusClient) {
    heliusClient = new HeliusDASClient(apiKey);
  }
  return heliusClient;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick function to get token metadata
 */
export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata> {
  const client = getHeliusDASClient();
  return client.getTokenMetadata(mintAddress);
}

/**
 * Quick function to get multiple token metadata
 */
export async function getTokenMetadataBatch(mintAddresses: string[]): Promise<TokenMetadata[]> {
  const client = getHeliusDASClient();
  return client.getTokenMetadataBatch(mintAddresses);
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

/**
 * Test CLI
 */
async function main() {
  const mintAddress = process.argv[2];

  if (!mintAddress) {
    console.error('Usage: ts-node heliusMetadata.ts <mint-address>');
    console.error('Example: ts-node heliusMetadata.ts EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    process.exit(1);
  }

  try {
    console.log('='.repeat(60));
    console.log('🔍 Helius DAS API - Token Metadata Fetcher');
    console.log('='.repeat(60));
    console.log();

    const metadata = await getTokenMetadata(mintAddress);

    console.log('\n' + '='.repeat(60));
    console.log('📊 TOKEN METADATA');
    console.log('='.repeat(60));
    console.log();
    console.log(`Name: ${metadata.name}`);
    console.log(`Symbol: ${metadata.symbol}`);
    console.log(`Address: ${metadata.address}`);
    console.log(`Logo URI: ${metadata.logoUri || 'N/A'}`);
    console.log(`Mutable: ${metadata.isMutable ? 'YES ⚠️' : 'NO ✅'}`);
    console.log(`Update Authority: ${metadata.updateAuthority || 'N/A'}`);

    if (metadata.collection) {
      console.log(`\nCollection: ${metadata.collection.name}`);
    }

    if (metadata.creators && metadata.creators.length > 0) {
      console.log('\nCreators:');
      metadata.creators.forEach(creator => {
        console.log(`  - ${creator.address} (${creator.share}%) ${creator.verified ? '✓' : '✗'}`);
      });
    }

    if (metadata.attributes && metadata.attributes.length > 0) {
      console.log('\nAttributes:');
      metadata.attributes.forEach(attr => {
        console.log(`  - ${attr.trait_type}: ${attr.value}`);
      });
    }

    console.log('\n' + '='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Failed to fetch metadata:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
