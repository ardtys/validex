/**
 * Helius Webhook Handler
 * Real-time monitoring untuk detecting malicious token changes
 *
 * Features:
 * - Detect SetAuthority changes (Mint/Freeze)
 * - Detect large MintTo operations
 * - Webhook signature verification
 * - Instant email alerts
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// ============================================================================
// TYPES
// ============================================================================

interface HeliusWebhookPayload {
  timestamp: number;
  slot: number;
  signature: string;
  type: string;
  description: string;
  accountData?: any[];
  instructions?: HeliusInstruction[];
  nativeTransfers?: any[];
  tokenTransfers?: any[];
  events?: any;
  source: string;
}

interface HeliusInstruction {
  programId: string;
  accounts: string[];
  data: string;
  innerInstructions?: any[];
  parsed?: {
    type: string;
    info: any;
  };
}

interface AlertConfig {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  userEmail: string;
  alertTypes: {
    mintAuthority: boolean;
    freezeAuthority: boolean;
    largeMint: boolean;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const HELIUS_WEBHOOK_SECRET = process.env.HELIUS_WEBHOOK_SECRET || '';
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// In-memory alert configs (in production, use database)
const alertConfigs = new Map<string, AlertConfig>();

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verify Helius webhook signature untuk security
 */
function verifyHeliusSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================================================
// TRANSACTION ANALYSIS
// ============================================================================

/**
 * Parse SetAuthority instruction
 */
function parseSetAuthorityInstruction(instruction: HeliusInstruction): {
  authorityType: 'MintTokens' | 'FreezeAccount' | 'AccountOwner' | 'CloseAccount' | null;
  currentAuthority: string | null;
  newAuthority: string | null;
  account: string;
} | null {
  // Check if this is Token Program instruction
  if (instruction.programId !== TOKEN_PROGRAM_ID) {
    return null;
  }

  // Check if parsed data available
  if (instruction.parsed?.type === 'setAuthority') {
    const info = instruction.parsed.info;

    return {
      authorityType: info.authorityType,
      currentAuthority: info.authority || null,
      newAuthority: info.newAuthority || null,
      account: info.account || info.mint,
    };
  }

  // Fallback: parse raw instruction data
  // SetAuthority instruction structure:
  // [0]: instruction discriminator (6 for SetAuthority)
  // [1]: authority type (0=MintTokens, 1=FreezeAccount, etc)
  // [2-33]: current authority (optional)
  // [34-65]: new authority (optional)

  try {
    const data = Buffer.from(instruction.data, 'base64');

    if (data[0] === 6) { // SetAuthority discriminator
      const authorityTypeMap = {
        0: 'MintTokens' as const,
        1: 'FreezeAccount' as const,
        2: 'AccountOwner' as const,
        3: 'CloseAccount' as const,
      };

      const authorityType = authorityTypeMap[data[1] as keyof typeof authorityTypeMap] || null;

      return {
        authorityType,
        currentAuthority: null, // Would need to decode from data
        newAuthority: null,
        account: instruction.accounts[0] || '',
      };
    }
  } catch (error) {
    console.error('Error parsing SetAuthority instruction:', error);
  }

  return null;
}

/**
 * Parse MintTo instruction
 */
function parseMintToInstruction(instruction: HeliusInstruction): {
  mint: string;
  destination: string;
  amount: number;
  authority: string;
} | null {
  if (instruction.programId !== TOKEN_PROGRAM_ID) {
    return null;
  }

  if (instruction.parsed?.type === 'mintTo') {
    const info = instruction.parsed.info;

    return {
      mint: info.mint,
      destination: info.account,
      amount: parseFloat(info.amount || '0'),
      authority: info.mintAuthority,
    };
  }

  return null;
}

/**
 * Analyze transaction for dangerous patterns
 */
function analyzeTransaction(
  payload: HeliusWebhookPayload,
  config: AlertConfig
): {
  alerts: Array<{
    type: 'MINT_AUTHORITY_CHANGED' | 'FREEZE_AUTHORITY_CHANGED' | 'LARGE_MINT' | 'UNKNOWN';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    message: string;
    details: any;
  }>;
} {
  const alerts: any[] = [];

  if (!payload.instructions) {
    return { alerts };
  }

  // Check each instruction
  for (const instruction of payload.instructions) {
    // 1. Check for SetAuthority changes
    const setAuthority = parseSetAuthorityInstruction(instruction);

    if (setAuthority) {
      // CRITICAL: Mint Authority changed
      if (
        setAuthority.authorityType === 'MintTokens' &&
        config.alertTypes.mintAuthority
      ) {
        // Check if authority was set to a new address (not revoked)
        if (setAuthority.newAuthority && setAuthority.newAuthority !== '11111111111111111111111111111111') {
          alerts.push({
            type: 'MINT_AUTHORITY_CHANGED',
            severity: 'CRITICAL',
            message: `🚨 CRITICAL: Mint Authority has been SET to a new address! Developer can now mint unlimited tokens.`,
            details: {
              mint: setAuthority.account,
              newAuthority: setAuthority.newAuthority,
              transaction: payload.signature,
            },
          });
        }
      }

      // HIGH: Freeze Authority changed
      if (
        setAuthority.authorityType === 'FreezeAccount' &&
        config.alertTypes.freezeAuthority
      ) {
        if (setAuthority.newAuthority && setAuthority.newAuthority !== '11111111111111111111111111111111') {
          alerts.push({
            type: 'FREEZE_AUTHORITY_CHANGED',
            severity: 'HIGH',
            message: `⚠️ WARNING: Freeze Authority has been SET! Developer can freeze token accounts.`,
            details: {
              mint: setAuthority.account,
              newAuthority: setAuthority.newAuthority,
              transaction: payload.signature,
            },
          });
        }
      }
    }

    // 2. Check for large MintTo operations
    const mintTo = parseMintToInstruction(instruction);

    if (mintTo && config.alertTypes.largeMint) {
      // Define "large" as > 1 million tokens (adjust based on token decimals)
      const LARGE_MINT_THRESHOLD = 1_000_000;

      if (mintTo.amount > LARGE_MINT_THRESHOLD) {
        alerts.push({
          type: 'LARGE_MINT',
          severity: 'HIGH',
          message: `⚠️ WARNING: Large token mint detected! ${mintTo.amount.toLocaleString()} tokens minted.`,
          details: {
            mint: mintTo.mint,
            amount: mintTo.amount,
            destination: mintTo.destination,
            authority: mintTo.authority,
            transaction: payload.signature,
          },
        });
      }
    }
  }

  return { alerts };
}

