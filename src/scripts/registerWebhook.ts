#!/usr/bin/env ts-node

/**
 * Webhook Registration CLI Runner
 *
 * This script wraps the webhook registration utility
 * Run: npm run register-webhook <command> [args...]
 */

import {
  createWebhook,
  listWebhooks,
  deleteWebhook,
  updateWebhook,
  getWebhook,
} from '../utils/registerHeliusWebhook';

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
          console.error('❌ Usage: npm run register-webhook create <token-address-1> [token-address-2] ...');
          process.exit(1);
        }
        await createWebhook(args);
        break;

      case 'list':
        await listWebhooks();
        break;

      case 'delete':
        if (args.length === 0) {
          console.error('❌ Usage: npm run register-webhook delete <webhook-id>');
          process.exit(1);
        }
        await deleteWebhook(args[0]);
        break;

      case 'update':
        if (args.length < 2) {
          console.error('❌ Usage: npm run register-webhook update <webhook-id> <token-address-1> [token-address-2] ...');
          process.exit(1);
        }
        await updateWebhook(args[0], args.slice(1));
        break;

      case 'get':
        if (args.length === 0) {
          console.error('❌ Usage: npm run register-webhook get <webhook-id>');
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
        console.log('  npm run register-webhook create EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        console.log('  npm run register-webhook list');
        console.log('  npm run register-webhook delete abc123');
    }

  } catch (error: any) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

main();
