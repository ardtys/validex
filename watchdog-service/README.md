# Solana Token Watchdog Service

Automated monitoring system untuk Solana tokens dengan real-time alerts dan email notifications.

## Features

- **Automated Monitoring**: Cek token security status setiap 10 menit
- **Change Detection**: Deteksi perubahan Mint/Freeze Authority secara otomatis
- **Email Alerts**: Instant email notification saat status berubah
- **Historical Tracking**: Full audit trail semua perubahan status
- **Scalable Architecture**: Built dengan BullMQ + Redis untuk high throughput
- **Database Persistence**: PostgreSQL + Prisma untuk reliable data storage

## Architecture

```
User → Prisma (PostgreSQL) ← Worker (BullMQ) → Solana RPC
                                     ↓
                              Email Service (Nodemailer)
```

### Components

1. **Database Layer (Prisma + PostgreSQL)**
   - Users
   - Monitored Tokens
   - Status History
   - Alerts
   - Notifications

2. **Job Queue (BullMQ + Redis)**
   - Recurring jobs untuk setiap monitored token
   - Rate limiting & retry logic
   - Job prioritization

3. **Monitoring Engine**
   - Check token security status
   - Compare dengan status sebelumnya
   - Detect critical changes

4. **Notification Service**
   - Send email alerts
   - Log notification history
   - Retry failed notifications

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- SMTP email account (Gmail recommended)

## Installation

### 1. Clone & Install Dependencies

```bash
cd watchdog-service
npm install
```

### 2. Setup PostgreSQL Database

```bash
# Create database
createdb watchdog_db

# Or using psql
psql -U postgres
CREATE DATABASE watchdog_db;
```

### 3. Setup Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
# Windows: Use WSL or Docker
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/watchdog_db"
REDIS_URL="redis://localhost:6379"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"

# Gmail SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

**Important**: Untuk Gmail, generate App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Generate new app password
3. Use that password in `SMTP_PASS`

### 5. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start Worker

```bash
npm run worker
```

## Usage

### Adding Token to Monitor

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 1. Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
})

// 2. Get current token status
const tokenAddress = 'YOUR_TOKEN_ADDRESS_HERE'
const currentStatus = await checkTokenSecurityStatus(tokenAddress)

// 3. Add token to monitoring
const monitoredToken = await prisma.monitoredToken.create({
  data: {
    tokenAddress,
    tokenName: 'Example Token',
    tokenSymbol: 'EXT',
    ownerId: user.id,
    lastStatus: currentStatus,
    checkInterval: 600, // 10 minutes
    isActive: true,
  },
})

