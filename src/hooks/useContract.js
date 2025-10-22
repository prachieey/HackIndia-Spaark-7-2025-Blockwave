import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import EventTicketABI from '../contracts/EventTicket.json';

export const useContract = () => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add network to MetaMask
  const addNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x59c03e5', // 94204209 in hex
          chainName: 'Custom Network',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['http://localhost:8545'], // Update this with your RPC URL
          blockExplorerUrls: null // Add your block explorer URL if available
        }]
      });
      return true;
    } catch (error) {
      console.error('Error adding network:', error);
      return false;
    }
  };

  // Initialize provider and signer
  const init = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access if needed
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create a custom provider that disables ENS for custom networks
      const provider = new ethers.BrowserProvider(window.ethereum, {
        // Disable ENS resolution for all networks except mainnet
        ensAddress: async (name) => {
          const network = await new ethers.BrowserProvider(window.ethereum).getNetwork();
          if (network.chainId !== 1n) { // 1 is mainnet
            return null; // Return null to indicate no ENS support
          }
          // For mainnet, use default resolver
          return ethers.getDefaultProvider().resolveName(name);
        }
      });
      
      const network = await provider.getNetwork();
      
      // Log network info
      console.log('Current network chain ID:', network.chainId.toString());
      
      // Handle custom networks
      if (network.chainId === 94204209n) {
        console.log('Connected to custom network (94204209)');
        // No need to add network here as it's already added
      }
      
      const signer = await provider.getSigner();
      
      // Get the contract address based on the network
      const contractAddress = getContractAddress(network.chainId);
      
      if (!contractAddress) {
        throw new Error(`Contract not deployed on network ${network.name} (${network.chainId})`);
      }

      const contract = new ethers.Contract(contractAddress, EventTicketABI.abi, signer);
      
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Error initializing contract:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setAccount('');
      setIsConnected(false);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      // Re-initialize with the new account
      init();
    }
  }, [account, init]);

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    // Recommended to reload the page on chain change
    window.location.reload();
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Initialize on mount
      init();

      // Cleanup function to remove event listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged, init]);

  // Get contract address based on chain ID
  const getContractAddress = (chainId) => {
    // Convert chainId to string for consistent comparison
    const chainIdStr = typeof chainId === 'bigint' ? chainId.toString() : String(chainId);
    
    console.log('Current network chain ID:', chainIdStr);
    
    // First check for an environment variable override
    const envContractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (envContractAddress) {
      console.log('Using contract address from environment variable:', envContractAddress);
      return envContractAddress;
    }

    // Network configurations
    const networkConfigs = {
      // Mainnet
      '1': { 
        address: '0x0000000000000000000000000000000000000000', // Replace with actual mainnet address
        name: 'Ethereum Mainnet',
        ensSupported: true
      },
      
      // Testnets
      '5': { 
        address: '0x0000000000000000000000000000000000000000', // Replace with actual Goerli address
        name: 'Goerli Testnet',
        ensSupported: true
      },
      
      // Custom Network (94204209)
      '94204209': { 
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Your deployed contract address
        name: 'Custom Network',
        ensSupported: false // Disable ENS for custom network
      },
      
      // Local Development
      '1337': { 
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat localhost address
        name: 'Localhost (Hardhat)',
        ensSupported: false
      },
      '31337': { 
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat network address
        name: 'Hardhat Network',
        ensSupported: false
      }
    };
    
    const network = networkConfigs[chainIdStr];
    
    if (!network) {
      console.warn(`Unknown network with chain ID: ${chainIdStr}`);
      
      // For development, try to use a default address if available
      const defaultNetwork = networkConfigs['1337'] || networkConfigs['31337'];
      if (defaultNetwork) {
        console.warn(`Falling back to ${defaultNetwork.name} address for development`);
        return defaultNetwork.address;
      }
      
      return null;
    }
    
    console.log(`Connected to ${network.name} (${chainIdStr})`);
    return network.address;
  };

  // Function to buy a ticket
  const buyTicket = async (eventId, price) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.buyTicket(eventId, {
        value: ethers.parseEther(price.toString())
      });
      
      await tx.wait();
      return { success: true, transactionHash: tx.hash };
    } catch (err) {
      console.error('Error buying ticket:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to list a ticket for resale
  const listTicketForResale = async (ticketId, price) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.listForResale(ticketId, ethers.parseEther(price.toString()));
      await tx.wait();
      return { success: true, transactionHash: tx.hash };
    } catch (err) {
      console.error('Error listing ticket for resale:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to buy a resale ticket
  const buyResaleTicket = async (ticketId, price) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const tx = await contract.buyResaleTicket(ticketId, {
        value: ethers.parseEther(price.toString())
      });
      
      await tx.wait();
      return { success: true, transactionHash: tx.hash };
    } catch (err) {
      console.error('Error buying resale ticket:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to check if a ticket is valid
  const checkTicketValidity = async (ticketId) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const isValid = await contract.isTicketValid(ticketId);
      return { success: true, isValid };
    } catch (err) {
      console.error('Error checking ticket validity:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    contract,
    provider,
    signer,
    account,
    isConnected,
    loading,
    error,
    buyTicket,
    listTicketForResale,
    buyResaleTicket,
    checkTicketValidity,
    connect: init
  };
};

export default useContract;
