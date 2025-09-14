import React from 'react';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';

const WalletTest = () => {
  const {
    account,
    isConnected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    balance
  } = useWeb3();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Wallet Connection Test</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Connection Status</h3>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {isConnected && (
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-medium">Address:</span> {account}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Balance:</span> {balance} ETH
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleConnect}
            disabled={loading || isConnected}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading || isConnected
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Wallet'}
          </button>

          <button
            onClick={handleDisconnect}
            disabled={!isConnected || loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !isConnected || loading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Disconnect
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click "Connect Wallet" to connect your MetaMask wallet</li>
            <li>Approve the connection in the MetaMask popup</li>
            <li>Verify your wallet address and balance are displayed</li>
            <li>Click "Disconnect" to disconnect your wallet</li>
            <li>Verify the connection status changes to "Disconnected"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WalletTest;
