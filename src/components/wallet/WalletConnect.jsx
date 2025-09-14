import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WalletConnect = () => {
  const { 
    connectWallet, 
    account, 
    isConnected, 
    loading, 
    balance,
    chainId 
  } = useWeb3();
  
  const [networkName, setNetworkName] = useState('');

  // Map chain IDs to network names
  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      1337: 'Localhost',
      31337: 'Hardhat',
      80001: 'Mumbai Testnet',
      137: 'Polygon Mainnet',
      10: 'Optimism',
      42161: 'Arbitrum',
      56: 'Binance Smart Chain',
      43114: 'Avalanche'
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  useEffect(() => {
    if (chainId) {
      setNetworkName(getNetworkName(chainId));
    }
  }, [chainId]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const handleConnect = async () => {
    console.log('Connect button clicked');
    if (!window.ethereum) {
      console.error('No ethereum provider found');
      toast.error('Please install MetaMask!');
      return;
    }
    
    try {
      console.log('Calling connectWallet()');
      const success = await connectWallet();
      console.log('connectWallet result:', success);
      if (!success) {
        toast.error('Failed to connect wallet');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      toast.error(`Failed to connect: ${err.message || 'Unknown error'}`);
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {networkName || 'Unknown Network'}
            </span>
          </div>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="text-sm font-medium">
            {parseFloat(balance || '0').toFixed(4)} ETH
          </div>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            <span 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-help"
              title={account}
            >
              {formatAddress(account)}
            </span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(account);
                toast.success('Wallet address copied to clipboard!');
              }}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Copy to clipboard"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;