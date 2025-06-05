import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenBalance } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const { email, tokenAddress } = await request.json();

    if (!email || !tokenAddress) {
      return NextResponse.json(
        { error: 'Email address and token address are required' },
        { status: 400 }
      );
    }

    if (tokenAddress.toLowerCase() === 'native' || tokenAddress === '') {
      return NextResponse.json(
        { error: 'Use /api/wallet/balance for native token balance' },
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

    // Fetch token balance from blockchain
    const balance = await getTokenBalance(account.publicKey, tokenAddress);

    return NextResponse.json({
      email,
      publicKey: account.publicKey,
      tokenAddress,
      balance
    });

  } catch (error) {
    console.error('Token balance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}
