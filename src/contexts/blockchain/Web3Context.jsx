import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import EventTicketABI from '../../../artifacts/contracts/EventTicket.sol/EventTicket.json';
import { toast } from 'react-toastify';

export const Web3Context = createContext();
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  /** Initialize contract & signer once we have a provider */
  const initContract = useCallback(async (web3Provider) => {
    const signer = await web3Provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, EventTicketABI.abi, signer);
    setSigner(signer);
    setContract(contract);
    return { signer, contract };
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setChainId(null);
    setBalance('0');
    setIsConnected(false);
    setError('');
    if (window.ethereum?.removeListener) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  }, []);

  /** Handlers declared outside to allow cleanup */
  const handleAccountsChanged = async (accounts) => {
    if (!accounts.length) return disconnectWallet();
    setAccount(accounts[0]);
    const bal = await provider.getBalance(accounts[0]);
    setBalance(ethers.formatEther(bal));
    toast.info(`Switched to ${formatAddress(accounts[0])}`);
  };

  const handleChainChanged = () => {
    toast.info('Network changed, reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };

  const connectWallet = useCallback(async () => {
    console.log('connectWallet called');
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      const errorMsg = 'MetaMask not detected. Please install MetaMask to continue.';
      console.error(errorMsg);
      toast.error(errorMsg);
      window.open('https://metamask.io/download.html', '_blank');
      return false;
    }
    
    // Check if already connected
    if (isConnected && account) {
      console.log('Wallet already connected:', account);
      return true;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('1. Requesting account access...');
      // Request account access - this will trigger the MetaMask popup
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      console.log('2. Received accounts:', accounts);
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet.');
      }
      
      const currentAccount = accounts[0];
      console.log('3. Connecting with account:', currentAccount);
      
      // Create provider after account access is granted
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get network info
      const network = await web3Provider.getNetwork();
      console.log('4. Connected to network:', network.name, 'Chain ID:', network.chainId);
      
      // Get account balance
      const balance = await web3Provider.getBalance(currentAccount);
      console.log('5. Account balance:', ethers.formatEther(balance), 'ETH');
      
      // Initialize contract
      const { signer, contract } = await initContract(web3Provider);
      
      // Update state in a single batch to prevent multiple re-renders
      setProvider(web3Provider);
      setAccount(currentAccount);
      setSigner(signer);
      setContract(contract);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(balance));
      setIsConnected(true);

      // Set up event listeners
      const handleEvents = () => {
        if (window.ethereum.removeListener) {
          // Remove any existing listeners to prevent duplicates
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
        
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      };
      
      handleEvents();

      console.log('6. Wallet connected successfully');
      toast.success(`Connected: ${formatAddress(currentAccount)}`);
      return true;
      
    } catch (err) {
      console.error('Wallet connection error:', err);
      
      let errorMessage = 'Failed to connect wallet';
      if (err.code === 4001) {
        errorMessage = 'Please connect to MetaMask to continue.';
      } else if (err.code === -32002) {
        errorMessage = 'A connection request is already pending. Please check your MetaMask extension.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initContract, isConnected, account]);

  return (
    <Web3Context.Provider value={{
      provider, signer, contract, account, chainId, balance,
      isConnected, loading, error, connectWallet, disconnectWallet
    }}>
      {children}
    </Web3Context.Provider>
  );
};

// Export a more resilient version of useWeb3 that won't throw if context is not available
export const useWeb3 = () => {
  try {
    const context = useContext(Web3Context);
    if (context === undefined) {
      console.warn('useWeb3 must be used within a Web3Provider');
      return {
        isConnected: false,
        connectWallet: () => console.warn('Web3 not initialized'),
        disconnectWallet: () => {},
        // Add other default values as needed
      };
    }
    return context;
  } catch (error) {
    console.warn('Error accessing Web3 context:', error);
    return {
      isConnected: false,
      connectWallet: () => console.warn('Web3 not available'),
      disconnectWallet: () => {},
      // Add other default values as needed
    };
  }
};
