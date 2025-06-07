type CoinGeckoPriceResponse = {
  ethereum?: {
    usd: number;
  };
};

export async function getEthereumPrice(): Promise<number> {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

  try {
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        // If you need to use an API key, uncomment and adjust this:
        // 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY || 'your-key-here'
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data: CoinGeckoPriceResponse = await response.json();

    if (!data.ethereum || typeof data.ethereum.usd !== 'number') {
      throw new Error('Unexpected response structure from CoinGecko API');
    }

    console.log('Ethereum price:', data.ethereum.usd);
    return data.ethereum.usd;
  } catch (error: any) {
    console.error('Failed to fetch Ethereum price:', error.message || error);
    throw new Error('Unable to fetch current ETH price');
  }
}
