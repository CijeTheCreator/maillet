import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Check if account already exists
    const existingAccount = await prisma.account.findUnique({
      where: { email },
      select: { email: true, publicKey: true }
    });

    if (existingAccount) {
      return NextResponse.json({
        email: existingAccount.email,
        publicKey: existingAccount.publicKey,
        message: 'Account already exists',
        accountCreated: false
      });
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const publicKey = wallet.address;

    // Encrypt private key
    const encryptedPrivateKey = encrypt(privateKey);

    // Store in database
    const account = await prisma.account.create({
      data: {
        email,
        publicKey,
        encryptedPrivateKey
      }
    });

    return NextResponse.json({
      email: account.email,
      publicKey: account.publicKey,
      message: 'Account created successfully',
      accountCreated: true
    });

  } catch (error) {
    console.error('Account creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
