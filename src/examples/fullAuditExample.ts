/**
 * Full Audit Example
 *
 * Demonstrates complete audit workflow using all Helius features:
 * 1. Fetch token metadata (DAS API)
 * 2. Analyze holder clusters
 * 3. Setup real-time monitoring
 *
 * Usage: ts-node src/examples/fullAuditExample.ts <token-address>
 */

import dotenv from 'dotenv';
import { getTokenMetadata } from '../services/heliusMetadata';
import { analyzeTokenClusters } from '../utils/clusterCheck';
import { registerTokenAlert } from '../services/heliusWebhook';
import { createWebhook } from '../utils/registerHeliusWebhook';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const USER_EMAIL = process.env.ALERT_EMAIL || 'admin@example.com';

// ============================================================================
// MAIN AUDIT WORKFLOW
// ============================================================================

async function performFullAudit(tokenAddress: string) {
  console.log('='.repeat(70));
  console.log('🔍 FULL TOKEN AUDIT - Powered by Helius');
  console.log('='.repeat(70));
  console.log(`Token Address: ${tokenAddress}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log();

  // ============================================================================
  // STEP 1: FETCH TOKEN METADATA
  // ============================================================================

  console.log('📊 Step 1/3: Fetching Token Metadata via Helius DAS API...');
  console.log('-'.repeat(70));

  const metadata = await getTokenMetadata(tokenAddress);

  console.log(`✅ Token: ${metadata.name} (${metadata.symbol})`);
  console.log(`   Logo: ${metadata.logoUri || 'N/A'}`);
  console.log(`   Mutable: ${metadata.isMutable ? '⚠️ YES (RISK)' : '✅ NO'}`);
  console.log(`   Update Authority: ${metadata.updateAuthority || 'N/A'}`);
  console.log();

  // ============================================================================
  // STEP 2: HOLDER CLUSTER ANALYSIS
  // ============================================================================

  console.log('🔍 Step 2/3: Analyzing Holder Clusters (Top 20)...');
  console.log('-'.repeat(70));

  const clusterAnalysis = await analyzeTokenClusters(tokenAddress);

  console.log(`✅ Analysis Complete:`);
  console.log(`   Total Clusters: ${clusterAnalysis.clusters.length}`);
  console.log(`   Clustered Supply: ${clusterAnalysis.totalClusteredPercentage}%`);
  console.log(`   CEX-Funded Supply: ${clusterAnalysis.cexFundedPercentage}%`);
  console.log(`   Verdict: ${clusterAnalysis.verdict}`);
  console.log();

  // Print top cluster
  if (clusterAnalysis.clusters.length > 0) {
    const topCluster = clusterAnalysis.clusters[0];
    console.log(`   🚨 Top Cluster [${topCluster.suspicionLevel}]:`);
    console.log(`      Funder: ${topCluster.funderAddress.substring(0, 20)}...`);
    console.log(`      Controls: ${topCluster.holderCount} wallets`);
    console.log(`      Total Holding: ${topCluster.totalPercentage}%`);
    console.log();
  }

  // ============================================================================
  // STEP 3: SETUP REAL-TIME MONITORING
  // ============================================================================

  console.log('📡 Step 3/3: Setting Up Real-time Monitoring...');
  console.log('-'.repeat(70));

  try {
    // Register webhook with Helius (only if not already registered)
    console.log('   Registering webhook with Helius...');
    const webhook = await createWebhook([tokenAddress]);
    console.log(`   ✅ Webhook created: ${webhook.webhookID}`);

    // Configure alert settings
    console.log('   Configuring alert settings...');
    registerTokenAlert({
      tokenAddress,
      tokenName: metadata.name,
      tokenSymbol: metadata.symbol,
      userEmail: USER_EMAIL,
      alertTypes: {
        mintAuthority: true,    // Critical: Alert on mint authority changes
        freezeAuthority: true,  // High: Alert on freeze authority changes
        largeMint: true,        // High: Alert on large mints
      },
    });
    console.log(`   ✅ Alert configured for ${USER_EMAIL}`);

  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('   ⚠️ Webhook already exists - skipping registration');

      // Still register alert config
      registerTokenAlert({
        tokenAddress,
        tokenName: metadata.name,
        tokenSymbol: metadata.symbol,
        userEmail: USER_EMAIL,
        alertTypes: {
          mintAuthority: true,
          freezeAuthority: true,
          largeMint: true,
        },
      });
      console.log(`   ✅ Alert configured for ${USER_EMAIL}`);

    } else {
      console.error('   ❌ Failed to setup monitoring:', error.message);
    }
  }

  console.log();

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================

  console.log('='.repeat(70));
  console.log('📋 AUDIT SUMMARY');
  console.log('='.repeat(70));

  // Calculate risk score
  let riskScore = 0;
  let riskFactors: string[] = [];

  // Risk Factor 1: Mutable metadata
  if (metadata.isMutable) {
    riskScore += 20;
    riskFactors.push('Mutable metadata (can be changed by developer)');
  }

  // Risk Factor 2: Update authority exists
  if (metadata.updateAuthority && metadata.updateAuthority !== '11111111111111111111111111111111') {
    riskScore += 15;
    riskFactors.push('Update authority exists (developer can update metadata)');
  }

  // Risk Factor 3: High cluster concentration
  if (clusterAnalysis.totalClusteredPercentage > 40) {
    riskScore += 35;
    riskFactors.push(`High cluster concentration (${clusterAnalysis.totalClusteredPercentage}% controlled by few entities)`);
  } else if (clusterAnalysis.totalClusteredPercentage > 25) {
    riskScore += 20;
    riskFactors.push(`Medium cluster concentration (${clusterAnalysis.totalClusteredPercentage}%)`);
  }

  // Risk Factor 4: Critical clusters
  const criticalClusters = clusterAnalysis.clusters.filter(c => c.suspicionLevel === 'Critical').length;
  if (criticalClusters > 0) {
    riskScore += 30;
    riskFactors.push(`${criticalClusters} critical cluster(s) detected`);
  }

  // Risk level
  let riskLevel = 'LOW';
  let riskEmoji = '✅';

  if (riskScore >= 70) {
    riskLevel = 'CRITICAL';
    riskEmoji = '🚨';
  } else if (riskScore >= 50) {
    riskLevel = 'HIGH';
    riskEmoji = '⚠️';
  } else if (riskScore >= 30) {
    riskLevel = 'MEDIUM';
    riskEmoji = '⚠️';
  }

  console.log(`${riskEmoji} RISK LEVEL: ${riskLevel} (Score: ${riskScore}/100)`);
  console.log();

  if (riskFactors.length > 0) {
    console.log('Risk Factors:');
    riskFactors.forEach((factor, idx) => {
      console.log(`   ${idx + 1}. ${factor}`);
    });
  } else {
    console.log('✅ No significant risk factors detected');
  }

  console.log();
  console.log('Real-time Monitoring: ACTIVE ✅');
  console.log(`Email Alerts: ${USER_EMAIL}`);
  console.log();
  console.log('='.repeat(70));
  console.log('🎉 Audit Complete!');
  console.log('='.repeat(70));

  // Return full audit result
  return {
    metadata,
    clusterAnalysis,
    riskScore,
    riskLevel,
    riskFactors,
    monitoringActive: true,
  };
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
  const tokenAddress = process.argv[2];

  if (!tokenAddress) {
    console.error('❌ Usage: ts-node src/examples/fullAuditExample.ts <token-address>');
    console.error('Example: ts-node src/examples/fullAuditExample.ts EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    process.exit(1);
  }

  try {
    const result = await performFullAudit(tokenAddress);

    // Optionally save to file
    // import fs from 'fs';
    // fs.writeFileSync(
    //   `audit-report-${tokenAddress}.json`,
    //   JSON.stringify(result, null, 2)
    // );

  } catch (error: any) {
    console.error('\n❌ Audit failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { performFullAudit };
