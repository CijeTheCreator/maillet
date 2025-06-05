interface CoinGeckoPrice {
  ethereum: {
    usd: number;
  };
}

export async function getEthereumPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum&names=Ethereum&symbols=eth',
      {
        headers: {
          'accept': 'application/json',
          'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || ''
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoPrice = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error('Failed to fetch Ethereum price:', error);
    throw new Error('Unable to fetch current ETH price');
  }
}
