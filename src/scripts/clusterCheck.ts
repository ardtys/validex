#!/usr/bin/env ts-node

/**
 * Cluster Check CLI Runner
 *
 * This script wraps the cluster analysis utility
 * Run: npm run cluster-check <token-address>
 */

import { analyzeTokenClusters } from '../utils/clusterCheck';

async function main() {
  const tokenAddress = process.argv[2];

  if (!tokenAddress) {
    console.error('❌ Usage: npm run cluster-check <token-address>');
    console.error('Example: npm run cluster-check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    process.exit(1);
  }

  try {
    const result = await analyzeTokenClusters(tokenAddress);

    // Optionally save to file
    // import fs from 'fs';
    // fs.writeFileSync(
    //   `cluster-analysis-${tokenAddress}.json`,
    //   JSON.stringify(result, null, 2)
    // );

  } catch (error: any) {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

main();
