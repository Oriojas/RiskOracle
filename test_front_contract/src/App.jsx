
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useDisconnect, useBalance } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { formatEther } from 'viem';

const MaliciousApp = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [isEligible, setIsEligible] = useState(false);
  const { disconnect } = useDisconnect();
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const { data: balanceData } = useBalance({ address: address });

  /* 
   * NEW: MANUAL DATA FOR RISK ORACLE DEMO
   * We calculate this manually since we can't easily extract it *before* writeContract 
   * unless we use prepareTransaction, but for the demo we want simply to show it.
   */
  const DEMO_CONTRACT_ADDRESS = "0x4aB3f90B12b1Bd7653EBC4bC5702078F0Bf67fBd";
  // The function signature for secureVaultDeposit() is `d0e30db0`
  const DEMO_CALLDATA = "0xd0e30db0";

  const ABI = [
    {
      "inputs": [],
      "name": "secureVaultDeposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "checkEligibility",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  /* ----------------------------------------------------
     1. READ CONTRACT: Check Eligibility
     ---------------------------------------------------- */
  const { data: eligibilityData, refetch: refetchEligibility, isError: isReadError } = useReadContract({
    address: DEMO_CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'checkEligibility',
    query: {
      enabled: false,
    }
  });

  /* ----------------------------------------------------
     2. WRITE CONTRACT: Claim (Deposit)
     ---------------------------------------------------- */
  const { data: hash, isPending: isWritePending, writeContract, error: writeError } = useWriteContract();

  const handleConnect = () => {
    open();
  };

  const handleCheckEligibility = async () => {
    if (!isConnected) return;
    setCheckingEligibility(true);
    try {
      const result = await refetchEligibility();

      setTimeout(() => {
        // Mock success for demo if read fails or returns false
        setIsEligible(true);
        setCheckingEligibility(false);
      }, 1500);

    } catch (e) {
      console.error(e);
      setCheckingEligibility(false);
      setIsEligible(true); // Fallback for demo
    }
  };

  /* 
   * DIRECT SCAM TRIGGER
   * No interception here. The app behaves "normally" (maliciously).
   * Users must rely on their own tools (like RiskOracle) to check BEFORE clicking or 
   * by checking the transaction data in their wallet.
   */
  const handleClaim = () => {
    if (!isConnected) return;

    // Trigger real wallet signature request immediately
    writeContract({
      address: DEMO_CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'secureVaultDeposit',
      // SAFELY DRAIN ~90% (Leaving space for gas to avoid 'Insufficient funds for gas' error)
      // This will trigger the "High Value" alert in wallets without causing an error.
      // Use a fixed small amount to ensure the wallet simulation works perfectly 
      // without "Insufficient Funds" or gas estimation errors on L2.
      value: BigInt(100000), // 100,000 Wei (Small amount)
      gas: BigInt(300000),
    });
  };

  const handleReset = () => {
    disconnect();
    setIsEligible(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] bg-cover"></div>

      {/* Disclaimer Banner */}
      <div className="absolute top-0 w-full bg-red-600 text-white text-center py-2 font-bold z-50 uppercase tracking-widest text-xs md:text-sm animate-pulse">
        ⚠️ DEMO ONLY - DO NOT USE REAL FUNDS - TESTNET SIMULATION ⚠️
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 bg-gray-900/80 backdrop-blur-md border-2 border-green-500 p-8 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.3)] max-w-md w-full text-center"
      >
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2 drop-shadow-lg">
          WIN 1000 ETH!
        </h1>
        <p className="text-gray-300 mb-8 italic">
          "Exclusive giveaway for Arbitrum users! Deposit to verify and claim instantly!"
        </p>

        {isConnected && balanceData && (
          <div className="text-sm font-mono text-yellow-400 mb-6 bg-yellow-900/20 p-2 rounded border border-yellow-600/30">
            Your Balance: {balanceData.value ? formatEther(balanceData.value).slice(0, 8) : '0'} {balanceData.symbol}
          </div>
        )}

        {!isConnected ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnect}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-xl shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Connect Wallet
          </motion.button>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs text-gray-400">
              <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
              <button onClick={handleReset} className="text-red-400 hover:text-red-300 underline">Disconnect</button>
            </div>

            {!isEligible ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckEligibility}
                disabled={checkingEligibility}
                className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${checkingEligibility
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-yellow-500/50 text-black"
                  }`}
              >
                {checkingEligibility ? "CHECKING..." : "1. CHECK ELIGIBILITY 🧐"}
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="text-green-400 font-bold text-lg animate-bounce">
                  🎉 YOU ARE ELIGIBLE! 🎉
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px #ef4444" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  disabled={isWritePending}
                  className="w-full py-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl font-black text-2xl shadow-xl border border-red-400 animate-pulse"
                >
                  {isWritePending ? "OPENING WALLET..." : "2. CLAIM PRIZE NOW 🎁"}
                </motion.button>



              </motion.div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              *Terms and conditions apply. Not financial advice.
            </p>

            {writeError && (
              <div className="text-xs text-red-500 bg-red-900/20 p-2 rounded">
                Transaction failed: {writeError.shortMessage || writeError.message}
              </div>
            )}
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default MaliciousApp;
