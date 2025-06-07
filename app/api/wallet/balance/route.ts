import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenBalance } from '@/lib/blockchain';
import { getEthereumPrice } from '@/lib/coingecko';

export async function POST(request: NextRequest) {
  try {
    const { email, tokenAddress = 'native' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Get public key from database
    const account = await prisma.account.findUnique({
      where: { email },
      select: { publicKey: true }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Fetch balance from blockchain
    const balance = await getTokenBalance(account.publicKey, tokenAddress);

    let priceUsd: number | null = null;
    let balanceUsd: number | null = null;

    // Get USD price for native Ethereum
    if (tokenAddress.toLowerCase() === 'native' || tokenAddress === '') {
      try {
        priceUsd = await getEthereumPrice();
        console.log("DEBUG:  ", priceUsd)
        balanceUsd = parseFloat(balance) * priceUsd;
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        // Continue without price data
      }
    }

    const response: any = {
      email,
      publicKey: account.publicKey,
      tokenAddress,
      balance,
      symbol: tokenAddress.toLowerCase() === 'native' || tokenAddress === '' ? 'ETH' : 'TOKEN'
    };

    // Add price data if available
    if (priceUsd !== null) {
      response.priceUsd = priceUsd;
      response.balanceUsd = balanceUsd;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
