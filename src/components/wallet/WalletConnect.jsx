import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WalletConnect = () => {
  const { 
    connectWallet, 
    account, 
    isConnected, 
    loading: contextLoading, 
    balance,
    chainId 
  } = useWeb3();
  
  const [networkName, setNetworkName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');

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
    
    // Prevent multiple connection attempts
    if (isConnecting || contextLoading) {
      console.log('Connection already in progress');
      return;
    }
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      const errorMsg = 'MetaMask not detected. Please install MetaMask to continue.';
      console.error(errorMsg);
      toast.error(errorMsg);
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }
    
    try {
      setIsConnecting(true);
      setConnectionError('');
      
      console.log('1. Checking if already connected...');
      if (isConnected && account) {
        console.log('Already connected with account:', account);
        return;
      }
      
      console.log('2. Requesting accounts...');
      // Request account access - this should trigger the MetaMask popup
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log('3. Received accounts:', accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet.');
      }
      
      console.log('4. Connecting wallet...');
      const success = await connectWallet();
      console.log('5. Wallet connection result:', success);
      
      if (!success) {
        throw new Error('Failed to connect wallet. Please try again.');
      }
      
      console.log('6. Wallet connected successfully');
      toast.success('Wallet connected successfully!');
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      
      let errorMsg = 'Failed to connect wallet';
      if (err.code === 4001) {
        errorMsg = 'Please connect to MetaMask to continue.';
      } else if (err.code === -32002) {
        errorMsg = 'A connection request is already pending. Please check your MetaMask extension.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      toast.error(errorMsg);
      setConnectionError(errorMsg);
    } finally {
      setIsConnecting(false);
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
              className="text-sm font-mono text-gray-800 dark:text-gray-200 cursor-help tracking-tight"
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

  if (!isConnected) {
    const isLoading = isConnecting || contextLoading;
    return (
      <div className="flex flex-col">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : 'Connect Wallet'}
        </button>
        {connectionError && (
          <p className="mt-2 text-sm text-red-500">{connectionError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleConnect}
        disabled={isConnecting || contextLoading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isConnecting || contextLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isConnecting || contextLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default WalletConnect;