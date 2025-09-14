import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import EventTicketABI from '../../../artifacts/contracts/EventTicket.sol/EventTicket.json';
import { toast } from 'react-toastify';

const Web3Context = createContext();

// Contract address from deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');

  // Create a new event
  const createEvent = useCallback(async (name, location, date, price, ticketsAvailable, description = '') => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    
    try {
      setLoading(true);
      const tx = await contract.createEvent(
        name,
        location,
        date,
        price,
        ticketsAvailable,
        description
      );
      
      const receipt = await tx.wait();
      
      // Get the event ID from the transaction receipt
      const eventId = receipt.events?.find(e => e.event === 'EventCreated')?.args?.eventId;
      
      return {
        txHash: tx.hash,
        eventId: eventId?.toString()
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(error.reason || error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Fetch all events
  const fetchEvents = useCallback(async () => {
    console.log('Fetching events...');
    
    if (!contract) {
      const error = new Error('Contract not initialized');
      console.error('Contract not initialized');
      throw error;
    }
    
    try {
      setLoading(true);
      console.log('Getting event count...');
      const eventCount = await contract.eventCount().catch(err => {
        console.error('Error getting event count:', err);
        throw new Error('Failed to get event count from contract');
      });
      
      console.log(`Found ${eventCount} events`);
      const events = [];
      
      for (let i = 1; i <= eventCount; i++) {
        try {
          console.log(`Fetching event ${i}...`);
          const event = await contract.events(i);
          
          if (event && event.exists) {
            console.log(`Processing event ${i}:`, event);
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
        } catch (err) {
          console.error(`Error processing event ${i}:`, {
            error: err,
            message: err.message,
            stack: err.stack
          });
          continue;
        }
      }
      
      console.log(`Successfully fetched ${events.length} events`);
      return events;
    } catch (error) {
      console.error('Error in fetchEvents:', {
        error,
        message: error.message,
        stack: error.stack,
        contractAddress: contract?.target,
        account,
        isConnected,
        chainId
      });
      
      let errorMessage = 'Failed to fetch events';
      if (error.message.includes('wallet not connected')) {
        errorMessage = 'Please connect your wallet to view events';
      } else if (error.message.includes('network changed')) {
        errorMessage = 'Network changed. Please refresh the page.';
      } else if (error.message.includes('revert')) {
        errorMessage = 'Transaction was reverted by the contract';
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Initialize provider and check if wallet is connected
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
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setIsConnected(false);
    setChainId(null);
    setBalance('0');
    setError('');
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 provider');
      return;
    }

    try {
      setLoading(true);
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Initialize contract
      const { contract } = await initContract(web3Provider);
      
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

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Re-initialize contract with new signer
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          await initContract(web3Provider);
          
          // Update balance
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
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [connectWallet, initContract]);

  // Get all events
  const getAllEvents = async () => {
    console.log("getAllEvents called");
    
    if (!isConnected) {
      const error = new Error("Wallet not connected");
      console.error("Wallet connection error:", error);
      throw error;
    }
    
    if (!contract) {
      const error = new Error("Contract not initialized");
      console.error("Contract error:", error);
      throw error;
    }
    
    try {
      console.log("Fetching event count...");
      const eventCount = await contract.eventCount();
      console.log(`Found ${eventCount} events in contract`);
      
      if (!eventCount || eventCount === 0) {
        console.log("No events found in contract");
        return [];
      }
      
      // Fetch all events
      const events = [];
      for (let i = 1; i <= eventCount; i++) {
        try {
          console.log(`Fetching event ${i}/${eventCount}`);
          const event = await contract.events(i);
          
          if (event && event.exists) {
            console.log(`Event ${i} data:`, event);
            events.push({
              id: i.toString(),
              name: event.name || 'Unnamed Event',
              location: event.location || 'Location not specified',
              date: event.date ? event.date.toString() : '0',
              price: event.price ? event.price.toString() : '0',
              ticketsAvailable: event.ticketsAvailable ? event.ticketsAvailable.toString() : '0',
              ticketsSold: event.ticketsSold ? event.ticketsSold.toString() : '0',
              organizer: event.organizer || '0x0000000000000000000000000000000000000000',
              description: event.description || 'No description available',
              exists: true
            });
          } else {
            console.log(`Event ${i} does not exist or is empty`);
          }
        } catch (err) {
          console.error(`Error fetching event ${i}:`, err);
          // Skip this event if there's an error
          continue;
        }
      }
      
      console.log(`Successfully fetched ${events.length} events`);
      return events;
    } catch (err) {
      console.error("Error in getAllEvents:", {
        error: err,
        message: err.message,
        stack: err.stack,
        connected: isConnected,
        contractAddress: contract?.address,
        provider: provider ? 'Provider available' : 'No provider'
      });
      throw new Error(`Failed to fetch events: ${err.message}`);
    }
  };
  
  // Get event by ID
  const getEventById = async (eventId) => {
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
  };
  
  // Buy tickets for an event
  const buyTicket = async (eventId, quantity) => {
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
      
      // Get the ticket IDs from the transaction receipt
      const ticketIds = [];
      receipt.events?.forEach(event => {
        if (event.event === 'TicketPurchased') {
          ticketIds.push(event.args.ticketId.toString());
        }
      });
      
      return {
        txHash: tx.hash,
        ticketIds,
        eventId: eventId.toString(),
        quantity: quantity.toString(),
        totalPrice: totalPrice.toString()
      };
    } catch (err) {
      console.error("Error buying ticket:", err);
      throw new Error(err.reason || err.message || "Failed to buy ticket");
    }
  };
  
  // Get tickets for the current user
  const getTicketsForUser = async () => {
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
              exists: ticket.exists
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
  };
  
  // Get tickets for a specific event
  const getTicketsForEvent = async (eventId) => {
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
          
          if (ticket.exists && ticket.owner.toLowerCase() === account.toLowerCase()) {
            tickets.push({
              id: ticketId.toString(),
              eventId: ticket.eventId.toString(),
              owner: ticket.owner,
              used: ticket.used,
              exists: ticket.exists
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
  };
  
  // Check if a ticket is valid
  const checkTicketValidity = async (ticketId) => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      return await contract.isTicketValid(ticketId);
    } catch (err) {
      console.error("Error checking ticket validity:", err);
      throw new Error("Failed to check ticket validity");
    }
  };
  
  // Mark a ticket as used
  const useTicket = async (ticketId) => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      const tx = await contract.useTicket(ticketId, { gasLimit: 200000 });
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error using ticket:", err);
      throw new Error(err.reason || err.message || "Failed to use ticket");
    }
  };

  return (
    <Web3Context.Provider
      value={{
        // State
        provider,
        signer,
        contract,
        account,
        isConnected,
        loading,
        error,
        chainId,
        balance,
        
        // Methods
        connectWallet,
        disconnectWallet,
        createEvent,
        fetchEvents,
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

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