console.log('Token added to monitoring:', monitoredToken.id)
```

### Checking Alerts

```typescript
// Get all alerts untuk user
const alerts = await prisma.alert.findMany({
  where: {
    token: {
      ownerId: user.id,
    },
  },
  include: {
    token: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
})

console.log(`Found ${alerts.length} alerts`)
```

## Database Schema

### User
```typescript
{
  id: string
  email: string (unique)
  name: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### MonitoredToken
```typescript
{
  id: string
  tokenAddress: string
  tokenName: string?
  tokenSymbol: string?
  lastStatus: JSON          // Previous security status
  currentStatus: JSON?      // Latest security status
  checkInterval: number     // Seconds (default 600)
  isActive: boolean
  alertOnMintChange: boolean
  alertOnFreezeChange: boolean
  ownerId: string
  lastChecked: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Alert
```typescript
{
  id: string
  tokenId: string
  alertType: string        // "MINT_ACTIVATED", "FREEZE_ACTIVATED", etc.
  severity: string         // "LOW", "MEDIUM", "HIGH", "CRITICAL"
  message: string
  details: JSON?
  isRead: boolean
  sentEmail: boolean
  createdAt: DateTime
}
```

## Monitoring Logic

### Status Comparison

```typescript
// Old Status
{
  mintAuthority: { active: false, address: null },
  freezeAuthority: { active: false, address: null }
}

// New Status (DANGER!)
{
  mintAuthority: { active: true, address: "DevWallet..." },
  freezeAuthority: { active: false, address: null }
}

// Detected Change:
{
  field: "mintAuthority",
  oldValue: { active: false },
  newValue: { active: true, address: "DevWallet..." },
  severity: "CRITICAL"
}
```

### Alert Triggers

| Change | Severity | Action |
|--------|----------|--------|
| Mint Authority: null → active | CRITICAL | Send email immediately |
| Freeze Authority: null → active | HIGH | Send email immediately |
| Mint Authority: active → null | HIGH | Send notification (good news) |
| Freeze Authority: active → null | MEDIUM | Send notification (good news) |

## Email Notification Format

```
Subject: [ALERT] Security Status Changed: TOKEN

🚨 CRITICAL ALERT: Mint Authority has been ACTIVATED for Example Token (EXT)!
Developer can now mint unlimited tokens.

Token Address: ABC123...XYZ789

Timestamp: 2024-01-20 10:30:00 UTC

What should you do?
- Review your position in this token
- Consider your risk tolerance
- Make informed decisions based on your research

[View on Solscan →]
```

## Worker Configuration

### Concurrency

Worker processes 5 jobs concurrently by default:

```typescript
const worker = new Worker('token-monitoring', processor, {
  connection: redisConnection,
  concurrency: 5,
})
```

### Job Scheduling

Each monitored token gets its own recurring job:

```typescript
await monitorQueue.add(
  `monitor-${token.id}`,
  { tokenId: token.id },
  {
    repeat: {
      every: 600000, // 10 minutes
    },
  }
)
```

## Rate Limiting

**Public RPC Limits:**
- Solana mainnet: ~100 req/10 sec
- Strategy: Process in batches with delays

**Premium RPC (Recommended):**
- QuickNode: 25-100 req/sec
- Alchemy: 330-660 req/sec
- Helius: 20-100 req/sec

## Monitoring Dashboard (Prisma Studio)

View data dalam browser:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

## Troubleshooting

### Worker tidak start

**Problem**: `Error: Connection refused`

**Solution**:
- Check Redis is running: `redis-cli ping` (should return "PONG")
- Check PostgreSQL: `psql -U postgres -d watchdog_db`

### Email tidak terkirim

**Problem**: `Error: Invalid login`

**Solution**:
- Use App Password, bukan password biasa
- Enable "Less secure app access" (if not using App Password)
- Check SMTP credentials

### Jobs tidak execute

**Problem**: Worker running tapi tidak ada log

**Solution**:
```bash
# Check Redis queue
redis-cli
KEYS *
LLEN bull:token-monitoring:wait

# Clear stale jobs
redis-cli FLUSHDB
```

## Production Deployment

### Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Start worker
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  worker:
    build: .
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/watchdog
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:latest
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### PM2 (Process Manager)

```bash
npm install -g pm2

# Start worker
pm2 start npm --name "watchdog-worker" -- start

# Monitor
pm2 logs watchdog-worker
pm2 monit
```

## Testing

```typescript
import { checkTokenSecurityStatus } from './worker'

// Test token status check
const status = await checkTokenSecurityStatus('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
console.log(status)

// Expected output:
// {
//   mintAuthority: { active: true, address: '...' },
//   freezeAuthority: { active: false, address: null },
//   timestamp: '2024-01-20T10:30:00.000Z'
// }
```

## API Integration (Future)

Create REST API untuk manage monitored tokens:

```typescript
// POST /api/monitor/add
app.post('/api/monitor/add', async (req, res) => {
  const { userId, tokenAddress } = req.body

  // Add token to monitoring
  const token = await prisma.monitoredToken.create({...})

  res.json({ success: true, tokenId: token.id })
})

// GET /api/monitor/alerts/:userId
app.get('/api/monitor/alerts/:userId', async (req, res) => {
  const alerts = await prisma.alert.findMany({...})
  res.json({ alerts })
})
```

## Performance

- **Throughput**: ~300 tokens monitored simultaneously
- **Latency**: 1-3 seconds per check (depends on RPC)
- **Memory**: ~200MB (worker + queue)
- **CPU**: Low (mostly I/O bound)

## Security

- Never expose database credentials
- Use environment variables for secrets
- Rate limit API endpoints
- Validate all user inputs
- Use HTTPS for production

## License

MIT

## Support

For issues or questions, open an issue on GitHub.

---

Built with ❤️ by Senior Backend Architect
