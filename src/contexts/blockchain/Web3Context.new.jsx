import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import EventTicketABI from '../../../artifacts/contracts/EventTicket.sol/EventTicket.json';
import { toast } from 'react-toastify';

// Format Ethereum address for display
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(38)}`;
};

const Web3Context = createContext();

// Contract address from deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Web3Provider = ({ children }) => {
  // State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  
  // Refs for connection state and cleanup
  const connectionInProgressRef = useRef(false);
  const initCompleteRef = useRef(false);
  const cleanupRef = useRef(null);
  const isMountedRef = useRef(true);
  const eventListenersAdded = useRef(false);

  // Initialize contract with provider
  const initContract = useCallback(async (web3Provider) => {
    try {
      const signer = await web3Provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, EventTicketABI.abi, signer);
      
      // Get network info
      const network = await web3Provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Get account balance if connected
      let balance = '0';
      try {
        const address = await signer.getAddress();
        balance = await web3Provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (e) {
        console.warn('Could not get account balance:', e);
      }
      
      return { signer, contract, chainId, balance };
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  }, []);

  // Disconnect wallet and clean up
  const disconnectWallet = useCallback(() => {
    console.log('[Web3Context] Disconnecting wallet');
    
    // Reset all state
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setChainId(null);
    setBalance('0');
    setError('');
    setLoading(false);
    
    // Reset connection state
    connectionInProgressRef.current = false;
    
    // Clear any stored wallet connection state
    localStorage.removeItem('walletConnected');
    
    // Clean up event listeners
    if (window.ethereum?.removeListener) {
      try {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      } catch (e) {
        console.warn('Error cleaning up event listeners:', e);
      }
    }
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    const connectionId = Math.random().toString(36).substring(2, 8);
    console.log(`[Web3Context][${connectionId}] connectWallet called`);
    
    // If already connected, return early
    if (isConnected && account) {
      console.log(`[Web3Context][${connectionId}] Already connected to:`, account);
      return true;
    }
    
    // Check for existing connection attempts
    if (connectionInProgressRef.current) {
      console.log(`[Web3Context][${connectionId}] Connection already in progress`);
      return false;
    }
    
    let connectionSuccessful = false;
    
    try {
      console.log(`[Web3Context][${connectionId}] Starting connection process`);
      setLoading(true);
      setError('');
      
      // Set connection lock
      connectionInProgressRef.current = true;
      console.log(`[Web3Context][${connectionId}] Connection lock acquired`);
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        const errorMsg = 'No Ethereum provider found. Please install MetaMask!';
        console.error(`[Web3Context][${connectionId}] ${errorMsg}`);
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }
      
      // Create a new provider instance
      console.log(`[Web3Context][${connectionId}] Creating new BrowserProvider`);
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access with timeout
      console.log(`[Web3Context][${connectionId}] Requesting accounts`);
      const connectionTimeout = 30000; // 30 seconds timeout
      
      try {
        const accountsPromise = window.ethereum.request({ method: 'eth_requestAccounts' });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`[${connectionId}] Connection timeout. Please try again.`)), connectionTimeout)
        );
        
        const accounts = await Promise.race([accountsPromise, timeoutPromise]);
        console.log(`[Web3Context][${connectionId}] Accounts received:`, accounts);
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Please check your wallet.');
        }
        
        const account = accounts[0];
        console.log(`[Web3Context][${connectionId}] Selected account:`, account);
        
        // Initialize contract and get account info
        console.log(`[Web3Context][${connectionId}] Initializing contract`);
        const { signer, contract, chainId, balance } = await initContract(web3Provider);
        
        // Update state
        setProvider(web3Provider);
        setAccount(account);
        setSigner(signer);
        setContract(contract);
        setChainId(chainId);
        setIsConnected(true);
        
        console.log(`[Web3Context][${connectionId}] Wallet connected successfully`);
        toast.success(`Connected to ${formatAddress(account)}`);
        
        // Set up event listeners if not already done
        if (!eventListenersAdded.current) {
          console.log(`[Web3Context][${connectionId}] Setting up event listeners`);
          
          // Clean up any existing listeners first
          if (window.ethereum.removeListener) {
            try {
              window.ethereum.removeAllListeners('accountsChanged');
              window.ethereum.removeAllListeners('chainChanged');
            } catch (e) {
              console.warn(`[Web3Context][${connectionId}] Error cleaning up event listeners:`, e);
            }
          }
          
          // Set up new listeners
          const handleAccountsChanged = async (newAccounts) => {
            const changeId = Math.random().toString(36).substring(2, 6);
            console.log(`[Web3Context][${connectionId}][${changeId}] accountsChanged:`, newAccounts);
            if (newAccounts && newAccounts.length > 0) {
              const newAccount = newAccounts[0];
              const newBalance = await web3Provider.getBalance(newAccount);
              setAccount(newAccount);
              setBalance(ethers.formatEther(newBalance));
              toast.info(`Switched to account: ${formatAddress(newAccount)}`);
            } else {
              // Disconnected
              console.log(`[Web3Context][${connectionId}][${changeId}] Wallet disconnected`);
              disconnectWallet();
            }
          };
          
          const handleChainChanged = (newChainId) => {
            const changeId = Math.random().toString(36).substring(2, 6);
            console.log(`[Web3Context][${connectionId}][${changeId}] Chain changed to:`, newChainId);
            toast.info('Network changed. Page will reload...');
            setTimeout(() => window.location.reload(), 1000);
          };
          
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          
          // Store cleanup function
          cleanupRef.current = () => {
            if (window.ethereum) {
              try {
                window.ethereum.off('accountsChanged', handleAccountsChanged);
                window.ethereum.off('chainChanged', handleChainChanged);
              } catch (e) {
                console.warn(`[Web3Context] Error removing event listeners:`, e);
              }
            }
          };
          
          eventListenersAdded.current = true;
        }
        
        connectionSuccessful = true;
        return true;
        
      } catch (error) {
        console.error(`[Web3Context][${connectionId}] Error requesting accounts:`, error);
        if (error.code === 4001) {
          throw new Error('Please connect your wallet to continue.');
        } else if (error.code === -32002) {
          throw new Error('A connection request is already pending. Please check your MetaMask extension.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Connection timed out. Please try again.');
        }
        throw new Error(`Connection failed: ${error.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error(`[Web3Context][${connectionId}] Error in connectWallet:`, error);
      const errorMessage = error.message || 'Failed to connect wallet';
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
      return false;
    } finally {
      connectionInProgressRef.current = false;
      if (!connectionSuccessful) {
        setLoading(false);
      }
    }
  }, [isConnected, account, disconnectWallet, initContract]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connectionId = `init-${Math.random().toString(36).substring(2, 6)}`;
      console.log(`[Web3Context][${connectionId}] Checking for existing connection`);
      
      if (connectionInProgressRef.current || initCompleteRef.current || !window.ethereum) {
        console.log(`[Web3Context][${connectionId}] Skipping connection check`);
        return;
      }
      
      connectionInProgressRef.current = true;
      
      try {
        // Check if we're authorized to access the user's wallet
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          console.log(`[Web3Context][${connectionId}] Found connected account:`, accounts[0]);
          await connectWallet();
        } else {
          console.log(`[Web3Context][${connectionId}] No connected accounts found`);
          setLoading(false);
        }
      } catch (error) {
        console.error(`[Web3Context][${connectionId}] Error checking connection:`, error);
        setLoading(false);
      } finally {
        connectionInProgressRef.current = false;
        initCompleteRef.current = true;
      }
    };
    
    checkConnection();
    
    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [connectWallet]);

  // Context value
  const value = {
    provider,
    signer,
    contract,
    account,
    isConnected,
    loading,
    error,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    formatAddress
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use Web3 context
const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export { Web3Provider, useWeb3 };
