import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTransactionHistory } from '@/lib/blockchain';
// import { getEthereumPrice } from '@/lib/coingecko';

export async function POST(request: NextRequest) {
  try {
    const { email, limit = 20, offset = 0 } = await request.json();

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

    // Fetch transaction history from blockchain
    // const [transactions, ethPrice] = await Promise.all([
    //   getTransactionHistory(account.publicKey, limit + offset),
    //   getEthereumPrice()
    // ]);


    // Fetch transaction history from blockchain
    const [transactions] = await Promise.all([
      getTransactionHistory(account.publicKey, limit + offset),
    ]);

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    return NextResponse.json({
      email,
      publicKey: account.publicKey,
      transactions: paginatedTransactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
        hasMore: transactions.length > offset + limit
      }
    });

  } catch (error) {
    console.error('Transaction history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}
