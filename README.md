# 🛡️ Clarity Wallet

**The smart wallet that removes the fear of losing keys and signing malicious transactions.**

Clarity Wallet is a next-generation Web3 wallet that solves two critical problems preventing mainstream crypto adoption:
- **Fear of losing private keys** through seedless onboarding with social login
- **Fear of signing malicious transactions** through AI-powered transaction simulation and risk analysis

## ✨ Features

### 🔐 **Seedless Authentication**
- Login with email, Google, or social accounts
- No seed phrases to lose or forget
- Powered by [Privy](https://privy.io)

### 🔍 **Transaction Clarity Engine**
- Real-time blockchain transaction simulation
- Clear explanations of what your transaction will do
- Balance validation and gas estimation
- Works with Sepolia testnet

### 🤖 **AI Portfolio Risk Scanner**
- Advanced DeFi position analysis
- Liquidation risk detection
- Portfolio diversification insights
- Smart contract risk assessment

### 💎 **Professional UI/UX**
- Clean, modern interface
- Smooth animations with Framer Motion
- Mobile-responsive design
- Professional modals and feedback

## 🚀 Live Demo

**Try it live:** [Clarity Wallet on Vercel](your-vercel-url-here)

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+, React, TypeScript, Tailwind CSS
- **Authentication:** Privy SDK (embedded wallets)
- **Blockchain:** Alchemy SDK, Ethers.js, Sepolia testnet
- **UI:** Framer Motion, Headless UI, Heroicons
- **Hosting:** Vercel

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Alchemy API key ([Get one here](https://alchemy.com))
- Privy App ID ([Create app here](https://dashboard.privy.io))

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/clarity-wallet.git
cd clarity-wallet
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Alchemy API Configuration
# Get your API key from: https://dashboard.alchemy.com/
ALCHEMY_API_KEY=your_sepolia_api_key_here

# Privy Authentication Configuration  
# Get your Privy App ID from: https://dashboard.privy.io/
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

**Important:** Make sure to use a **Sepolia testnet** API key from Alchemy, not mainnet.

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

### Transaction Simulation Flow
1. User enters recipient address and ETH amount
2. Clarity Engine calls Alchemy API to simulate the transaction
3. Real blockchain validation checks balance and estimates gas
4. Clear summary shows exactly what will happen
5. User can proceed with confidence or cancel

### AI Risk Analysis Flow
1. User clicks "Scan My Wallet for Risks"
2. AI analyzes real wallet balance and DeFi positions
3. Advanced algorithms check for:
   - Liquidation risks in lending protocols
   - Portfolio diversification issues
   - Smart contract exposure risks
   - Overall portfolio health
4. Detailed report with actionable insights

## 💰 Business Model

**Freemium SaaS Model:**
- **Free Tier:** Basic transaction simulation
- **Clarity Pro ($9.99/month):** 
  - Real-time risk monitoring
  - Advanced DeFi analysis
  - Custom risk thresholds
  - Portfolio optimization suggestions

## 🏗️ Architecture

```
clarity-wallet/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── simulate/          # Transaction simulation endpoint
│   │   │   └── risk-scan/         # AI risk analysis endpoint
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── ClarityModal.tsx       # Transaction simulation modal
│   │   └── RiskReportModal.tsx    # AI risk report modal
│   └── providers.tsx              # Privy authentication setup
├── package.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🧪 Testing with Sepolia

1. **Get Sepolia ETH:** Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Connect Wallet:** Login with Privy to create an embedded wallet
3. **Test Transactions:** Simulate transfers to see the Clarity Engine in action
4. **Risk Analysis:** Scan your wallet to see AI-powered insights

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Connect GitHub:** Link your repository to Vercel
2. **Environment Variables:** Add your API keys in Vercel dashboard
3. **Deploy:** Automatic deployment on every git push

```bash
# Environment variables needed in Vercel:
ALCHEMY_API_KEY=your_sepolia_api_key
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Privy](https://privy.io) for seamless Web3 authentication
- [Alchemy](https://alchemy.com) for reliable blockchain infrastructure
- [Next.js](https://nextjs.org) for the amazing React framework

---

**Built with ❤️ for the future of Web3 UX**

*Making crypto accessible, safe, and understandable for everyone.*
