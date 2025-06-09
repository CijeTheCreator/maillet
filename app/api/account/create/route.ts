import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { provider } from '@/lib/blockchain';

// Internal faucet function (extracted from the faucet route)
async function fundWallet(walletAddress: string) {
  const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!faucetPrivateKey) {
    throw new Error('Faucet private key not configured');
  }

  const faucetWallet = new ethers.Wallet(faucetPrivateKey, provider);
  const amountToSend = ethers.parseEther('0.0025'); // 0.0025 ETH

  // Check faucet balance
  const faucetBalance = await provider.getBalance(faucetWallet.address);
  if (faucetBalance < amountToSend) {
    throw new Error('Insufficient faucet balance');
  }

  // Prepare and send transaction
  const transaction = {
    to: walletAddress,
    value: amountToSend,
    gasLimit: 21000,
  };

  const txResponse = await faucetWallet.sendTransaction(transaction);
  const receipt = await txResponse.wait();

  if (!receipt) {
    throw new Error('Transaction failed to confirm');
  }

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString()
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Fund the newly created wallet
    let fundingResult = null;
    let fundingError = null;

    try {
      fundingResult = await fundWallet(publicKey);
      console.log(`Successfully funded wallet ${publicKey} for email ${email}`);
    } catch (error) {
      console.error(`Failed to fund wallet ${publicKey} for email ${email}:`, error);
      fundingError = error instanceof Error ? error.message : 'Unknown funding error';

      // Don't fail account creation if funding fails
      // The account is still created, but without initial funding
    }

    return NextResponse.json({
      email: account.email,
      publicKey: account.publicKey,
      message: 'Account created successfully',
      accountCreated: true,
      funding: fundingResult ? {
        success: true,
        amount: '0.0025 ETH',
        transactionHash: fundingResult.transactionHash,
        blockNumber: fundingResult.blockNumber,
        gasUsed: fundingResult.gasUsed
      } : {
        success: false,
        error: fundingError,
        message: 'Account created but initial funding failed. You can request funding later.'
      }
    });

  } catch (error) {
    console.error('Account creation error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Email validation failed' },
          { status: 400 }
        );
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Account with this email already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
