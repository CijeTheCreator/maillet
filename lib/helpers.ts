export function miniAddress(address: string): string {
  console.log("Address: ", address)
  if (!address.startsWith("0x") || address.length < 10) {
    console.log("Invalid Ethereum address")
    // throw new Error("Invalid Ethereum address");
  }

  return `${address.slice(0, 4)}...${address.slice(-5)}`;
}


export function formatEth(wei: string | number | bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toPrecision(3);
}
