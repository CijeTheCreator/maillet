// Updated useEffect hook for fetching real data
useEffect(() => {
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);

      const userEmail = user?.emailAddresses[0].emailAddress || ""

      const response = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          tokenAddress: 'native'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const balanceData = await response.json();

      // Transform the response to match your walletData interface
      const transformedWalletData = {
        accountName: balanceData.email, // or derive from email
        accountAddress: balanceData.publicKey,
        balance: balanceData.balance,
        tokens: [], // You might want to fetch token balances separately
        priceUsd: balanceData.priceUsd,
        balanceUsd: balanceData.balanceUsd,
        symbol: balanceData.symbol
      };

      setWalletData(transformedWalletData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setIsLoading(false);
      // Handle error state - you might want to set an error state
    }
  };

  const fetchActivityData = async () => {
    try {
      setIsActivityLoading(true);

      const userEmail = user?.emailAddresses[0].emailAddress || ""
      const response = await fetch('/api/wallet/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          limit: 20,
          offset: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const transactionData = await response.json();

      const transformedActivityData = transactionData.transactions.map((tx: any) => {
        const isReceived = tx.to?.toLowerCase() === transactionData.publicKey.toLowerCase();

        return {
          type: isReceived ? 'Received' : 'Sent',
          token: 'ETH', // or derive from transaction data
          amount: tx.value,
          value: (parseFloat(tx.value) * transactionData.currentEthPrice).toFixed(2),
          ...(isReceived ? { from: tx.from } : { to: tx.to }),
          date: new Date(tx.timestamp * 1000).toLocaleDateString(),
          time: new Date(tx.timestamp * 1000).toLocaleTimeString(),
          status: 'Completed',
          hash: tx.hash,
          blockNumber: tx.blockNumber
        };
      });

      setActivityData(transformedActivityData);
      setIsActivityLoading(false);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setIsActivityLoading(false);
      // Handle error state
    }
  };

  // Fetch both wallet and activity data
  fetchWalletData();

  // Add a slight delay for activity data to stagger the requests
  const activityTimer = setTimeout(() => {
    fetchActivityData();
  }, 500);

  return () => {
    clearTimeout(activityTimer);
  };
}, []);


