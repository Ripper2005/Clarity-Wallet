import { NextRequest, NextResponse } from 'next/server';
import { Alchemy, Network } from 'alchemy-sdk';
import { formatEther, formatUnits } from 'ethers';

// Define interfaces for the simulation response
interface SimulationError {
  message?: string;
}

interface SimulationChange {
  assetType: string;
  changeType: string;
  from: string;
  to: string;
  amount: string;
  symbol?: string;
  decimals?: number;
  spender?: string;
  healthRatio?: number;
}

interface SimulationResponse {
  error?: SimulationError;
  changes?: SimulationChange[];
  gasUsed?: string;
  isValid?: boolean;
  warnings?: Warning[];
}

// Define the TypeScript interfaces for the API contract
interface SimulateTransactionRequest {
  from: string;      // The user's wallet address (e.g., "0x...")
  to: string;        // The destination address
  value: string;     // The amount of ETH to send, in wei (as a string)
  data?: string;     // Optional: for contract interactions (we will ignore for now)
  network: 'sepolia' // We will hardcode to the Sepolia testnet for the MVP
}

interface AssetChange {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721';
  changeType: 'SEND' | 'RECEIVE';
  symbol: string;
  amount: string;
  from: string;
  to: string;
}

interface Warning {
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

interface ClarityResult {
  isSuccess: boolean;
  summary: string;
  assetChanges: AssetChange[];
  warnings: Warning[];
}

// Initialize Alchemy SDK for Sepolia network
const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
});

// Add GET handler for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'API is working', 
    hasApiKey: !!process.env.ALCHEMY_API_KEY,
    apiKeyLength: process.env.ALCHEMY_API_KEY?.length || 0
  });
}

