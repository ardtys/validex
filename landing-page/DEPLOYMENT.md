# VALIDEX Deployment Guide

## 🚀 Deploy ke Vercel

### Prerequisites
- Akun GitHub
- Akun Vercel (gratis)
- Solana RPC endpoint (opsional, bisa pakai free tier)

### Step 1: Push ke GitHub

```bash
cd landing-page
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/validex.git
git push -u origin main
```

### Step 2: Import ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import repository GitHub Anda
4. Vercel akan otomatis detect Next.js

### Step 3: Configure Environment Variables

Di Vercel Dashboard, tambahkan environment variable:

**Name:** `NEXT_PUBLIC_SOLANA_RPC_URL`
**Value:** `https://api.mainnet-beta.solana.com` (atau RPC endpoint Anda)

**Rekomendasi RPC (untuk production):**
- [Helius](https://helius.xyz) - 100k req/day gratis
- [QuickNode](https://quicknode.com) - Lebih cepat, 5M req/month gratis
- [Alchemy](https://alchemy.com) - 300M compute units/month gratis

### Step 4: Deploy

1. Click **"Deploy"**
2. Tunggu build selesai (~2-3 menit)
3. Aplikasi live di `https://your-project.vercel.app`

## 🔧 Environment Variables

### Required
- `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint URL

### Optional (untuk performa lebih baik)
```bash
# Helius example
NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_API_KEY

# QuickNode example
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.quicknode.pro/YOUR_TOKEN/

# Alchemy example
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

## 📦 Build Locally

Test build production sebelum deploy:

```bash
npm run build
npm run start
```

## 🔄 Update Deployment

Setiap kali push ke GitHub, Vercel akan auto-deploy:

```bash
git add .
git commit -m "Update features"
git push
```

## ⚡ Performance Tips

### 1. Gunakan Dedicated RPC
Free RPC `api.mainnet-beta.solana.com` sering slow/rate limited. Upgrade ke:
- **Helius**: Paling recommended untuk Solana
- **QuickNode**: Paling cepat
- **Alchemy**: Bagus untuk multi-chain

### 2. Enable Caching
Vercel config sudah include caching headers untuk API routes.

### 3. Region Selection
Default region: `iad1` (US East - Virginia)
Bisa ganti di `vercel.json` ke region lebih dekat users Anda.

## 🐛 Troubleshooting

### Build Failed
```bash
# Cek error di Vercel logs
# Biasanya karena:
# 1. Missing dependencies
# 2. TypeScript errors
# 3. Environment variables tidak di-set
```

### API Timeout
```bash
# Solusi:
# 1. Upgrade RPC endpoint (free tier sering timeout)
# 2. Tambah timeout di fetch calls
# 3. Implement retry logic
```

### Rate Limiting
```bash
# Free RPC limits:
# - api.mainnet-beta.solana.com: ~100 req/10sec
# - Helius free: 100k req/day
# - QuickNode free: 5M req/month

# Solusi: Upgrade ke paid tier atau implement caching
```

## 📊 Monitoring

Pantau di Vercel Dashboard:
- **Analytics**: Traffic & performance
- **Logs**: Runtime errors
- **Speed Insights**: Loading time

## 🔐 Security

- ✅ Environment variables aman (tidak di-commit)
- ✅ API routes protected dengan rate limiting (via Vercel)
- ✅ RPC key tidak exposed ke client
- ✅ CORS handled otomatis

## 📝 Next Steps

Setelah deploy:
1. Test semua fitur di production
2. Setup custom domain (opsional)
3. Enable analytics
4. Monitor error logs
5. Setup alerts untuk downtime

## 💡 Tips

- Vercel free tier: Unlimited bandwidth, 100GB/month
- Auto HTTPS/SSL included
- Edge functions di 300+ locations worldwide
- Preview deployments untuk setiap PR

---

Need help? Check:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
