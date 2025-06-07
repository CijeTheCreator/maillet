export function miniAddress(address: string): string {
  if (!address.startsWith("0x") || address.length < 10) {
    throw new Error("Invalid Ethereum address");
  }

  return `${address.slice(0, 4)}...${address.slice(-5)}`;
}
