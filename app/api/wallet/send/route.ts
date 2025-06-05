import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/crypto';
import { provider, ERC20_ABI } from '@/lib/blockchain';

export async function POST(request: NextRequest) {
  try {
    const {
      fromEmail,
      toEmailOrAddress,
      amount,
      tokenAddress = 'native'
    } = await request.json();

    if (!fromEmail || !toEmailOrAddress || !amount) {
      return NextResponse.json(
        { error: 'fromEmail, toEmailOrAddress, and amount are required' },
        { status: 400 }
      );
    }

    // Get or create sender's account
    let senderAccount = await prisma.account.findUnique({
      where: { email: fromEmail },
      select: { encryptedPrivateKey: true, publicKey: true }
    });

    let senderAccountCreated = false;

    if (!senderAccount) {
      // Create new account for sender
      const wallet = ethers.Wallet.createRandom();
      const privateKey = wallet.privateKey;
      const publicKey = wallet.address;
      const encryptedPrivateKey = encrypt(privateKey);

      senderAccount = await prisma.account.create({
        data: {
          email: fromEmail,
          publicKey,
          encryptedPrivateKey
        },
        select: { encryptedPrivateKey: true, publicKey: true }
      });

      senderAccountCreated = true;
    }

    // Determine recipient address and handle recipient account creation
    let recipientAddress: string;
    let recipientAccountCreated = false;

    if (ethers.isAddress(toEmailOrAddress)) {
      recipientAddress = toEmailOrAddress;
    } else {
      // It's an email, look up or create the address
      let recipientAccount = await prisma.account.findUnique({
        where: { email: toEmailOrAddress },
        select: { publicKey: true }
      });

      if (!recipientAccount) {
        // Create new account for recipient
        const wallet = ethers.Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const publicKey = wallet.address;
        const encryptedPrivateKey = encrypt(privateKey);

        recipientAccount = await prisma.account.create({
          data: {
            email: toEmailOrAddress,
            publicKey,
            encryptedPrivateKey
          },
          select: { publicKey: true }
        });

        recipientAccountCreated = true;
      }

      recipientAddress = recipientAccount.publicKey;
    }

    // Decrypt sender's private key
    const privateKey = decrypt(senderAccount.encryptedPrivateKey);
    const wallet = new ethers.Wallet(privateKey, provider);

    let txHash: string;

    if (tokenAddress.toLowerCase() === 'native' || tokenAddress === '') {
      // Send native ETH
      const tx = await wallet.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount.toString())
      });

      txHash = tx.hash;
    } else {
      // Send ERC-20 token
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
      const decimals = await contract.decimals();
      const tokenAmount = ethers.parseUnits(amount.toString(), decimals);

      const tx = await contract.transfer(recipientAddress, tokenAmount);
      txHash = tx.hash;
    }

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      from: senderAccount.publicKey,
      to: recipientAddress,
      amount,
      tokenAddress,
      senderAccountCreated,
      recipientAccountCreated,
      ...(senderAccountCreated && { message: 'Sender account was not registered and has been created' }),
      ...(recipientAccountCreated && { recipientMessage: 'Recipient account was not registered and has been created' })
    });

  } catch (error) {
    console.error('Send transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to send transaction' },
      { status: 500 }
    );
  }
}
