# SOLUSI FINAL: Deploy Vercel dengan Benar

## Masalah
Vercel tidak bisa handle Next.js apps di subfolder dengan baik. CSS tidak ter-load karena build path issues.

## SOLUSI 1: Deploy via Vercel CLI (TERCEPAT - 2 menit)

### Langkah-langkah:

1. **Install Vercel CLI** (jika belum):
```bash
npm install -g vercel
```

2. **Login ke Vercel**:
```bash
vercel login
```

3. **Masuk ke folder landing-page**:
```bash
cd "C:\Users\Daffa\OneDrive\Desktop\VALIDEX\landing-page"
```

4. **Deploy**:
```bash
vercel --prod
```

5. **Saat ditanya**:
   - Set up and deploy? **Y**
   - Which scope? Pilih account Anda
   - Link to existing project? **N**
   - Project name? **validex**
   - In which directory is your code located? **./** (tekan Enter)

6. **Tunggu hingga selesai** - Anda akan dapat URL deployment

7. **Set Environment Variables** via dashboard:
   - Buka https://vercel.com/dashboard → Pilih project
   - Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_BASE_URL` = URL deployment Anda
     - `NEXT_PUBLIC_SOLANA_RPC_URL` = https://api.mainnet-beta.solana.com
   - Redeploy: `vercel --prod`

---

## SOLUSI 2: Buat Repository Baru untuk Frontend (BEST PRACTICE)

### Langkah-langkah:

1. **Buat repo baru di GitHub**: `validex-frontend`

2. **Copy landing-page ke folder baru**:
```bash
cd C:\Users\Daffa\OneDrive\Desktop
mkdir validex-frontend
cd validex-frontend

# Copy semua file dari landing-page
xcopy "C:\Users\Daffa\OneDrive\Desktop\VALIDEX\landing-page\*" . /E /I /H
```

3. **Init git & push**:
```bash
git init
git add .
git commit -m "Initial commit - VALIDEX frontend"
git remote add origin https://github.com/ardtys/validex-frontend.git
git branch -M main
git push -u origin main
```

4. **Import ke Vercel**:
   - Vercel Dashboard → Add New Project
   - Import `validex-frontend`
   - Root Directory: **kosongkan** (karena sudah di root)
   - Add Environment Variables
   - Deploy

---

## SOLUSI 3: Monorepo dengan Vercel (Advanced)

Buat `vercel.json` di root folder VALIDEX:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "landing-page/package.json",
      "use": "@vercel/next",
      "config": {
        "rootDir": "landing-page"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/landing-page/$1"
    }
  ]
}
```

---

## Kenapa Masalah Ini Terjadi?

Vercel memiliki **known issue** dengan Next.js apps di subfolder:
- Build path menjadi bingung
- CSS tidak ter-copy dengan benar
- Static assets path salah

**Best practice**: Frontend dan backend di repository terpisah.

---

## Rekomendasi Saya: GUNAKAN SOLUSI 1

Paling cepat, paling simple, **PASTI berhasil**.

Deploy via CLI dari dalam folder `landing-page` langsung, tanpa perlu ubah struktur project.
