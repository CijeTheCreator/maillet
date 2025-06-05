export const allTokens = [
  {
    name: "Ethereum",
    symbol: "ETH",
    address: "0x0000000000000000000000000000000000000000",
    balance: "0 ETH",
    value: "$0.00",
    icon: "Ξ",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xA0b86a33E6441E6C7D3E4C5B4B6B8B8B8B8B8B8B",
    balance: "0 USDC",
    value: "$0.00",
    icon: "💲",
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    balance: "0 USDT",
    value: "$0.00",
    icon: "₮",
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    balance: "0 WBTC",
    value: "$0.00",
    icon: "₿",
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    balance: "0 LINK",
    value: "$0.00",
    icon: "🔗",
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    balance: "0 UNI",
    value: "$0.00",
    icon: "🦄",
  },
]

export const activityDataM = [
  {
    type: "Send",
    token: "ETH",
    amount: "0.05 ETH",
    value: "$120.50",
    to: "0x742d...4e8a",
    date: "Dec 15, 2024",
    time: "2:30 PM",
    status: "Confirmed",
  },
  {
    type: "Receive",
    token: "ETH",
    amount: "0.1 ETH",
    value: "$241.00",
    from: "0x8f3a...9b2c",
    date: "Dec 14, 2024",
    time: "10:15 AM",
    status: "Confirmed",
  },
  {
    type: "Send",
    token: "ETH",
    amount: "0.02 ETH",
    value: "$48.20",
    to: "0x1a2b...7c8d",
    date: "Dec 13, 2024",
    time: "4:45 PM",
    status: "Confirmed",
  },
]

export const walletDataM = {
  accountName: "Account 1",
  accountAddress: "0xEB4e7...11073",
  balance: "$0.00 USD",
  tokens: [
    { name: "Ethereum", type: "Stake", percentage: "+4.70%", value: "$0.00", amount: "0 ETH", icon: "ethereum" },
    { name: "Ethereum", percentage: "+4.65%", value: "$0.00", amount: "0 ETH", icon: "ethereum" },
  ],
}
