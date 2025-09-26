import { NextRequest, NextResponse } from 'next/server';

// Define types for our risk analysis
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

// AI Risk Analysis Function
function analyzePositions(zapperData: any, walletAddress: string): Risk[] {
  const risks: Risk[] = [];
  
  try {
    console.log('Analyzing positions for:', walletAddress);
    console.log('Zapper data:', JSON.stringify(zapperData, null, 2));

    // Calculate total portfolio value and stablecoin percentage
    let totalValue = 0;
    let stablecoinValue = 0;
    let hasLendingPositions = false;
    
    // Process Zapper data if available
    if (zapperData && zapperData.data && Array.isArray(zapperData.data)) {
      for (const appData of zapperData.data) {
        if (appData.balances && Array.isArray(appData.balances)) {
          for (const balance of appData.balances) {
            const value = balance.balanceUSD || 0;
            totalValue += value;
            
            // Check for stablecoins (USDC, USDT, DAI, FRAX)
            const symbol = balance.token?.symbol?.toUpperCase();
            if (['USDC', 'USDT', 'DAI', 'FRAX', 'BUSD'].includes(symbol || '')) {
              stablecoinValue += value;
            }
            
            // Check for lending positions (Aave, Compound, etc.)
            if (appData.appId && ['aave-v2', 'aave-v3', 'compound'].includes(appData.appId)) {
              hasLendingPositions = true;
              
              // Rule 1: Liquidation Risk Analysis
              if (balance.healthRatio && balance.healthRatio < 1.2) {
                risks.push({
                  severity: 'CRITICAL',
                  message: `High liquidation risk detected on ${appData.appId}! Health ratio: ${balance.healthRatio.toFixed(2)}`,
                  category: 'Liquidation Risk'
                });
              } else if (balance.healthRatio && balance.healthRatio < 1.5) {
                risks.push({
                  severity: 'HIGH',
                  message: `Moderate liquidation risk on ${appData.appId}. Health ratio: ${balance.healthRatio.toFixed(2)}`,
                  category: 'Liquidation Risk'
                });
              }
            }
          }
        }
      }
    }

    // Rule 2: Diversification Analysis
    if (totalValue > 100) { // Only analyze if portfolio has meaningful value
      const stablecoinPercentage = stablecoinValue / totalValue;
      
      if (stablecoinPercentage < 0.10) {
        risks.push({
          severity: 'MEDIUM',
          message: `Low diversification: Only ${(stablecoinPercentage * 100).toFixed(1)}% in stablecoins. Consider adding stable assets to reduce volatility.`,
          category: 'Diversification'
        });
      }
      
      if (stablecoinPercentage > 0.80) {
        risks.push({
          severity: 'LOW',
          message: `Very conservative portfolio: ${(stablecoinPercentage * 100).toFixed(1)}% in stablecoins. Consider some growth assets.`,
          category: 'Diversification'
        });
      }
    }

    // Rule 3: Portfolio Size Analysis
    if (totalValue < 1) {
      risks.push({
        severity: 'LOW',
        message: 'Empty wallet detected. Consider adding some ETH from a Sepolia faucet to start testing DeFi features.',
        category: 'Portfolio Size'
      });
    } else if (totalValue < 50) {
      risks.push({
        severity: 'LOW',
        message: 'Small portfolio detected. Consider dollar-cost averaging to build your position over time.',
        category: 'Portfolio Size'
      });
    }

    // Rule 4: Yield Farming Risks (Demo logic)
    if (hasLendingPositions && totalValue > 1000) {
      risks.push({
        severity: 'MEDIUM',  
        message: 'Active DeFi positions detected. Monitor smart contract risks and consider position limits.',
        category: 'Smart Contract Risk'
      });
    }

    console.log(`Analysis complete. Found ${risks.length} risks.`);
    
  } catch (error) {
    console.error('Error analyzing positions:', error);
    risks.push({
      severity: 'LOW',
      message: 'Unable to complete full risk analysis. Some data may be unavailable.',
      category: 'Analysis Error'
    });
  }

  return risks;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('Starting risk scan for wallet:', walletAddress);

    let zapperData = null;
    let totalPortfolioValue = 0;

    // Try to fetch from Zapper API (with fallback for demo)
    try {
      // For now, we'll use a demo response since getting Zapper API key takes time
      // In production, this would be:
      // const zapperResponse = await fetch(`https://api.zapper.xyz/v2/apps-balances?addresses[]=${walletAddress}`, {
      //   headers: {
      //     'Authorization': `Basic ${Buffer.from(process.env.ZAPPER_API_KEY + ':').toString('base64')}`
      //   }
      // });
      
      // Get the user's actual balance instead of using fake data
      const balanceResponse = await fetch(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest']
        })
      });

      let actualBalance = '0';
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.result) {
          actualBalance = balanceData.result;
        }
      }

      // Convert wei to ETH and then to USD (using approximate ETH price of $2500)
      const ethBalance = parseFloat(actualBalance) / Math.pow(10, 18);
      const ethPriceUSD = 2500; // Approximate ETH price
      const portfolioValueUSD = ethBalance * ethPriceUSD;

      // Create realistic data based on actual wallet balance
      zapperData = {
        data: [
          {
            appId: 'ethereum',
            balances: [
              {
                token: { symbol: 'ETH' },
                balanceUSD: portfolioValueUSD,
                balance: ethBalance.toString()
              }
            ]
          }
        ]
      };

      // Calculate total portfolio value from demo data
      if (zapperData?.data) {
        for (const app of zapperData.data) {
          if (app.balances) {
            for (const balance of app.balances) {
              totalPortfolioValue += balance.balanceUSD || 0;
            }
          }
        }
      }

    } catch (zapperError) {
      console.error('Zapper API error:', zapperError);
      // Continue with analysis using available data
    }

    // Run AI Risk Analysis
    const risks = analyzePositions(zapperData, walletAddress);

    const result: RiskScanResult = {
      walletAddress,
      totalPortfolioValue,
      risksFound: risks,
      scanTimestamp: new Date().toISOString()
    };

    console.log('Risk scan complete:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Risk scan error:', error);
    return NextResponse.json(
      { 
        error: 'Risk scan failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}