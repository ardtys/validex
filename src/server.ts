import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SolanaTokenAuditor } from './services/auditor';
import { DeveloperTracker } from './services/developerTracker';
import { heliusWebhookHandler } from './services/heliusWebhook';
import { AuditRequest, ErrorResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const auditor = new SolanaTokenAuditor(SOLANA_RPC_URL);
const developerTracker = new DeveloperTracker(SOLANA_RPC_URL);

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Solana Token Security Auditor API is running',
    timestamp: new Date().toISOString(),
    rpcUrl: SOLANA_RPC_URL,
  });
});

/**
 * Main audit endpoint
 * POST /api/audit
 * Body: { tokenAddress: string }
 */
app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    const { tokenAddress }: AuditRequest = req.body;

    // Validasi input
    if (!tokenAddress) {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: 'Token address is required',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(errorResponse);
    }

    // Validasi format address
    if (!SolanaTokenAuditor.isValidSolanaAddress(tokenAddress)) {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: 'Invalid Solana token address format',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(errorResponse);
    }

    // Lakukan audit
    console.log(`🔍 Auditing token: ${tokenAddress}`);
    const result = await auditor.auditToken(tokenAddress);

    // Return hasil audit
    res.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Audit error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Audit Failed',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    // Tentukan status code berdasarkan jenis error
    const statusCode = error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json(errorResponse);
  }
});

/**
 * Endpoint untuk audit dengan GET (alternatif)
 * GET /api/audit/:tokenAddress
 */
app.get('/api/audit/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;

    // Validasi format address
    if (!SolanaTokenAuditor.isValidSolanaAddress(tokenAddress)) {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: 'Invalid Solana token address format',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(errorResponse);
    }

    // Lakukan audit
    console.log(`🔍 Auditing token: ${tokenAddress}`);
    const result = await auditor.auditToken(tokenAddress);

    // Return hasil audit
    res.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Audit error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Audit Failed',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    const statusCode = error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json(errorResponse);
  }
});

/**
 * Developer Tracker endpoint
 * GET /api/developer/:tokenAddress
 */
app.get('/api/developer/:tokenAddress', async (req: Request, res: Response) => {
  try {
    const { tokenAddress } = req.params;

    // Validasi format address
    if (!SolanaTokenAuditor.isValidSolanaAddress(tokenAddress)) {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: 'Invalid Solana token address format',
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(errorResponse);
    }

    // Analyze developer
    console.log(`🕵️ Analyzing developer for token: ${tokenAddress}`);
    const result = await developerTracker.analyzeDeveloper(tokenAddress);

    // Return hasil analisis
    res.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Developer analysis error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Analysis Failed',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    const statusCode = error.message.includes('not found') ? 404 : 500;

    res.status(statusCode).json(errorResponse);
  }
});

/**
 * Helius Webhook endpoint
 * POST /helius-webhook
 */
app.post('/helius-webhook', heliusWebhookHandler);

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Global error handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Solana Token Security Auditor API');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 RPC Endpoint: ${SOLANA_RPC_URL}`);
  console.log('='.repeat(60));
  console.log('\n📚 Available Endpoints:');
  console.log(`   GET  /health`);
  console.log(`   POST /api/audit`);
  console.log(`   GET  /api/audit/:tokenAddress`);
  console.log(`   GET  /api/developer/:tokenAddress`);
  console.log('\n💡 Example usage:');
  console.log(`   curl -X POST http://localhost:${PORT}/api/audit \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -d '{"tokenAddress": "YOUR_TOKEN_ADDRESS"}'`);
  console.log('='.repeat(60));
});

export default app;
