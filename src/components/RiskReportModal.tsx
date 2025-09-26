'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';

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

interface RiskReportModalProps {
  riskReport: RiskScanResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'text-red-400 bg-red-900/20 border-red-500/30';
    case 'HIGH': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    case 'LOW': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return <ExclamationCircleIcon className="w-5 h-5" />;
    case 'HIGH': return <ExclamationTriangleIcon className="w-5 h-5" />;
    case 'MEDIUM': return <ExclamationTriangleIcon className="w-5 h-5" />;
    case 'LOW': return <InformationCircleIcon className="w-5 h-5" />;
    default: return <InformationCircleIcon className="w-5 h-5" />;
  }
};

export function RiskReportModal({ riskReport, isOpen, onClose }: RiskReportModalProps) {
  if (!riskReport) return null;

  const { risksFound, totalPortfolioValue, walletAddress, scanTimestamp } = riskReport;
  const hasRisks = risksFound.length > 0;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {hasRisks ? (
                      <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                    )}
                    <div>
                      <Dialog.Title className="text-2xl font-bold text-white">
                        AI Wallet Risk Report
                      </Dialog.Title>
                      <p className="text-sm text-gray-400">
                        Portfolio Value: ${totalPortfolioValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Scan Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Wallet Address:</span>
                        <p className="text-white font-mono text-xs break-all">
                          {walletAddress}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Scan Time:</span>
                        <p className="text-white">
                          {new Date(scanTimestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Results */}
                  {!hasRisks ? (
                    <div className="text-center py-8">
                      <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-400 mb-2">
                        Excellent Portfolio Health!
                      </h3>
                      <p className="text-gray-300">
                        Our AI analysis found no immediate high-risk issues in your portfolio. 
                        Keep monitoring your positions and maintain good risk management practices.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Risk Analysis Results ({risksFound.length} issues found)
                      </h3>
                      <div className="space-y-3">
                        {risksFound.map((risk, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${getSeverityColor(risk.severity)}`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getSeverityIcon(risk.severity)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-semibold text-sm">
                                    {risk.severity}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-black/20">
                                    {risk.category}
                                  </span>
                                </div>
                                <p className="text-sm opacity-90">
                                  {risk.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clarity Pro Upsell */}
                  <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">✨</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Upgrade to Clarity Pro</h4>
                        <p className="text-sm text-gray-300">Get advanced risk monitoring & alerts</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      • Real-time risk monitoring • Advanced DeFi position analysis 
                      • Custom risk thresholds • Portfolio optimization suggestions
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Upgrade to Pro - $9.99/month
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                  >
                    Close Report
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Implement scan again functionality
                      onClose();
                    }}
                  >
                    Scan Again
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}