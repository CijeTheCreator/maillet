"use client"

import { useState, useEffect } from "react"
import {
  ArrowUpRight,
  QrCode,
  Copy,
  ChevronDown,
  MoreVertical,
  ArrowDown,
  X,
  ChevronLeft,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { activityDataM, allTokens, walletDataM } from "@/lib/mocks"
import { useUser } from "@clerk/nextjs"

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [isActivityLoading, setIsActivityLoading] = useState(true)
  const [activityData, setActivityData] = useState([])

  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)

  const { user, isLoaded } = useUser();


  const userEmail = user?.emailAddresses[0].emailAddress || ""
  console.log("User\n")
  console.log(userEmail)

  // Send modal states
  const [emailOrAddress, setEmailOrAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [isMining, setIsMining] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")

  // Receive modal states
  const [isReceiveLoading, setIsReceiveLoading] = useState(false)
  const [receiveAddress, setReceiveAddress] = useState("")

  // Export modal states
  const [isExportLoading, setIsExportLoading] = useState(false)
  const [privateKey, setPrivateKey] = useState("")

  // Wallet data that will be "loaded"
  const [walletData, setWalletData] = useState({
    accountName: "",
    accountAddress: "",
    balance: "",
    tokens: [],
  })

  const [tokenSelectModalOpen, setTokenSelectModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])


  const [selectedToken, setSelectedToken] = useState(allTokens[0])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const searchTimer = setTimeout(() => {
      const filtered = allTokens.filter(
        (token) =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 800)

    return () => clearTimeout(searchTimer)
  }, [searchQuery])

  useEffect(() => {

    //TODO: FETCH BALANCE
    // Simulate loading data
    const timer = setTimeout(() => {
      setWalletData(walletDataM)
      setIsLoading(false)
    }, 2000)

    // Simulate loading activity data with a slight delay
    const activityTimer = setTimeout(() => {
      setActivityData(activityDataM)
      setIsActivityLoading(false)
    }, 2500)

    return () => {
      clearTimeout(timer)
      clearTimeout(activityTimer)
    }
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToastMessage("Copied to clipboard")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      console.error("Failed to copy: ", err)
      setToastMessage("Failed to copy")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }


  //TODO: SEND TRANSACTION
  const handleSendConfirm = () => {
    setConfirmationModalOpen(false)
    setTransactionModalOpen(true)
    setIsMining(true)

    // Simulate transaction mining
    setTimeout(() => {
      setIsMining(false)
      setTransactionHash("0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b")
    }, 3000)
  }

  const handleReceiveModalOpen = () => {
    setReceiveModalOpen(true)
    setIsReceiveLoading(true)
    setReceiveAddress("")


    //TODO: FETCH PUBLIC KEY
    // Simulate loading address from server
    setTimeout(() => {
      setReceiveAddress("0xeb4e7a2ab9ee4d7003208a47c04aecd60f11073")
      setIsReceiveLoading(false)
    }, 1500)
  }

  const handleExportModalOpen = () => {
    setExportModalOpen(true)
    setIsExportLoading(true)
    setPrivateKey("")

    //TODO: FETCH PRIVATE KEY
    // Simulate loading private key from server
    setTimeout(() => {
      setPrivateKey("6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b")
      setIsExportLoading(false)
    }, 2000)
  }

  const resetSendModal = () => {
    setEmailOrAddress("")
    setAmount("")
    setSelectedToken(allTokens[0])
    setSendModalOpen(false)
  }


  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Header with logo */}
      <div className="w-full flex justify-center py-6">
        <div className="font-bold text-2xl">
          <span>Meta</span>
          <span>Mask</span>
        </div>
      </div>

      {/* Main wallet container */}
      <div className="w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden">
        {/* Network selector */}
        <div className="p-4 bg-white border-b">
          <div className="flex items-center">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                E
              </div>
              <span className="text-sm font-medium">Ethereum Mainnet</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="ml-auto">
              <MoreVertical className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="p-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-red-500"></div>
                  <span className="font-medium">{walletData.accountName}</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>{walletData.accountAddress}</span>
                <Copy className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="p-6 bg-white flex flex-col items-center">
          {isLoading ? (
            <Skeleton className="h-10 w-40 mb-6" />
          ) : (
            <div className="text-4xl font-bold mb-6 flex items-center gap-2">
              {walletData.balance}
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <Button
                onClick={() => setSendModalOpen(true)}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              >
                <ArrowUpRight className="w-5 h-5 text-white" />
              </Button>
              <span className="text-sm mt-1">Send</span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                onClick={handleReceiveModalOpen}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              >
                <QrCode className="w-5 h-5 text-white" />
              </Button>
              <span className="text-sm mt-1">Receive</span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                onClick={handleExportModalOpen}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              >
                <ArrowDown className="w-5 h-5 text-white" />
              </Button>
              <span className="text-sm mt-1">Export</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="tokens" className="p-0">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Popular networks</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Token list */}
            <div className="divide-y">
              {isLoading ? (
                <>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </>
              ) : (
                walletData.tokens.map((token, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-5 h-5 text-blue-600">Ξ</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{token.name}</span>
                          {token.type && <span className="text-blue-600 text-sm">• {token.type}</span>}
                        </div>
                        <div className="text-sm text-green-600">{token.percentage}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{token.value}</div>
                      <div className="text-sm text-gray-600">{token.amount}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Support link */}
            <div className="p-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                ?
              </div>
              <span className="text-blue-600">MetaMask support</span>
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <div className="divide-y">
              {isActivityLoading ? (
                <>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </>
              ) : activityData.length > 0 ? (
                activityData.map((activity, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === "Send" ? "bg-red-100" : "bg-green-100"
                          }`}
                      >
                        {activity.type === "Send" ? (
                          <ArrowUpRight className={`w-4 h-4 text-red-600`} />
                        ) : (
                          <ArrowDown className={`w-4 h-4 text-green-600`} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {activity.type} {activity.token}
                        </div>
                        <div className="text-sm text-gray-600">
                          {activity.type === "Send" ? `To ${activity.to}` : `From ${activity.from}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.date} • {activity.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${activity.type === "Send" ? "text-red-600" : "text-green-600"}`}>
                        {activity.type === "Send" ? "-" : "+"}
                        {activity.amount}
                      </div>
                      <div className="text-sm text-gray-600">{activity.value}</div>
                      <div className="text-xs text-green-600">{activity.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No recent activity</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-md p-0 gap-0">
          <DialogHeader className="p-4 border-b flex flex-row items-center">
            <Button variant="ghost" size="icon" className="absolute left-2" onClick={() => setSendModalOpen(false)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1 text-center">Send</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            {/* Email/Address Input */}
            <div className="space-y-2">
              <Label htmlFor="email-address">Email address or wallet address</Label>
              <Input
                id="email-address"
                placeholder="Enter email or wallet address"
                value={emailOrAddress}
                onChange={(e) => setEmailOrAddress(e.target.value)}
              />
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <Label>Token</Label>
              <div
                className="border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setTokenSelectModalOpen(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-5 h-5 text-blue-600">{selectedToken.icon}</div>
                  </div>
                  <div>
                    <div className="font-medium">{selectedToken.symbol}</div>
                    <div className="text-sm text-gray-600">{selectedToken.name}</div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                step="0.01"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => setSendModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => setConfirmationModalOpen(true)}
                disabled={!emailOrAddress || !amount}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmationModalOpen} onOpenChange={setConfirmationModalOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Confirm Transaction</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-mono text-sm">{emailOrAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {amount} {selectedToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token:</span>
                <span>{selectedToken.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gas Fee:</span>
                <span>~$2.50</span>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmationModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSendConfirm}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Transaction Status</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            {isMining ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
                <div>
                  <h3 className="font-medium">Mining Transaction</h3>
                  <p className="text-sm text-gray-600">Please wait while your transaction is being processed...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <h3 className="font-medium text-green-600">Transaction Successful!</h3>
                  <p className="text-sm text-gray-600 mt-2">Your transaction has been confirmed</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Transaction Hash:</div>
                  <div className="font-mono text-xs break-all">{transactionHash}</div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setTransactionModalOpen(false)
                    resetSendModal()
                  }}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Modal */}
      <Dialog open={receiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b flex justify-between items-center">
            <div className="w-4"></div>
            <DialogTitle>Receive</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setReceiveModalOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-6 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {isReceiveLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading your address...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-white p-4 border rounded-lg mb-4">
                    <div className="w-64 h-64 bg-black flex items-center justify-center">
                      <div className="w-12 h-12 bg-white flex items-center justify-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="font-medium text-lg mb-2">Account 1</div>
                  <div className="text-sm text-gray-600 text-center mb-4">
                    {receiveAddress.slice(0, 26)}
                    <br />
                    {receiveAddress.slice(26)}
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => copyToClipboard(receiveAddress)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy address
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b flex justify-between items-center">
            <div className="w-4"></div>
            <DialogTitle>Export Private Keys</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setExportModalOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="font-medium text-yellow-800 mb-2">Warning!</div>
              <p className="text-sm text-yellow-700">
                Never disclose your private keys. Anyone with your private keys can steal any assets held in your
                account.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {isExportLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-4 py-8"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Loading private key...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-500 mb-1">Account 1</div>
                    <div className="font-mono text-sm break-all bg-gray-50 p-3 rounded border">{privateKey}</div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => copyToClipboard(privateKey)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy to clipboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Token Selection Modal */}
      <Dialog open={tokenSelectModalOpen} onOpenChange={setTokenSelectModalOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b flex justify-between items-center">
            <DialogTitle>Select a token</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setTokenSelectModalOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="p-4">
            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search name or paste address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search results */}
            <div className="max-h-80 overflow-y-auto">
              {searchQuery.trim() === "" ? (
                // Show all tokens when no search
                <div className="divide-y">
                  {allTokens.map((token, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedToken(token)
                        setTokenSelectModalOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm">{token.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-600">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{token.balance}</div>
                        <div className="text-sm text-gray-600">{token.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isSearching ? (
                // Show skeleton loaders while searching
                <div className="divide-y">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                // Show search results
                <div className="divide-y">
                  {searchResults.map((token, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedToken(token)
                        setTokenSelectModalOpen(false)
                        setSearchQuery("")
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm">{token.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-600">{token.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{token.address.slice(0, 10)}...</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{token.balance}</div>
                        <div className="text-sm text-gray-600">{token.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // No results found
                <div className="p-8 text-center text-gray-500">
                  <div className="text-lg mb-2">No tokens found</div>
                  <div className="text-sm">Try searching with a different term</div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
