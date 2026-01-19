# Solana Token Security Auditor

Backend API untuk menganalisis keamanan SPL Token di Solana blockchain. Sistem ini mengaudit token berdasarkan Contract Address (CA) dan memberikan risk assessment lengkap.

## Features

- **Mint Authority Check**: Deteksi apakah developer masih bisa mint token baru
- **Freeze Authority Check**: Deteksi apakah developer bisa freeze akun token
- **Metadata Analysis**: Cek apakah metadata token bisa diubah (mutable)
- **Risk Scoring**: Algoritma penilaian risiko (0-100)
- **Risk Categorization**: Safe, Caution, atau Rug Pull Risk
- **Detailed Warnings**: Peringatan spesifik untuk setiap risiko yang ditemukan

## Prerequisites

- Node.js v18 atau lebih tinggi
- npm atau yarn
- Koneksi internet (untuk akses Solana RPC)

## Installation

### 1. Clone atau Download Project

```bash
cd VALIDEX
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
copy .env.example .env
```

Edit file `.env` dan sesuaikan konfigurasi:

```env
PORT=3000
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Recommended RPC Providers** (untuk performa lebih baik):
- [QuickNode](https://www.quicknode.com/)
- [Alchemy](https://www.alchemy.com/)
- [Helius](https://www.helius.dev/)

### 4. Build Project

```bash
npm run build
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### 1. Health Check

**GET** `/health`

Cek status server.

**Response:**
```json
{
  "status": "OK",
  "message": "Solana Token Security Auditor API is running",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "rpcUrl": "https://api.mainnet-beta.solana.com"
}
```

### 2. Audit Token (POST)

**POST** `/api/audit`

**Request Body:**
```json
{
  "tokenAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "tokenInfo": {
      "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "USD Coin",
      "symbol": "USDC",
      "decimals": 6,
      "totalSupply": "1234567890.000000",
      "metadataUri": "https://..."
    },
    "authorityStatus": {
      "mintAuthority": {
        "active": true,
        "address": "ABC123..."
      },
      "freezeAuthority": {
        "active": false,
        "address": null
      }
    },
    "metadataIsMutable": false,
    "riskScore": 50,
    "riskLevel": "Caution",
    "warnings": [
      "⚠️ WARNING: Mint Authority is active - Developer can mint unlimited new tokens!",
      "   Address: ABC123...",
      "✅ SAFE: Freeze Authority has been revoked",
      "✅ SAFE: Metadata is immutable"
    ],
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Bad Request",
  "message": "Invalid Solana token address format",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### 3. Audit Token (GET)

**GET** `/api/audit/:tokenAddress`

Alternative endpoint menggunakan URL parameter.

**Example:**
```
GET /api/audit/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

## Risk Scoring Algorithm

Sistem menghitung risk score dengan formula:

1. **Base Score**: 100
2. **Mint Authority Active**: -50 poin (BAHAYA TINGGI)
3. **Freeze Authority Active**: -20 poin (RISIKO MEDIUM)
4. **Metadata Mutable**: -10 poin (RISIKO RENDAH)

**Risk Categories:**
- **80-100**: Safe (Token aman)
- **50-79**: Caution (Hati-hati, ada risiko)
- **0-49**: Rug Pull Risk (BAHAYA - potensi scam tinggi)

## Testing

### Manual Testing dengan cURL

**Test POST endpoint:**
```bash
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d "{\"tokenAddress\": \"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\"}"
```

**Test GET endpoint:**
```bash
curl http://localhost:3000/api/audit/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Testing dengan Postman

1. Import collection atau buat request baru
2. Method: POST
3. URL: `http://localhost:3000/api/audit`
4. Body (JSON):
```json
{
  "tokenAddress": "YOUR_TOKEN_ADDRESS_HERE"
}
```

### Example Token Addresses untuk Testing

**Mainnet:**
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- SOL: `So11111111111111111111111111111111111111112` (wrapped SOL)
- BONK: `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263`

## Project Structure

```
VALIDEX/
├── src/
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces & types
│   ├── services/
│   │   └── auditor.ts        # Core audit logic
│   └── server.ts             # Express API server
├── dist/                     # Compiled JavaScript (generated)
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Template environment variables
├── .gitignore                # Git ignore rules
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

## Error Handling

API menangani berbagai jenis error:

1. **Invalid Address Format**
   - Status: 400 Bad Request
   - Message: "Invalid Solana token address format"

2. **Token Not Found**
   - Status: 404 Not Found
   - Message: "Token account not found. Please check the address."

3. **Missing Token Address**
   - Status: 400 Bad Request
   - Message: "Token address is required"

4. **Server Error**
   - Status: 500 Internal Server Error
   - Message: Detail error dari server

## Development

### File yang Penting

1. **src/types/index.ts**: Definisi TypeScript interfaces
2. **src/services/auditor.ts**: Logic utama audit token
3. **src/server.ts**: Express server & API endpoints

### Menambah Fitur Baru

Untuk menambah parameter audit baru:

1. Update interface `AuditResult` di `src/types/index.ts`
2. Tambahkan logic di `SolanaTokenAuditor.auditToken()` di `src/services/auditor.ts`
3. Update algoritma risk scoring di `calculateRiskScore()`

## Security Notes

- Jangan commit file `.env` ke repository
- Gunakan RPC endpoint yang terpercaya
- Rate limiting direkomendasikan untuk production
- Validasi input selalu dilakukan di server

## Troubleshooting

### Error: "Cannot find module '@solana/web3.js'"

```bash
npm install
```

### Error: "RPC node is not responding"

- Cek koneksi internet
- Ganti `SOLANA_RPC_URL` di `.env` dengan RPC provider lain
- Gunakan paid RPC provider untuk reliability lebih baik

### Port sudah digunakan

Edit `PORT` di file `.env`:

```env
PORT=3001
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Senior Blockchain Developer specializing in Solana ecosystem

## Support

Jika ada pertanyaan atau issues, silakan buat issue di repository ini.
