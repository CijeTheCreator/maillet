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
  try {
    // Get latest block number
    const latestBlock = await provider.getBlockNumber();
    const transactions = [];

    // Search through recent blocks for transactions involving this address
    const blocksToSearch = Math.min(1000, latestBlock);

    for (let i = 0; i < blocksToSearch && transactions.length < limit; i++) {
      const blockNumber = latestBlock - i;
      const block = await provider.getBlock(blockNumber, true);

      if (block && block.transactions) {
        for (const tx of block.transactions) {
          if (typeof tx === 'object' && tx !== null) {
            if (tx.to?.toLowerCase() === walletAddress.toLowerCase() ||
              tx.from?.toLowerCase() === walletAddress.toLowerCase()) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: ethers.formatEther(tx.value || '0'),
                blockNumber: tx.blockNumber,
                timestamp: block.timestamp,
                gasPrice: tx.gasPrice?.toString(),
                gasLimit: tx.gasLimit?.toString()
              });

              if (transactions.length >= limit) break;
            }
          }
        }
      }
    }

    return transactions;
  } catch (error) {
    throw new Error(`Failed to get transaction history: ${error}`);
  }
}