// Helper function to parse Alchemy simulation results into ClarityResult format
function parseSimulationResult(alchemyResponse: SimulationResponse, userAddress: string): ClarityResult {
  // Safety check: if there's an error in the response
  if (alchemyResponse.error) {
    return {
      isSuccess: false,
      summary: `Simulation failed: ${alchemyResponse.error.message || 'Unknown error'}`,
      assetChanges: [],
      warnings: [
        {
          severity: 'CRITICAL',
          message: 'Transaction simulation encountered an error'
        }
      ]
    };
  }

  // Main logic: iterate through changes to find native ETH transfers
  if (alchemyResponse.changes && Array.isArray(alchemyResponse.changes)) {
    for (const change of alchemyResponse.changes) {
      // Look for native ETH transfers
      if (change.assetType === 'NATIVE' && change.changeType === 'TRANSFER') {
        // Extract data from the change object
        const { from, to, amount, symbol } = change;
        
        // Format the amount from hex/wei to human-readable ETH
        const formattedAmount = formatEther(amount);
        
        // Construct and return the ClarityResult
        return {
          isSuccess: true,
          summary: `You are sending ${formattedAmount} ${symbol || 'ETH'} to ${to}.`,
          assetChanges: [
            {
              assetType: 'NATIVE',
              changeType: 'SEND',
              symbol: symbol || 'ETH',
              amount: formattedAmount,
              from: from,
              to: to
            }
          ],
          warnings: []
        };
      }
      // Look for ERC20 token approvals
      else if (change.assetType === 'ERC20' && change.changeType === 'APPROVE') {
        // Extract data from the change object
        const { spender, symbol } = change;
        
        // Check if this is an infinite approval (max uint256)
        if (change.amount === '115792089237316195423570985008687907853269984665640564039457584007913129639935') {
          // Infinite approval - CRITICAL warning
          return {
            isSuccess: true,
            summary: `You are giving ${spender} UNLIMITED permission to spend your ${symbol}.`,
            assetChanges: [], // Approvals do not move assets directly
            warnings: [{
              severity: 'CRITICAL',
              message: `This is a high-risk action. A malicious contract can withdraw all your ${symbol} at any time. Only proceed if you absolutely trust this site.`
            }]
          };
        } else {
          // Finite approval - MEDIUM warning
          const formattedAmount = formatUnits(change.amount, change.decimals || 18);
          return {
            isSuccess: true,
            summary: `You are giving ${spender} permission to spend up to ${formattedAmount} ${symbol}.`,
            assetChanges: [],
            warnings: [{
              severity: 'MEDIUM',
              message: 'Ensure you trust this site with access to your tokens.'
            }]
          };
        }
      }
      // Look for ERC20 token transfers
      else if (change.assetType === 'ERC20' && change.changeType === 'TRANSFER') {
        // Extract data from the change object
        const { from, to, symbol } = change;
        
        // Format the amount using proper decimals
        const formattedAmount = formatUnits(change.amount, change.decimals || 18);
        
        // Contextual logic: determine if user is sending or receiving
        if (change.from.toLowerCase() === userAddress.toLowerCase()) {
          // User is SENDING tokens
          return {
            isSuccess: true,
            summary: `You are sending ${formattedAmount} ${symbol} to ${to}.`,
            assetChanges: [{
              assetType: 'ERC20',
              changeType: 'SEND',
              symbol: symbol || 'UNKNOWN',
              amount: formattedAmount,
              from: from,
              to: to
            }],
            warnings: []
          };
        } else if (change.to.toLowerCase() === userAddress.toLowerCase()) {
          // User is RECEIVING tokens
          return {
            isSuccess: true,
            summary: `You are receiving ${formattedAmount} ${symbol} from ${from}.`,
            assetChanges: [{
              assetType: 'ERC20',
              changeType: 'RECEIVE',
              symbol: symbol || 'UNKNOWN',
              amount: formattedAmount,
              from: from,
              to: to
            }],
            warnings: []
          };
        }
      }
    }
  }

  // Default case: no relevant asset changes found
  return {
    isSuccess: true,
    summary: "No native asset changes were detected in this transaction.",
    assetChanges: [],
    warnings: [
      {
        severity: 'INFO',
        message: 'Transaction simulation completed but no asset changes were detected'
      }
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body: SimulateTransactionRequest = await request.json();
    
    // Log the received request body for debugging
    console.log('Received simulation request:', body);
    
    // Validate required fields
    if (!body.from || !body.to || !body.value || !body.network) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, value, network' },
        { status: 400 }
      );
    }

    // Validate API key is configured
    console.log('API Key check:', process.env.ALCHEMY_API_KEY ? 'Present' : 'Missing');
    if (!process.env.ALCHEMY_API_KEY) {
      console.error('ALCHEMY_API_KEY environment variable is not set');
      return NextResponse.json(
        { 
          isSuccess: false,
          summary: 'API configuration error',
          assetChanges: [],
          warnings: [
            {
              severity: 'CRITICAL',
              message: 'Server configuration error: missing API key'
            }
          ]
        },
        { status: 500 }
      );
    }
    
    // Since simulateAssetChanges isn't available, let's create our own simulation
    // using available Alchemy methods to validate the transaction
    const transactionRequest = {
      from: body.from,
      to: body.to,
      value: body.value,
      data: body.data || '0x',
    };

    console.log('Simulating transaction with available methods:', transactionRequest);
    
    try {
      console.log('About to check balance for address:', body.from);
      console.log('Using API key length:', process.env.ALCHEMY_API_KEY?.length);
      
      // Make direct HTTP request instead of using SDK to avoid potential issues
      const balanceResponse = await fetch(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [body.from, 'latest']
        })
      });

      if (!balanceResponse.ok) {
        throw new Error(`Balance check failed: ${balanceResponse.status}`);
      }

      const balanceData = await balanceResponse.json();
      console.log('Balance response:', balanceData);

      if (balanceData.error) {
        throw new Error(`Balance check error: ${balanceData.error.message}`);
      }

      const balanceWei = balanceData.result;
      const balanceInEth = parseFloat(formatEther(balanceWei));
      const sendingEth = parseFloat(formatEther(body.value));
      
      console.log('Balance retrieved successfully:', balanceWei, '(', balanceInEth, 'ETH)');
      
      console.log(`Balance: ${balanceInEth} ETH, Sending: ${sendingEth} ETH`);
      
      // Check if sender has enough balance (convert both to numbers for comparison)
      const hasEnoughBalance = balanceInEth >= sendingEth;
      
      let gasEstimate = "21000"; // Standard ETH transfer gas
      let warnings = [];
      
      // Try to estimate gas, but don't fail if it doesn't work
      try {
        const gas = await alchemy.core.estimateGas(transactionRequest);
        gasEstimate = gas.toString();
        console.log('Gas estimate successful:', gasEstimate);
      } catch (gasError: any) {
        console.log('Gas estimation failed, using default:', gasError.message);
        warnings.push({
          severity: 'MEDIUM' as const,
          message: 'Could not estimate gas precisely. Using standard estimate.'
        });
      }
      
      // Add balance warnings
      if (!hasEnoughBalance) {
        warnings.push({
          severity: 'CRITICAL' as const,
          message: `Insufficient balance. You have ${balanceInEth.toFixed(4)} ETH but trying to send ${sendingEth.toFixed(4)} ETH.`
        });
      } else if (sendingEth > 0.1) {
        warnings.push({
          severity: 'HIGH' as const,
          message: `You are sending ${sendingEth.toFixed(4)} ETH. This is a significant amount - please verify the recipient address.`
        });
      } else if (sendingEth > 0.01) {
        warnings.push({
          severity: 'MEDIUM' as const,
          message: 'Double-check the recipient address before confirming this transaction.'
        });
      }
      
      // Create a realistic simulation response
      const simulationResponse = {
        changes: [
          {
            assetType: 'NATIVE',
            changeType: 'TRANSFER',
            from: body.from,
            to: body.to,
            amount: body.value,
            symbol: 'ETH',
            decimals: 18
          }
        ],
        gasUsed: gasEstimate,
        isValid: hasEnoughBalance,
        warnings: warnings
      };
      
      console.log('Simulation response:', JSON.stringify(simulationResponse, null, 2));
      
      // Parse the simulation result and return it
      const clarityResult = parseSimulationResult(simulationResponse, body.from);
      return NextResponse.json(clarityResult);
      
    } catch (error: any) {
      console.error('Balance check failed:', error);
      throw new Error(`Failed to check account balance: ${error.message}`);
    }
    
  } catch (error) {
    console.error('Error processing simulation request:', error);
    
    // Return error response in ClarityResult format
    return NextResponse.json(
      {
        isSuccess: false,
        summary: `Transaction simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        assetChanges: [],
        warnings: [
          {
            severity: 'CRITICAL',
            message: 'Failed to simulate transaction'
          }
        ]
      },
      { status: 500 }
    );
  }
}