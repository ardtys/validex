/**
 * Solana Token Watchdog Worker
 *
 * Automated monitoring service menggunakan BullMQ untuk:
 * - Monitor token security status setiap 10 menit
 * - Detect perubahan Mint/Freeze Authority
 * - Send email notifications saat status berubah
 *
 * Architecture:
 * - BullMQ + Redis untuk job queue
 * - Prisma + PostgreSQL untuk data persistence
 * - Nodemailer untuk email notifications
 */

import { Worker, Queue, QueueScheduler } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const DATABASE_URL = process.env.DATABASE_URL;

const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

const prisma = new PrismaClient();
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Redis connection
const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// BullMQ Queue
const monitorQueue = new Queue('token-monitoring', {
  connection: redisConnection,
});

// Email transporter
const emailTransporter = nodemailer.createTransporter(EMAIL_CONFIG);

// ============================================================================
// TYPES
// ============================================================================

interface SecurityStatus {
  mintAuthority: {
    active: boolean;
    address: string | null;
  };
  freezeAuthority: {
    active: boolean;
    address: string | null;
  };
  timestamp: string;
}

interface StatusChange {
  field: string;
  oldValue: any;
  newValue: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ============================================================================
// MONITORING LOGIC
// ============================================================================

/**
 * Check security status token dari Solana blockchain
 */
async function checkTokenSecurityStatus(tokenAddress: string): Promise<SecurityStatus> {
  try {
    const mintPubkey = new PublicKey(tokenAddress);
    const mintInfo = await getMint(connection, mintPubkey, 'confirmed');

    return {
      mintAuthority: {
        active: mintInfo.mintAuthority !== null,
        address: mintInfo.mintAuthority ? mintInfo.mintAuthority.toBase58() : null,
      },
      freezeAuthority: {
        active: mintInfo.freezeAuthority !== null,
        address: mintInfo.freezeAuthority ? mintInfo.freezeAuthority.toBase58() : null,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(`Failed to check token status: ${error.message}`);
  }
}

/**
 * Compare security status dan detect perubahan
 */
function compareSecurityStatus(
  oldStatus: SecurityStatus,
  newStatus: SecurityStatus
): StatusChange[] {
  const changes: StatusChange[] = [];

  // Check Mint Authority changes
  if (oldStatus.mintAuthority.active !== newStatus.mintAuthority.active) {
    changes.push({
      field: 'mintAuthority',
      oldValue: oldStatus.mintAuthority,
      newValue: newStatus.mintAuthority,
      severity: newStatus.mintAuthority.active ? 'CRITICAL' : 'HIGH',
    });
  }

  // Check Freeze Authority changes
  if (oldStatus.freezeAuthority.active !== newStatus.freezeAuthority.active) {
    changes.push({
      field: 'freezeAuthority',
      oldValue: oldStatus.freezeAuthority,
      newValue: newStatus.freezeAuthority,
      severity: newStatus.freezeAuthority.active ? 'HIGH' : 'MEDIUM',
    });
  }

  return changes;
}

/**
 * Determine alert type dari changes
 */
function getAlertType(change: StatusChange): string {
  if (change.field === 'mintAuthority') {
    return change.newValue.active ? 'MINT_ACTIVATED' : 'MINT_REVOKED';
  }
  if (change.field === 'freezeAuthority') {
    return change.newValue.active ? 'FREEZE_ACTIVATED' : 'FREEZE_REVOKED';
  }
  return 'UNKNOWN_CHANGE';
}

/**
 * Generate alert message
 */
function generateAlertMessage(
  tokenName: string,
  tokenSymbol: string,
  change: StatusChange
): string {
  if (change.field === 'mintAuthority') {
    if (change.newValue.active) {
      return `🚨 CRITICAL ALERT: Mint Authority has been ACTIVATED for ${tokenName} (${tokenSymbol})! Developer can now mint unlimited tokens.`;
    } else {
      return `✅ GOOD NEWS: Mint Authority has been REVOKED for ${tokenName} (${tokenSymbol}). Token supply is now fixed.`;
    }
  }

  if (change.field === 'freezeAuthority') {
    if (change.newValue.active) {
      return `⚠️ WARNING: Freeze Authority has been ACTIVATED for ${tokenName} (${tokenSymbol})! Developer can freeze token accounts.`;
    } else {
      return `✅ GOOD NEWS: Freeze Authority has been DISABLED for ${tokenName} (${tokenSymbol}). Tokens cannot be frozen.`;
    }
  }

  return `Status changed for ${tokenName} (${tokenSymbol})`;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

/**
 * Send email notification
 */
async function sendEmailNotification(
  userEmail: string,
  subject: string,
  message: string,
  tokenAddress: string
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
          .medium { background-color: #fff8e1; border-left: 4px solid #ffb300; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .token-link { color: #6e45e2; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🛡️ SolanaGuard Security Alert</h2>

          <div class="alert-box critical">
            <p><strong>${message}</strong></p>
          </div>

          <p><strong>Token Address:</strong><br>
          <code>${tokenAddress}</code></p>

          <p><strong>Timestamp:</strong><br>
          ${new Date().toLocaleString()}</p>

          <p>
            <a href="https://solscan.io/token/${tokenAddress}" class="token-link">
              View on Solscan →
            </a>
          </p>

          <hr>

          <p><strong>What should you do?</strong></p>
          <ul>
            <li>Review your position in this token</li>
            <li>Consider your risk tolerance</li>
            <li>Make informed decisions based on your research</li>
          </ul>

          <div class="footer">
            <p>This is an automated alert from SolanaGuard Watchdog Service.</p>
            <p>You are receiving this because you enabled monitoring for this token.</p>
            <p>To unsubscribe or manage your alerts, visit your dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"SolanaGuard Watchdog" <${EMAIL_CONFIG.auth.user}>`,
      to: userEmail,
      subject: `[ALERT] ${subject}`,
      text: message,
      html: htmlContent,
    });

    console.log(`✅ Email sent to ${userEmail}`);
    return true;

  } catch (error: any) {
    console.error(`❌ Failed to send email: ${error.message}`);
    return false;
  }
}

// ============================================================================
// WORKER PROCESSOR
// ============================================================================

/**
 * Process monitoring job untuk satu token
 */
async function processMonitoringJob(tokenId: string) {
  console.log(`🔍 Processing monitoring job for token: ${tokenId}`);

  try {
    // 1. Fetch monitored token dari database
    const monitoredToken = await prisma.monitoredToken.findUnique({
      where: { id: tokenId },
      include: { owner: true },
    });

    if (!monitoredToken || !monitoredToken.isActive) {
      console.log(`⏭️ Token ${tokenId} is not active or not found`);
      return;
    }

    // 2. Check current security status dari blockchain
    const currentStatus = await checkTokenSecurityStatus(monitoredToken.tokenAddress);

    // 3. Compare dengan last status
    const lastStatus = monitoredToken.lastStatus as SecurityStatus;
    const changes = compareSecurityStatus(lastStatus, currentStatus);

    // 4. Update database dengan current status
    await prisma.monitoredToken.update({
      where: { id: tokenId },
      data: {
        currentStatus: currentStatus as any,
        lastChecked: new Date(),
      },
    });

    // 5. Jika ada perubahan, create alerts dan send notifications
    if (changes.length > 0) {
      console.log(`⚠️ Detected ${changes.length} status changes!`);

      for (const change of changes) {
        // Create alert in database
        const alert = await prisma.alert.create({
          data: {
            tokenId: monitoredToken.id,
            alertType: getAlertType(change),
            severity: change.severity,
            message: generateAlertMessage(
              monitoredToken.tokenName || 'Unknown Token',
              monitoredToken.tokenSymbol || 'UNKNOWN',
              change
            ),
            details: change as any,
          },
        });

        // Send email notification
        const subject = `Security Status Changed: ${monitoredToken.tokenSymbol || 'Token'}`;
        const emailSent = await sendEmailNotification(
          monitoredToken.owner.email,
          subject,
          alert.message,
          monitoredToken.tokenAddress
        );

        // Log notification
        await prisma.notification.create({
          data: {
            userId: monitoredToken.ownerId,
            subject,
            body: alert.message,
            toEmail: monitoredToken.owner.email,
            status: emailSent ? 'SENT' : 'FAILED',
            sentAt: emailSent ? new Date() : null,
          },
        });

        // Update alert email status
        await prisma.alert.update({
          where: { id: alert.id },
          data: { sentEmail: emailSent },
        });
      }

      // Save status history
      await prisma.statusHistory.create({
        data: {
          tokenId: monitoredToken.id,
          status: currentStatus as any,
          changes: changes as any,
        },
      });

      // Update lastStatus to current
      await prisma.monitoredToken.update({
        where: { id: tokenId },
        data: { lastStatus: currentStatus as any },
      });

      console.log(`✅ Alerts created and notifications sent for token ${tokenId}`);
    } else {
      console.log(`✅ No changes detected for token ${tokenId}`);
    }

  } catch (error: any) {
    console.error(`❌ Error processing token ${tokenId}:`, error.message);
    throw error;
  }
}

// ============================================================================
// WORKER SETUP
// ============================================================================

/**
 * Initialize BullMQ Worker
 */
const worker = new Worker(
  'token-monitoring',
  async (job) => {
    const { tokenId } = job.data;
    await processMonitoringJob(tokenId);
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

// ============================================================================
// SCHEDULER SETUP
// ============================================================================

/**
 * Setup recurring jobs untuk semua monitored tokens
 */
async function setupRecurringJobs() {
  console.log('🔄 Setting up recurring monitoring jobs...');

  // Fetch all active monitored tokens
  const activeTokens = await prisma.monitoredToken.findMany({
    where: { isActive: true },
  });

  console.log(`📊 Found ${activeTokens.length} active tokens to monitor`);

  // Schedule job untuk setiap token
  for (const token of activeTokens) {
    await monitorQueue.add(
      `monitor-${token.id}`,
      { tokenId: token.id },
      {
        repeat: {
          every: token.checkInterval * 1000, // Convert seconds to ms
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log(`✅ Scheduled monitoring for token ${token.tokenSymbol} (${token.tokenAddress})`);
  }

  console.log('✅ All recurring jobs scheduled successfully');
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

async function gracefulShutdown() {
  console.log('\n🛑 Shutting down gracefully...');

  await worker.close();
  await monitorQueue.close();
  await redisConnection.quit();
  await prisma.$disconnect();

  console.log('✅ Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ============================================================================
// START WORKER
// ============================================================================

async function startWorker() {
  console.log('='.repeat(60));
  console.log('🐕 Solana Token Watchdog Worker Starting...');
  console.log('='.repeat(60));
  console.log(`📡 RPC: ${SOLANA_RPC_URL}`);
  console.log(`📦 Redis: ${REDIS_URL}`);
  console.log(`📧 Email: ${EMAIL_CONFIG.auth.user}`);
  console.log('='.repeat(60));

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test email connection
    await emailTransporter.verify();
    console.log('✅ Email service connected');

    // Setup recurring jobs
    await setupRecurringJobs();

    console.log('\n🚀 Worker is now running and processing jobs...');
    console.log('Press Ctrl+C to stop\n');

  } catch (error: any) {
    console.error('❌ Failed to start worker:', error.message);
    process.exit(1);
  }
}

// Start the worker
startWorker();

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export {
  checkTokenSecurityStatus,
  compareSecurityStatus,
  sendEmailNotification,
  processMonitoringJob,
};
