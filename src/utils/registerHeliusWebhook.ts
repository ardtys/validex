/**
 * Helius Webhook Registration Helper
 *
 * Script untuk mendaftarkan token addresses ke Helius Webhook API
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '3ad61b57-e57d-4bc9-9176-cbd567b737ad';
const HELIUS_API_URL = 'https://api.helius.xyz/v0';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-domain.com/helius-webhook';

// ============================================================================
// TYPES
// ============================================================================

interface CreateWebhookRequest {
  webhookURL: string;
  transactionTypes: string[];
  accountAddresses: string[];
  webhookType: 'enhanced' | 'raw' | 'discord';
  txnStatus?: 'all' | 'success' | 'failed';
  authHeader?: string;
}

interface WebhookResponse {
  webhookID: string;
  wallet: string;
  webhookURL: string;
  transactionTypes: string[];
  accountAddresses: string[];
  webhookType: string;
}

// ============================================================================
// WEBHOOK MANAGEMENT
// ============================================================================

/**
 * Create new webhook
 */
async function createWebhook(
  accountAddresses: string[],
  transactionTypes: string[] = ['Any']
): Promise<WebhookResponse> {
  try {
    const payload: CreateWebhookRequest = {
      webhookURL: WEBHOOK_URL,
      transactionTypes,
      accountAddresses,
      webhookType: 'enhanced', // 'enhanced' gives parsed transaction data
      txnStatus: 'success', // Only monitor successful transactions
    };

    console.log('📡 Creating Helius webhook...');
    console.log('Monitoring addresses:', accountAddresses);

    const response = await axios.post(
      `${HELIUS_API_URL}/webhooks?api-key=${HELIUS_API_KEY}`,
      payload
    );

    const webhook = response.data as WebhookResponse;

    console.log('✅ Webhook created successfully!');
    console.log('Webhook ID:', webhook.webhookID);
    console.log('Webhook URL:', webhook.webhookURL);

    return webhook;

  } catch (error: any) {
    console.error('❌ Failed to create webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * List all webhooks
 */
async function listWebhooks(): Promise<WebhookResponse[]> {
  try {
    const response = await axios.get(
      `${HELIUS_API_URL}/webhooks?api-key=${HELIUS_API_KEY}`
    );

    const webhooks = response.data as WebhookResponse[];

    console.log(`📋 Found ${webhooks.length} webhooks:`);
    webhooks.forEach((webhook, idx) => {
      console.log(`\n${idx + 1}. Webhook ID: ${webhook.webhookID}`);
      console.log(`   URL: ${webhook.webhookURL}`);
      console.log(`   Addresses: ${webhook.accountAddresses.join(', ')}`);
      console.log(`   Types: ${webhook.transactionTypes.join(', ')}`);
    });

    return webhooks;

  } catch (error: any) {
    console.error('❌ Failed to list webhooks:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete webhook
 */
async function deleteWebhook(webhookID: string): Promise<void> {
  try {
    await axios.delete(
      `${HELIUS_API_URL}/webhooks/${webhookID}?api-key=${HELIUS_API_KEY}`
    );

    console.log(`✅ Webhook ${webhookID} deleted successfully`);

  } catch (error: any) {
    console.error('❌ Failed to delete webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update webhook (add/remove addresses)
 */
async function updateWebhook(
  webhookID: string,
  accountAddresses: string[]
): Promise<WebhookResponse> {
  try {
    const payload = {
      accountAddresses,
    };

    const response = await axios.put(
      `${HELIUS_API_URL}/webhooks/${webhookID}?api-key=${HELIUS_API_KEY}`,
      payload
    );

    console.log(`✅ Webhook ${webhookID} updated successfully`);
    return response.data;

  } catch (error: any) {
    console.error('❌ Failed to update webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get webhook details
 */
async function getWebhook(webhookID: string): Promise<WebhookResponse> {
  try {
    const response = await axios.get(
      `${HELIUS_API_URL}/webhooks/${webhookID}?api-key=${HELIUS_API_KEY}`
    );

    return response.data;

  } catch (error: any) {
    console.error('❌ Failed to get webhook:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================================
// CLI COMMANDS
// ============================================================================

/**
 * CLI interface
 */
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  console.log('='.repeat(60));
  console.log('🔧 Helius Webhook Manager');
  console.log('='.repeat(60));
  console.log();

  try {
    switch (command) {
      case 'create':
        if (args.length === 0) {
          console.error('❌ Usage: npm run webhook:create <token-address-1> [token-address-2] ...');
          process.exit(1);
        }
        await createWebhook(args);
        break;

      case 'list':
        await listWebhooks();
        break;

      case 'delete':
        if (args.length === 0) {
          console.error('❌ Usage: npm run webhook:delete <webhook-id>');
          process.exit(1);
        }
        await deleteWebhook(args[0]);
        break;

      case 'update':
        if (args.length < 2) {
          console.error('❌ Usage: npm run webhook:update <webhook-id> <token-address-1> [token-address-2] ...');
          process.exit(1);
        }
        await updateWebhook(args[0], args.slice(1));
        break;

      case 'get':
        if (args.length === 0) {
          console.error('❌ Usage: npm run webhook:get <webhook-id>');
          process.exit(1);
        }
        const webhook = await getWebhook(args[0]);
        console.log(JSON.stringify(webhook, null, 2));
        break;

      default:
        console.log('Available commands:');
        console.log('  create <address...>  - Create new webhook for token addresses');
        console.log('  list                 - List all webhooks');
        console.log('  delete <webhook-id>  - Delete webhook');
        console.log('  update <id> <addr...>- Update webhook addresses');
        console.log('  get <webhook-id>     - Get webhook details');
        console.log();
        console.log('Examples:');
        console.log('  npm run webhook:create EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        console.log('  npm run webhook:list');
        console.log('  npm run webhook:delete abc123');
    }

  } catch (error) {
    console.error('❌ Command failed:', error);
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
  createWebhook,
  listWebhooks,
  deleteWebhook,
  updateWebhook,
  getWebhook,
};
