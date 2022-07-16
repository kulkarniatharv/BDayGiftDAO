import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import ethers from 'ethers';

import dotenv from 'dotenv';

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const alchemyApiUrl = process.env.ALCHEMY_API_URL;
const walletAddress = process.env.WALLET_ADDRESS;

// checks to ensure that necessary environment variables exist
if (!privateKey || privateKey === '') {
  console.log('🛑 Private Key not found.');
}

if (!alchemyApiUrl || alchemyApiUrl === '') {
  console.log('🛑 Alchemy API URL not found.');
}

if (!walletAddress || walletAddress === '') {
  console.log('🛑 Wallet Address not found.');
}

// console.log("process.env['PRIVATE_KEY']", process.env['PRIVATE_KEY']);
// console.log("process.env['ALCHEMY_API_URL']", process.env['ALCHEMY_API_URL']);
// console.log("process.env['WALLET_ADDRESS']", process.env['WALLET_ADDRESS']);

// RPC URL
const provider = new ethers.providers.JsonRpcProvider(alchemyApiUrl);
// setting up wallet
const wallet = new ethers.Wallet(privateKey, provider);
const sdk = new ThirdwebSDK(wallet);

(async () => {
  try {
    const address = await sdk.getSigner().getAddress();
    console.log('👋 SDK initialized by address:', address);
  } catch (err) {
    console.error('Failed to get apps from the sdk', err);
    process.exit(1);
  }
})();

export default sdk;
