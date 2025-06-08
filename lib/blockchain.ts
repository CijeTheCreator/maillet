import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export { provider };

// ERC-20 Token ABI (minimal)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

export async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string
): Promise<string> {
  try {
    if (tokenAddress.toLowerCase() === 'native' || tokenAddress === '') {
      // Get ETH balance
      const balance = await provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    } else {
      // Get ERC-20 token balance
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    }
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error}`);
  }
}

export async function getTransactionHistory(walletAddress: string, limit: number = 10) {
  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

  const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message}`);
    }

    const transactions: {
      hash: any;
      from: any;
      to: any;
      value: string;
      blockNumber: any;
      timestamp: number;
      gasPrice: any;
      gasLimit: any;
    }[] = data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      blockNumber: tx.blockNumber,
      timestamp: parseInt(tx.timeStamp),
      gasPrice: tx.gasPrice,
      gasLimit: tx.gas
    }));

    return transactions;

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}
