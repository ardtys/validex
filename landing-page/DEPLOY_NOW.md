# Deploy ke Vercel - Panduan Lengkap

## Cara Deploy yang PASTI BERHASIL

Vercel CLI sudah terinstall. Ikuti langkah ini **PERSIS**:

### LANGKAH 1: Login ke Vercel

Buka **Command Prompt** atau **PowerShell** baru, lalu jalankan:

```bash
vercel login
```

Akan muncul pilihan:
- **Email** - Pilih ini jika login dengan email
- **GitHub** - Pilih ini jika login dengan GitHub
- **GitLab** - Pilih ini jika login dengan GitLab
- **Bitbucket** - Pilih ini jika login dengan Bitbucket

Pilih metode yang Anda gunakan, lalu ikuti instruksi.

---

### LANGKAH 2: Masuk ke Folder Landing Page

```bash
cd C:\Users\Daffa\OneDrive\Desktop\VALIDEX\landing-page
```

---

### LANGKAH 3: Deploy ke Production

```bash
vercel --prod
```

**Saat ditanya, jawab seperti ini:**

```
? Set up and deploy "C:\Users\Daffa\OneDrive\Desktop\VALIDEX\landing-page"?
→ Y (tekan Enter)

? Which scope do you want to deploy to?
→ Pilih account Anda (tekan Enter)

? Link to existing project?
→ N (tekan Enter)

? What's your project's name?
→ validex (ketik "validex" lalu Enter)

? In which directory is your code located?
→ ./ (tekan Enter saja, default sudah benar)
```

**Tunggu proses build (~2-3 menit)**

Setelah selesai, Anda akan mendapat:
```
✓ Production: https://validex-xxxxx.vercel.app [copied to clipboard]
```

---

### LANGKAH 4: Set Environment Variables

1. Buka https://vercel.com/dashboard
2. Klik project **"validex"**
3. Klik tab **"Settings"**
4. Klik **"Environment Variables"** di sidebar

**Tambahkan 2 variables:**

**Variable 1:**
```
Name: NEXT_PUBLIC_BASE_URL
Value: https://validex-xxxxx.vercel.app (paste URL deployment Anda)
Environment: ✓ Production ✓ Preview ✓ Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SOLANA_RPC_URL
Value: https://api.mainnet-beta.solana.com
Environment: ✓ Production ✓ Preview ✓ Development
```

Klik **"Save"** untuk setiap variable.

---

### LANGKAH 5: Redeploy dengan Environment Variables

Kembali ke Command Prompt, jalankan lagi:

```bash
vercel --prod
```

Vercel akan redeploy dengan environment variables yang baru.

---

### LANGKAH 6: Test Deployment

Buka URL deployment Anda di browser.

**Cek apakah:**
- ✅ Background gradient biru cyber terlihat
- ✅ Text putih/cyan terang (BUKAN gelap)
- ✅ Cards glassmorphism terlihat
- ✅ Glow effects ada
- ✅ Button berfungsi
- ✅ Input form terlihat jelas

Jika **SEMUA terlihat**, deployment **BERHASIL**! 🎉

---

## Troubleshooting

### Problem: "Error: No existing credentials found"

**Solusi:** Jalankan `vercel login` terlebih dahulu

---

### Problem: CSS masih tidak muncul setelah deploy

**Solusi:**

1. Cek apakah environment variables sudah di-set di Vercel dashboard
2. Redeploy: `vercel --prod`
3. Hard refresh browser: **Ctrl + Shift + R** (Windows) atau **Cmd + Shift + R** (Mac)
4. Clear cache browser
5. Coba buka di **incognito/private window**

---

### Problem: Build error saat deploy

**Cek build logs:**
1. Vercel Dashboard → Project → Deployments
2. Klik deployment yang failed
3. Klik "View Build Logs"
4. Screenshot error dan perbaiki sesuai error message

---

## Alternatif: Deploy via Vercel Dashboard

Jika CLI tidak berhasil, gunakan cara ini:

1. **Buat repository GitHub baru**: `validex-frontend`

2. **Copy semua file dari landing-page ke repo baru:**
   ```bash
   cd C:\Users\Daffa\OneDrive\Desktop
   mkdir validex-frontend
   cd validex-frontend

   # Copy files (Windows)
   xcopy "C:\Users\Daffa\OneDrive\Desktop\VALIDEX\landing-page\*" . /E /I /H /Y

   # Atau manual: copy-paste semua file dari landing-page ke validex-frontend
   ```

3. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/ardtys/validex-frontend.git
   git branch -M main
   git push -u origin main
   ```

4. **Import ke Vercel:**
   - Dashboard → New Project
   - Import `validex-frontend`
   - **Root Directory:** KOSONGKAN (karena sudah di root)
   - Add environment variables
   - Deploy

---

## Yang Harus Anda Lakukan Sekarang:

1. Buka **Command Prompt** atau **PowerShell**
2. Jalankan: `vercel login`
3. Login dengan account Vercel Anda
4. Jalankan: `cd C:\Users\Daffa\OneDrive\Desktop\VALIDEX\landing-page`
5. Jalankan: `vercel --prod`
6. Ikuti prompts
7. Set environment variables di dashboard
8. Redeploy: `vercel --prod`
9. Test di browser

**Deployment PASTI berhasil dengan cara ini!** 🚀
