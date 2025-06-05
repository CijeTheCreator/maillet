import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTransactionHistory } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const { email, limit = 10 } = await request.json();

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

    // Fetch transactions from blockchain
    const transactions = await getTransactionHistory(account.publicKey, limit);

    return NextResponse.json({
      email,
      publicKey: account.publicKey,
      transactions
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
