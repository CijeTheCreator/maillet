import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { email },
      select: { encryptedPrivateKey: true, email: true }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Decrypt private key
    const privateKey = decrypt(account.encryptedPrivateKey);

    return NextResponse.json({
      email: account.email,
      privateKey
    });

  } catch (error) {
    console.error('Fetch private key error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
