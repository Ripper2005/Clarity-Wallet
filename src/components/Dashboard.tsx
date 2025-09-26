'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseEther, formatEther, BrowserProvider } from 'ethers';
import { 
  WalletIcon, 
  DocumentMagnifyingGlassIcon, 
  ClipboardDocumentIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ClarityModal from '@/components/ClarityModal';
import { RiskReportModal } from '@/components/RiskReportModal';

// Define the types for our API
interface Warning {
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

interface Risk {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  category: string;
}

interface RiskScanResult {
  walletAddress: string;
  totalPortfolioValue: number;
  risksFound: Risk[];
  scanTimestamp: string;
}

interface AssetChange {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721';
  changeType: 'SEND' | 'RECEIVE';
  symbol: string;
  amount: string;
  from: string;
  to: string;
}

interface ClarityResult {
  isSuccess: boolean;
  summary: string;
  assetChanges: AssetChange[];
  warnings: Warning[];
}

export default function Dashboard() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ClarityResult | null>(null);
  
  // Risk scan state
  const [isScanning, setIsScanning] = useState(false);
  const [riskReport, setRiskReport] = useState<RiskScanResult | null>(null);
  
  // Live balance state
  const [balance, setBalance] = useState<string>('0.0000');

  // Fetch live wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
        if (embeddedWallet) {
          const provider = await embeddedWallet.getEthereumProvider();
          const ethersProvider = new BrowserProvider(provider);
          const userBalance = await ethersProvider.getBalance(embeddedWallet.address);
          setBalance(parseFloat(formatEther(userBalance)).toFixed(4));
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0.0000');
      }
    };

    if (wallets.length > 0) {
      fetchBalance();
    }
  }, [wallets]);

  const handleCopyAddress = async () => {
    if (user?.wallet?.address) {
      await navigator.clipboard.writeText(user.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSimulate = async () => {
    // Input validation
    if (!recipientAddress.trim() || !amount.trim()) {
      setSimulationResult({
        isSuccess: false,
        summary: 'Please fill in both recipient address and amount fields.',
        assetChanges: [],
        warnings: [{
          severity: 'MEDIUM',
          message: 'Both recipient address and amount are required for simulation.'
        }]
      });
      return;
    }

    if (!user?.wallet?.address) {
      setSimulationResult({
        isSuccess: false,
        summary: 'Wallet address not found. Please try logging in again.',
        assetChanges: [],
        warnings: [{
          severity: 'CRITICAL',
          message: 'Unable to determine your wallet address.'
        }]
      });
      return;
    }

    setIsLoading(true);
    setSimulationResult(null);

    try {
      // Convert amount from ETH to wei
      const valueInWei = parseEther(amount).toString();

      // Prepare the API request body
      const requestBody = {
        from: user.wallet.address,
        to: recipientAddress.trim(),
        value: valueInWei,
        network: 'sepolia' as const
      };

      // Make the API call
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data: ClarityResult = await response.json();
        setSimulationResult(data);
      } else {
        // Handle API error response
        const errorData = await response.json().catch(() => ({}));
        setSimulationResult({
          isSuccess: false,
          summary: errorData.summary || `API request failed with status ${response.status}`,
          assetChanges: [],
          warnings: [{
            severity: 'CRITICAL',
            message: errorData.details || 'Failed to simulate transaction. Please try again.'
          }]
        });
      }
    } catch (error) {
      // Handle network or parsing errors
      console.error('Error during simulation:', error);
      setSimulationResult({
        isSuccess: false,
        summary: 'Failed to simulate transaction due to a network error.',
        assetChanges: [],
        warnings: [{
          severity: 'CRITICAL',
          message: error instanceof Error ? error.message : 'Unknown error occurred during simulation.'
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiskScan = async () => {
    if (!user?.wallet?.address) {
      return;
    }

    setIsScanning(true);
    setRiskReport(null);

    try {
      const response = await fetch(`/api/risk-scan?address=${user.wallet.address}`);
      
      if (response.ok) {
        const data: RiskScanResult = await response.json();
        setRiskReport(data);
      } else {
        console.error('Risk scan failed:', response.status);
        // Could add error handling here
      }
    } catch (error) {
      console.error('Error during risk scan:', error);
      // Could add error handling here
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Clarity Wallet Dashboard
          </h1>
          <p className="text-gray-400">
            Your secure gateway to Web3, with transaction clarity
          </p>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Wallet Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <div className="flex items-center mb-4">
                <WalletIcon className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">
                  Wallet Details
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2">
                      <code className="text-sm text-gray-300 font-mono">
                        {user?.wallet?.address ? truncateAddress(user.wallet.address) : 'Loading...'}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="min-w-[80px]"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Balance
                  </label>
                  <div className="bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2">
                    <span className="text-lg font-semibold text-white">
                      {balance} ETH
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      (Sepolia Testnet)
                    </span>
                  </div>
                </div>

                {/* Network Info */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-green-400 font-medium">Sepolia Testnet</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Simulate Transaction Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <div className="flex items-center mb-4">
                <DocumentMagnifyingGlassIcon className="w-6 h-6 text-green-400 mr-3" />
                <h2 className="text-xl font-semibold text-white">
                  Test the Clarity Engine
                </h2>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                Simulate any transaction to see exactly what will happen before you sign.
              </p>

              <div className="space-y-4">
                {/* Recipient Address Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount (ETH)
                  </label>
                  <input
                    type="text"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                {/* Simulate Button */}
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={handleSimulate}
                    disabled={isLoading}
                  >
                    <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    {isLoading ? 'Simulating...' : 'Simulate Transaction'}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mt-4">
                  <p className="text-blue-300 text-xs">
                    💡 This will show you exactly what your transaction will do before you sign it.
                    No gas fees required for simulation!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* AI Risk Scan Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center justify-center">
                <span className="mr-2">🤖</span>
                AI Portfolio Risk Scanner
                <span className="ml-2 px-2 py-1 text-xs bg-purple-600 rounded-full">NEW</span>
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Get an AI-powered analysis of your DeFi positions and discover hidden risks in your portfolio.
                Our advanced algorithms scan for liquidation risks, diversification issues, and more.
              </p>
              <Button
                onClick={handleRiskScan}
                disabled={isScanning || !user?.wallet?.address}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg font-semibold"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing Portfolio...
                  </>
                ) : (
                  <>
                    🔍 Scan My Wallet for Risks
                  </>
                )}
              </Button>
              
              {isScanning && (
                <div className="text-center mt-4 text-sm text-purple-300 animate-pulse">
                  <p className="mb-1">🤖 AI is analyzing your portfolio...</p>
                  <p className="text-xs opacity-75">
                    Checking liquidation risks • Analyzing diversification • Scanning DeFi positions
                  </p>
                </div>
              )}
              
              <p className="text-purple-300 text-xs mt-2">
                ✨ Powered by Clarity Pro AI • Free scan included
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <Card>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                🛡️ Your transactions are protected by Clarity Engine
              </h3>
              <p className="text-gray-400 text-sm">
                We simulate every transaction before you sign to detect scams, 
                malicious contracts, and unexpected outcomes.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Clarity Modal */}
      <ClarityModal
        result={simulationResult}
        isOpen={!!simulationResult}
        onClose={() => setSimulationResult(null)}
      />

      {/* Risk Report Modal */}
      <RiskReportModal
        riskReport={riskReport}
        isOpen={!!riskReport}
        onClose={() => setRiskReport(null)}
      />
    </div>
  );
}