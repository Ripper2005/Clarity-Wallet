// Test script to verify ERC20 approval detection
// This file demonstrates how the parseSimulationResult function handles ERC20 approvals

// Mock Alchemy response for infinite approval (as provided in the prompt)
const mockInfiniteApprovalResponse = {
  "changes": [
    {
      "assetType": "ERC20",
      "changeType": "APPROVE",
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "to": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      "rawAmount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "amount": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      "symbol": "USDC",
      "decimals": 6,
      "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "logo": "https://static.alchemyapi.io/images/assets/3408.png",
      "name": "USD Coin",
      "owner": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "spender": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
    }
  ]
};

// Mock Alchemy response for finite approval
const mockFiniteApprovalResponse = {
  "changes": [
    {
      "assetType": "ERC20",
      "changeType": "APPROVE",
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "to": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      "rawAmount": "1000000000", // 1000 USDC (6 decimals)
      "amount": "1000000000",
      "symbol": "USDC",
      "decimals": 6,
      "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "logo": "https://static.alchemyapi.io/images/assets/3408.png",
      "name": "USD Coin",
      "owner": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "spender": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
    }
  ]
};

// Expected outputs:
// For infinite approval:
// {
//   isSuccess: true,
//   summary: "You are giving 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45 UNLIMITED permission to spend your USDC.",
//   assetChanges: [],
//   warnings: [{
//     severity: 'CRITICAL',
//     message: 'This is a high-risk action. A malicious contract can withdraw all your USDC at any time. Only proceed if you absolutely trust this site.'
//   }]
// }

// For finite approval:
// {
//   isSuccess: true,
//   summary: "You are giving 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45 permission to spend up to 1000.0 USDC.",
//   assetChanges: [],
//   warnings: [{
//     severity: 'MEDIUM',
//     message: 'Ensure you trust this site with access to your tokens.'
//   }]
// }

console.log('Test cases created for ERC20 approval detection');
console.log('Run the API server and test with these mock responses to verify functionality');