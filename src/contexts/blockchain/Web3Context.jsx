import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import EventTicketABI from '../../../artifacts/contracts/EventTicket.sol/EventTicket.json';
import { toast } from 'react-toastify';

const Web3Context = createContext();

// Contract address from deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');

  // Initialize contract with provider
  const initContract = useCallback(async (web3Provider) => {
    try {
      const signer = await web3Provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, EventTicketABI.abi, signer);
      
      // Get network chain ID
      const network = await web3Provider.getNetwork();
      setChainId(Number(network.chainId));
      
      // Get account balance
      if (signer.provider) {
        const address = await signer.getAddress();
        const balance = await signer.provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      }
      
      setSigner(signer);
      setContract(contract);
      return { signer, contract };
    } catch (err) {
      console.error("Error initializing contract:", err);
      throw new Error("Failed to initialize contract");
    }
  }, []);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    console.log('[Web3Context] Disconnecting wallet');
    
    // Clear state
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setChainId(null);
    setBalance('0');
    setError('');
    
    // Clear any stored wallet connection state
    localStorage.removeItem('walletConnected');
    
    // If MetaMask is available, remove any listeners
    if (window.ethereum?.removeListener) {
      try {
        window.ethereum.removeAllListeners();
        
        // Reset MetaMask state if possible
        if (window.ethereum._state) {
          window.ethereum._state.accounts = [];
        }
        if (window.ethereum.selectedAddress) {
          window.ethereum.selectedAddress = null;
        }
      } catch (error) {
        console.warn('Error cleaning up wallet connection:', error);
      }
    }
    
    console.log('[Web3Context] Wallet disconnected');
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 provider');
      return false;
    }

    try {
      setLoading(true);
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Initialize contract
      await initContract(web3Provider);
      
      setAccount(account);
      setProvider(web3Provider);
      setIsConnected(true);
      
      // Get balance
      const balance = await web3Provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
      
      // Get network chain ID
      const network = await web3Provider.getNetwork();
      setChainId(Number(network.chainId));
      
      // Set up event listeners for account/chain changes
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const balance = await web3Provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));
        } else {
          // Disconnected
          setAccount('');
          setIsConnected(false);
          setSigner(null);
          setContract(null);
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
      toast.success(`Connected to ${account.substring(0, 6)}...${account.substring(38)}`);
      return true;
    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast.error("Failed to connect wallet. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [initContract]);

  // This was a duplicate disconnect function - removed

  // Get all events
  const getAllEvents = useCallback(async () => {
    if (!isConnected) {
      throw new Error("Wallet not connected");
    }
    
    if (!contract) {
      throw new Error("Contract not initialized");
    }
    
    try {
      setLoading(true);
      const eventCount = await contract.eventCount();
      
      if (!eventCount || eventCount === 0) {
        return [];
      }
      
      // Fetch all events
      const events = [];
      for (let i = 1; i <= eventCount; i++) {
        const event = await contract.events(i);
        if (event && event.exists) {
          events.push({
            id: i.toString(),
            name: event.name || 'Unnamed Event',
            description: event.description || 'No description available',
            date: event.date ? Number(event.date) : 0,
            location: event.location || 'Location not specified',
            price: event.price ? ethers.formatEther(event.price) : '0',
            ticketsAvailable: event.ticketsAvailable ? Number(event.ticketsAvailable) : 0,
            ticketsSold: event.ticketsSold ? Number(event.ticketsSold) : 0,
            organizer: event.organizer || '0x0000000000000000000000000000000000000000',
            exists: true
          });
        }
      }
      
      return events;
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      throw new Error(error.reason || error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [contract, isConnected]);

  // Get event by ID
  const getEventById = useCallback(async (eventId) => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      const event = await contract.events(eventId);
      if (!event.exists) {
        return { exists: false };
      }
      
      return {
        id: eventId,
        name: event.name,
        location: event.location,
        date: event.date.toString(),
        price: event.price.toString(),
        ticketsAvailable: event.ticketsAvailable.toString(),
        ticketsSold: event.ticketsSold.toString(),
        organizer: event.organizer,
        description: event.description || '',
        exists: event.exists
      };
    } catch (err) {
      console.error("Error fetching event:", err);
      throw new Error("Failed to fetch event");
    }
  }, [contract, isConnected]);
  
  // Buy tickets for an event
  const buyTicket = useCallback(async (eventId, quantity) => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      // Get event to calculate total price
      const event = await getEventById(eventId);
      if (!event.exists) {
        throw new Error("Event not found");
      }
      
      const pricePerTicket = ethers.BigNumber.from(event.price);
      const totalPrice = pricePerTicket.mul(quantity);
      
      // Call the smart contract
      const tx = await contract.buyTicket(eventId, quantity, {
        value: totalPrice,
        gasLimit: 500000
      });
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      // Get the ticket IDs from the event logs
      const ticketIds = [];
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TicketPurchased') {
            ticketIds.push(parsedLog.args.ticketId.toString());
          }
        } catch (e) {
          // Ignore logs that can't be parsed
          continue;
        }
      }
      
      return {
        txHash: receipt.transactionHash,
        ticketIds,
        quantity: quantity,
        totalPrice: totalPrice.toString()
      };
    } catch (error) {
      console.error("Error buying ticket:", error);
      throw new Error(error.reason || error.message || 'Failed to buy ticket');
    }
  }, [contract, isConnected, getEventById]);

  // Get tickets for the current user
  const getTicketsForUser = useCallback(async () => {
    if (!isConnected || !contract || !account) {
      return [];
    }
    
    try {
      const ticketCount = await contract.getUserTicketCount(account);
      const tickets = [];
      
      for (let i = 0; i < ticketCount; i++) {
        try {
          const ticketId = await contract.userTickets(account, i);
          const ticket = await contract.tickets(ticketId);
          
          if (ticket.exists) {
            tickets.push({
              id: ticketId.toString(),
              eventId: ticket.eventId.toString(),
              owner: ticket.owner,
              used: ticket.used,
              purchaseDate: ticket.purchaseDate.toString(),
              price: ticket.price.toString()
            });
          }
        } catch (err) {
          console.error(`Error fetching ticket ${i}:`, err);
          continue;
        }
      }
      
      return tickets;
    } catch (err) {
      console.error("Error fetching user tickets:", err);
      return [];
    }
  }, [contract, isConnected, account]);

  // Get tickets for a specific event
  const getTicketsForEvent = useCallback(async (eventId) => {
    if (!isConnected || !contract) {
      return [];
    }
    
    try {
      const ticketCount = await contract.getEventTicketCount(eventId);
      const tickets = [];
      
      for (let i = 0; i < ticketCount; i++) {
        try {
          const ticketId = await contract.eventTickets(eventId, i);
          const ticket = await contract.tickets(ticketId);
          
          if (ticket.exists) {
            tickets.push({
              id: ticketId.toString(),
              eventId: ticket.eventId.toString(),
              owner: ticket.owner,
              used: ticket.used,
              purchaseDate: ticket.purchaseDate.toString(),
              price: ticket.price.toString()
            });
          }
        } catch (err) {
          console.error(`Error fetching event ticket ${i}:`, err);
          continue;
        }
      }
      
      return tickets;
    } catch (err) {
      console.error("Error fetching event tickets:", err);
      return [];
    }
  }, [contract, isConnected]);

  // Check if a ticket is valid
  const checkTicketValidity = useCallback(async (ticketId) => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      return await contract.isTicketValid(ticketId);
    } catch (err) {
      console.error("Error checking ticket validity:", err);
      throw new Error("Failed to check ticket validity");
    }
  }, [contract, isConnected]);

  // Mark a ticket as used
  const useTicket = useCallback(async (ticketId) => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      const tx = await contract.useTicket(ticketId, { gasLimit: 200000 });
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error using ticket:", err);
      throw new Error(err.reason || err.message || 'Failed to use ticket');
    }
  }, [contract, isConnected]);

  // Initialize provider and check if wallet is connected
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          // Check if already connected
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {
          console.error("Error initializing Web3:", err);
          setError("Failed to initialize Web3 provider");
        }
      } else {
        setError("Please install MetaMask or another Web3 provider");
      }
      setLoading(false);
    };

    init();

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [connectWallet]);

  return (
    <Web3Context.Provider
      value={{
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
        getAllEvents,
        getEventById,
        buyTicket,
        getTicketsForUser,
        getTicketsForEvent,
        checkTicketValidity,
        useTicket,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export { Web3Provider, useWeb3 };
export default Web3Context;
