'use client';

import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, WalletIcon } from '@heroicons/react/24/outline';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const { authenticated, login } = usePrivy();

  if (authenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center px-6 py-12 max-w-md mx-auto">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <WalletIcon className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Clarity Wallet
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-gray-300 text-lg mb-8 leading-relaxed"
        >
          The smart wallet that removes the fear of losing keys and signing malicious transactions.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-4 mb-10"
        >
          <div className="flex items-center text-gray-300 text-sm">
            <ShieldCheckIcon className="w-5 h-5 text-green-400 mr-3" />
            <span>Seedless onboarding with email/social login</span>
          </div>
          <div className="flex items-center text-gray-300 text-sm">
            <ShieldCheckIcon className="w-5 h-5 text-green-400 mr-3" />
            <span>Transaction clarity before you sign</span>
          </div>
        </motion.div>

        {/* Login Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Login to Clarity Wallet
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-gray-500 text-xs mt-8"
        >
          Secure • Simple • Clear
        </motion.p>
      </div>
    </div>
  );
}
