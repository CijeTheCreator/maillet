import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { provider } from '@/lib/blockchain';

const prisma = new PrismaClient();

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

    // Get faucet private key from environment
    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!faucetPrivateKey) {
      return NextResponse.json(
        { error: 'Faucet private key not configured' },
        { status: 500 }
      );
    }

    // Find account by email
    const account = await prisma.account.findUnique({
      where: {
        email: email
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found for this email address' },
        { status: 404 }
      );
    }

    // Create wallet from faucet private key
    const faucetWallet = new ethers.Wallet(faucetPrivateKey, provider);

    // Check faucet balance
    const faucetBalance = await provider.getBalance(faucetWallet.address);
    const amountToSend = ethers.parseEther('0.0025'); // 0.0025 ETH

    if (faucetBalance < amountToSend) {
      return NextResponse.json(
        { error: 'Insufficient faucet balance' },
        { status: 503 }
      );
    }

    // Check if recipient already has sufficient balance (optional rate limiting)
    const recipientBalance = await provider.getBalance(account.publicKey);
    const maxBalance = ethers.parseEther('0.01'); // Don't fund if they already have > 0.01 ETH

    if (recipientBalance > maxBalance) {
      return NextResponse.json(
        {
          error: 'Recipient already has sufficient balance',
          currentBalance: ethers.formatEther(recipientBalance)
        },
        { status: 400 }
      );
    }

    // Prepare transaction
    const transaction = {
      to: account.publicKey,
      value: amountToSend,
      gasLimit: 21000, // Standard gas limit for ETH transfer
    };

    // Send transaction
    const txResponse = await faucetWallet.sendTransaction(transaction);

    // Wait for transaction confirmation
    const receipt = await txResponse.wait();

    if (!receipt) {
      return NextResponse.json(
        { error: 'Transaction failed to confirm' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully funded wallet',
      data: {
        email: email,
        recipientAddress: account.publicKey,
        amount: '0.0025 ETH',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });

  } catch (error) {
    console.error('Faucet error:', error);

    // Handle specific ethers errors
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        return NextResponse.json(
          { error: 'Insufficient funds in faucet wallet' },
          { status: 503 }
        );
      }
      if (error.message.includes('nonce')) {
        return NextResponse.json(
          { error: 'Transaction nonce error. Please try again.' },
          { status: 500 }
        );
      }
      if (error.message.includes('gas')) {
        return NextResponse.json(
          { error: 'Gas estimation failed. Network may be congested.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: GET endpoint to check faucet status
export async function GET() {
  try {
    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
    if (!faucetPrivateKey) {
      return NextResponse.json(
        { error: 'Faucet not configured' },
        { status: 500 }
      );
    }

    const faucetWallet = new ethers.Wallet(faucetPrivateKey, provider);
    const balance = await provider.getBalance(faucetWallet.address);

    return NextResponse.json({
      faucetAddress: faucetWallet.address,
      balance: ethers.formatEther(balance),
      status: 'operational'
    });

  } catch (error) {
    console.error('Faucet status error:', error);
    return NextResponse.json(
      { error: 'Unable to check faucet status' },
      { status: 500 }
    );
  }
}
