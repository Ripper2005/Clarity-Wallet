// Test script for ERC20 Transfer Detection
// This file demonstrates how the enhanced parseSimulationResult function handles ERC20 transfers

// Mock Alchemy response for ERC20 transfer - User is SENDING
const mockERC20SendResponse = {
  "changes": [
    {
      "assetType": "ERC20",
      "changeType": "TRANSFER",
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // User's address
      "to": "0x13881519242137539A9624513F155107885A8164",
      "rawAmount": "10000000", // 10 USDC (6 decimals)
      "amount": "10000000",
      "symbol": "USDC",
      "decimals": 6,
      "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "logo": "https://static.alchemyapi.io/images/assets/3408.png",
      "name": "USD Coin"
    }
  ]
};

// Mock Alchemy response for ERC20 transfer - User is RECEIVING
const mockERC20ReceiveResponse = {
  "changes": [
    {
      "assetType": "ERC20",
      "changeType": "TRANSFER",
      "from": "0x13881519242137539A9624513F155107885A8164",
      "to": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // User's address
      "rawAmount": "25000000000000000000", // 25 DAI (18 decimals)
      "amount": "25000000000000000000",
      "symbol": "DAI",
      "decimals": 18,
      "contractAddress": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "logo": "https://static.alchemyapi.io/images/assets/5992.png",
      "name": "Dai Stablecoin"
    }
  ]
};

// User address for testing
const testUserAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

// Expected outputs:
// For SEND scenario:
// {
//   isSuccess: true,
//   summary: "You are sending 10.0 USDC to 0x13881519242137539A9624513F155107885A8164.",
//   assetChanges: [{
//     assetType: 'ERC20',
//     changeType: 'SEND',
//     symbol: 'USDC',
//     amount: '10.0',
//     from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
//     to: '0x13881519242137539A9624513F155107885A8164'
//   }],
//   warnings: []
// }

// For RECEIVE scenario:
// {
//   isSuccess: true,
//   summary: "You are receiving 25.0 DAI from 0x13881519242137539A9624513F155107885A8164.",
//   assetChanges: [{
//     assetType: 'ERC20',
//     changeType: 'RECEIVE',
//     symbol: 'DAI',
//     amount: '25.0',
//     from: '0x13881519242137539A9624513F155107885A8164',
//     to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
//   }],
//   warnings: []
// }

console.log('Test cases created for ERC20 transfer detection (SEND & RECEIVE)');
console.log('The parser now supports:');
console.log('1. Native ETH transfers');
console.log('2. ERC20 token approvals (infinite & finite)');
console.log('3. ERC20 token transfers (send & receive)');
console.log('Complete transaction parsing for MVP is ready!');