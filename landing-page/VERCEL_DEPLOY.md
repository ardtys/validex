# Vercel Deployment Instructions

## Cara Deploy yang Benar

### Option 1: Via Vercel Dashboard (RECOMMENDED)

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Project**:
   - Klik **"Add New..."** → **"Project"**
   - Connect GitHub repository: `ardtys/validex`
   - Klik **"Import"**

3. **Configure Project** (SANGAT PENTING):

   ```
   Project Name: validex
   Framework Preset: Next.js (auto-detected)
   Root Directory: landing-page  ✅ WAJIB DIISI
   ```

4. **Build & Development Settings**:

   Biarkan **semua kosong** (auto-detect), kecuali:
   ```
   Build Command: (biarkan kosong)
   Output Directory: (biarkan kosong)
   Install Command: (biarkan kosong)
   Development Command: (biarkan kosong)
   ```

5. **Environment Variables**:

   Klik **"Add"** dan tambahkan:
   ```
   Name: NEXT_PUBLIC_BASE_URL
   Value: https://validex-two.vercel.app (sesuaikan dengan URL Anda)
   Environments: ☑ Production ☑ Preview ☑ Development

   Name: NEXT_PUBLIC_SOLANA_RPC_URL
   Value: https://api.mainnet-beta.solana.com
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

6. **Deploy**:
   - Klik **"Deploy"**
   - Tunggu hingga selesai (~2-3 menit)

---

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Login
vercel login

# Masuk ke folder landing-page
cd landing-page

# Deploy
vercel

# Saat ditanya, jawab:
# - Set up and deploy? Y
# - Which scope? (pilih account Anda)
# - Link to existing project? N
# - Project name? validex
# - In which directory is your code located? ./

# Deploy to production
vercel --prod
```

---

## Troubleshooting

### ❌ Problem: CSS tidak muncul (text gelap di background gelap)

**Penyebab**: Root Directory tidak di-set

**Solusi**:
1. Buka project di Vercel Dashboard
2. Settings → General → Root Directory
3. Isi dengan: `landing-page`
4. Save
5. Deployments → Klik "..." → Redeploy

---

### ❌ Problem: Build error "output directory not found"

**Penyebab**: Build command atau output directory salah

**Solusi**:
1. Settings → General → Build & Development Settings
2. **RESET SEMUA** (kosongkan field Build Command, Output Directory, dll)
3. Framework Preset: pastikan **Next.js**
4. Root Directory: pastikan **landing-page**
5. Save & Redeploy

---

### ❌ Problem: Environment variables tidak ter-load

**Solusi**:
1. Settings → Environment Variables
2. Pastikan ada 2 variables:
   - `NEXT_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
3. Pastikan **semua environments** (Production, Preview, Development) tercentang
4. Save & Redeploy

---

## Verification Checklist

Setelah deploy berhasil, cek:

- [ ] Homepage muncul dengan background gradient biru gelap
- [ ] Text terlihat jelas (putih/cyan)
- [ ] Glassmorphism cards terlihat
- [ ] Input token address berfungsi
- [ ] Button "scan token" ada glow effect
- [ ] Navigation links berfungsi
- [ ] /features page dapat diakses
- [ ] /demo page dapat diakses
- [ ] /docs page dapat diakses

**Test URL**: https://your-project.vercel.app

---

## Quick Fix untuk Project yang Sudah Ada

Jika Anda sudah punya project di Vercel tapi CSS tidak muncul:

1. **Delete project lama** (Settings → Advanced → Delete Project)
2. **Deploy ulang** dengan instruksi di atas
3. **PASTIKAN** set Root Directory = `landing-page`

Atau tanpa delete:

1. Settings → General → Root Directory → Edit → Isi `landing-page` → Save
2. Deployments → Latest deployment → ... → Redeploy (jangan centang "Use existing Build Cache")

---

## Important Notes

- ✅ Root Directory **WAJIB** di-set ke `landing-page`
- ✅ Framework Preset akan auto-detect Next.js (jangan diubah)
- ✅ Build commands biarkan kosong (auto-detect lebih baik)
- ✅ Semua environment variables harus ada di Production environment

**Jangan deploy dari root folder `VALIDEX`**, karena akan deploy backend Express.js yang salah!