// ============================================================================
// EMAIL NOTIFICATION
// ============================================================================

/**
 * Send email alert
 */
async function sendEmailAlert(
  email: string,
  tokenName: string,
  tokenSymbol: string,
  tokenAddress: string,
  alert: any
): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-box { padding: 20px; border-radius: 8px; margin: 20px 0; }
          .critical { background-color: #fee; border-left: 4px solid #e00; }
          .high { background-color: #fef0e6; border-left: 4px solid #ff6600; }
          .code { background: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; }
          .button { display: inline-block; padding: 12px 24px; background: #6e45e2; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🚨 Real-time Security Alert - ${tokenSymbol}</h2>

          <div class="alert-box ${alert.severity === 'CRITICAL' ? 'critical' : 'high'}">
            <p><strong>${alert.message}</strong></p>
          </div>

          <h3>Token Information:</h3>
          <p><strong>Name:</strong> ${tokenName}<br>
          <strong>Symbol:</strong> ${tokenSymbol}<br>
          <strong>Address:</strong> <code>${tokenAddress}</code></p>

          <h3>Alert Details:</h3>
          <div class="code">
            ${JSON.stringify(alert.details, null, 2)}
          </div>

          <p><strong>⚡ This is a REAL-TIME alert.</strong> This change just happened on the blockchain.</p>

          <a href="https://solscan.io/tx/${alert.details.transaction}" class="button">
            View Transaction on Solscan →
          </a>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">

          <p style="font-size: 12px; color: #666;">
            This alert was triggered by SolanaGuard Real-time Watchdog.<br>
            Powered by Helius RPC & Webhooks.
          </p>
        </div>
      </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"SolanaGuard Watchdog" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `[REAL-TIME ALERT] ${tokenSymbol} - ${alert.type}`,
      text: alert.message,
      html: htmlContent,
    });

    console.log(`✅ Real-time alert email sent to ${email}`);
    return true;

  } catch (error: any) {
    console.error(`❌ Failed to send alert email:`, error.message);
    return false;
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

/**
 * Main webhook handler
 */
export async function heliusWebhookHandler(req: Request, res: Response) {
  try {
    // 1. Verify signature (if secret is configured)
    if (HELIUS_WEBHOOK_SECRET) {
      const signature = req.headers['x-helius-signature'] as string;
      const rawBody = JSON.stringify(req.body);

      if (!signature || !verifyHeliusSignature(rawBody, signature, HELIUS_WEBHOOK_SECRET)) {
        console.warn('⚠️ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // 2. Parse webhook payload
    const webhookData = req.body as HeliusWebhookPayload[];

    console.log(`📨 Received ${webhookData.length} webhook events from Helius`);

    // 3. Process each transaction
    for (const payload of webhookData) {
      console.log(`🔍 Processing transaction: ${payload.signature}`);

      // Find which token this transaction relates to
      // (In production, you'd look up from database based on accounts involved)

      // For now, iterate through all configured alerts
      for (const [tokenAddress, config] of alertConfigs.entries()) {
        // Check if transaction involves this token
        const isRelevant = payload.accountData?.some(
          (acc: any) => acc.account === tokenAddress
        ) || false;

        if (isRelevant) {
          // Analyze transaction
          const { alerts } = analyzeTransaction(payload, config);

          // Send alerts
          for (const alert of alerts) {
            console.log(`🚨 ALERT: ${alert.type} for ${config.tokenSymbol}`);

            // Send email
            await sendEmailAlert(
              config.userEmail,
              config.tokenName,
              config.tokenSymbol,
              config.tokenAddress,
              alert
            );
          }
        }
      }
    }

    // 4. Respond to Helius
    res.status(200).json({ success: true, processed: webhookData.length });

  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ============================================================================
// ALERT CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Register token for monitoring
 */
export function registerTokenAlert(config: AlertConfig) {
  alertConfigs.set(config.tokenAddress, config);
  console.log(`✅ Registered alert for ${config.tokenSymbol} (${config.tokenAddress})`);
}

/**
 * Unregister token
 */
export function unregisterTokenAlert(tokenAddress: string) {
  alertConfigs.delete(tokenAddress);
  console.log(`✅ Unregistered alert for ${tokenAddress}`);
}

/**
 * Get all registered tokens
 */
export function getRegisteredTokens(): AlertConfig[] {
  return Array.from(alertConfigs.values());
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  HeliusWebhookPayload,
  HeliusInstruction,
  AlertConfig,
};
