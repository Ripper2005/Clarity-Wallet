'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Define the types based on our API contract
interface Warning {
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
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

interface ClarityModalProps {
  result: ClarityResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClarityModal({ result, isOpen, onClose }: ClarityModalProps) {
  if (!result) return null;

  const getSeverityIcon = (severity: Warning['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />;
      case 'HIGH':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />;
      case 'MEDIUM':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'INFO':
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: Warning['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-red-500/50 bg-red-900/20';
      case 'HIGH':
        return 'border-orange-500/50 bg-orange-900/20';
      case 'MEDIUM':
        return 'border-yellow-500/50 bg-yellow-900/20';
      case 'INFO':
        return 'border-blue-500/50 bg-blue-900/20';
      default:
        return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {result.isSuccess ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3" />
                  ) : (
                    <ExclamationCircleIcon className="w-6 h-6 text-red-400 mr-3" />
                  )}
                  <h2 className="text-xl font-bold text-white">
                    Transaction Simulation Result
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
                <div className={`p-4 rounded-lg border ${
                  result.isSuccess 
                    ? 'border-green-500/50 bg-green-900/20' 
                    : 'border-red-500/50 bg-red-900/20'
                }`}>
                  <p className={`text-base font-medium ${
                    result.isSuccess ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Asset Changes */}
              {result.assetChanges && result.assetChanges.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Asset Changes</h3>
                  <div className="space-y-3">
                    {result.assetChanges.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-600 rounded-lg"
                      >
                        <div className="flex items-center">
                          {change.changeType === 'SEND' ? (
                            <ArrowRightIcon className="w-5 h-5 text-red-400 mr-3" />
                          ) : (
                            <ArrowLeftIcon className="w-5 h-5 text-green-400 mr-3" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${
                                change.changeType === 'SEND' ? 'text-red-300' : 'text-green-300'
                              }`}>
                                {change.changeType}
                              </span>
                              <span className="text-sm text-gray-400">
                                {change.amount} {change.symbol}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {change.changeType === 'SEND' ? 'To' : 'From'}: {truncateAddress(
                                change.changeType === 'SEND' ? change.to : change.from
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          change.assetType === 'NATIVE' 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-purple-900/50 text-purple-300'
                        }`}>
                          {change.assetType}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Security Warnings</h3>
                  <div className="space-y-3">
                    {result.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getSeverityColor(warning.severity)}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-0.5">
                            {getSeverityIcon(warning.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className={`text-sm font-medium ${
                                warning.severity === 'CRITICAL' ? 'text-red-300' :
                                warning.severity === 'HIGH' ? 'text-orange-300' :
                                warning.severity === 'MEDIUM' ? 'text-yellow-300' :
                                'text-blue-300'
                              }`}>
                                {warning.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">
                              {warning.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {result.isSuccess && (
                  <Button 
                    onClick={() => {
                      // For the demo, this just closes the modal.
                      // In a real app, this would trigger the actual transaction signing.
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
                  >
                    Proceed with Transaction
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}