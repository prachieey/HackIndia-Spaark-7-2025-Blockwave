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
    console.log('[Web3Context] connectWallet called');
    
    if (!window.ethereum) {
      const errorMsg = 'No Ethereum provider found. Please install MetaMask!';
      console.error(errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // Check if already connected
    if (isConnected && account) {
      console.log('[Web3Context] Wallet already connected:', account);
      return true;
    }

    try {
      console.log('[Web3Context] Setting loading to true');
      setLoading(true);
      setError('');
      
      // Create a new provider instance
      console.log('[Web3Context] Creating new BrowserProvider');
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      console.log('[Web3Context] Requesting accounts');
      let accounts;
      try {
        console.log('[Web3Context] Requesting accounts with ethereum provider:', {
          isMetaMask: window.ethereum.isMetaMask,
          isConnected: window.ethereum.isConnected(),
          selectedAddress: window.ethereum.selectedAddress,
          chainId: window.ethereum.chainId
        });
        
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('[Web3Context] Accounts received:', accounts);
      } catch (err) {
        console.error('[Web3Context] Error requesting accounts:', {
          name: err.name,
          message: err.message,
          code: err.code,
          stack: err.stack,
          data: err.data
        });
        
        if (err.code === 4001 || err.code === -32002) {
          // EIP-1193 userRejectedRequest error or already processing
          throw new Error('Please check your MetaMask extension and approve the connection.');
        } else if (err.code === -32002) {
          throw new Error('A connection request is already pending. Please check your MetaMask extension.');
        } else if (err.code === 'UNSUPPORTED_OPERATION') {
          throw new Error('Unsupported operation. Please ensure you are on a supported network.');
        } else {
          throw new Error(`Connection failed: ${err.message || 'Unknown error'}`);
        }
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet.');
      }
      
      const account = accounts[0];
      console.log('[Web3Context] Selected account:', account);
      
      try {
        // Initialize contract
        console.log('[Web3Context] Initializing contract');
        await initContract(web3Provider);
        
        // Get network info
        const network = await web3Provider.getNetwork();
        const chainId = Number(network.chainId);
        console.log('[Web3Context] Connected to network:', network.name, 'Chain ID:', chainId);
        
        // Get account balance
        console.log('[Web3Context] Getting account balance');
        const balance = await web3Provider.getBalance(account);
        const formattedBalance = ethers.formatEther(balance);
        
        // Update state
        setAccount(account);
        setProvider(web3Provider);
        setChainId(chainId);
        setBalance(formattedBalance);
        setIsConnected(true);
        
        console.log('[Web3Context] Wallet connected successfully');
        toast.success(`Connected to ${account.substring(0, 6)}...${account.substring(38)}`);
        
        // Set up event listeners
        console.log('[Web3Context] Setting up event listeners');
        
        // Remove any existing listeners to prevent duplicates
        if (window.ethereum.removeListener) {
          window.ethereum.removeAllListeners('accountsChanged');
          window.ethereum.removeAllListeners('chainChanged');
        }
        
        // Set up new listeners
        window.ethereum.on('accountsChanged', async (newAccounts) => {
          console.log('[Web3Context] accountsChanged:', newAccounts);
          if (newAccounts && newAccounts.length > 0) {
            const newAccount = newAccounts[0];
            const newBalance = await web3Provider.getBalance(newAccount);
            setAccount(newAccount);
            setBalance(ethers.formatEther(newBalance));
            toast.info(`Switched to account: ${newAccount.substring(0, 6)}...`);
          } else {
            // Disconnected
            console.log('[Web3Context] Wallet disconnected');
            setAccount('');
            setIsConnected(false);
            setSigner(null);
            setContract(null);
            toast.warning('Wallet disconnected');
          }
        });
        
        window.ethereum.on('chainChanged', (chainId) => {
          console.log('[Web3Context] chainChanged:', chainId);
          // Reload the page when network changes
          window.location.reload();
        });
        
        return true;
        
      } catch (err) {
        console.error('[Web3Context] Error in contract initialization:', err);
        throw new Error(err.message || 'Failed to initialize contract');
      }
      
    } catch (err) {
      console.error('[Web3Context] Error in connectWallet:', err);
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      
      // More specific error messages for common issues
      let userMessage = 'Failed to connect wallet';
      if (err.code === -32002) {
        userMessage = 'Please check your MetaMask extension and approve the connection';
      } else if (err.code === 'ACTION_REJECTED') {
        userMessage = 'Connection request was rejected';
      } else if (err.code === 'UNSUPPORTED_OPERATION') {
        userMessage = 'Unsupported operation. Please check your network connection.';
      }
      
      toast.error(userMessage, { autoClose: 5000 });
      return false;
      
    } finally {
      console.log('[Web3Context] Setting loading to false');
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

  // Create a new event on the blockchain
  const createEvent = useCallback(async (name, location, date, price, ticketsAvailable, description = '') => {
    if (!isConnected || !contract) {
      throw new Error("Wallet not connected");
    }
    
    try {
      setLoading(true);
      
      // Basic input validation
      if (!name || !location || !date) {
        throw new Error('Please fill in all required fields');
      }
      
      console.log('Creating event with params:', {
        name,
        location,
        date,
        price,
        ticketsAvailable,
        description
      });
      
      // Ensure price is a valid number and convert to wei
      let priceInWei;
      try {
        // Convert price to a string and clean it
        const priceStr = price.toString().trim().replace(/,/g, '.');
        
        // Validate price is a positive number
        if (isNaN(priceStr) || parseFloat(priceStr) <= 0) {
          throw new Error('Price must be a positive number');
        }
        
        // First, validate it's a positive number
        const priceNum = parseFloat(priceStr);
        if (isNaN(priceNum) || priceNum <= 0) {
          throw new Error('Price must be a positive number');
        }
        
        // Then parse to wei
        priceInWei = ethers.parseEther(priceStr);
        
        // Only check for minimum value (0.000001 ETH)
        if (priceNum < 0.000001) {
          throw new Error('Price is too low. Minimum is 0.000001 ETH');
        }
      } catch (e) {
        console.error('Price conversion error:', e);
        throw new Error(e.message.includes('fractional component') 
          ? 'Invalid price format. Please use numbers with up to 18 decimal places (e.g., 0.1 for 0.1 ETH)'
          : e.message || 'Invalid price format');
      }
      
      // Ensure date is valid and convert to timestamp
      let dateTimestamp;
      try {
        let timestamp;
        
        // Handle different date input types
        if (date instanceof Date) {
          timestamp = date.getTime();
        } else if (typeof date === 'number' || (typeof date === 'string' && /^\d+$/.test(date))) {
          // If it's a number or numeric string, check if it's in seconds or milliseconds
          const num = Number(date);
          timestamp = num <= 1e10 ? num * 1000 : num; // If <= 1e10, assume it's in seconds
        } else {
          // Try to parse as a date string
          timestamp = new Date(date).getTime();
        }
        
        // Validate the timestamp
        if (isNaN(timestamp)) {
          throw new Error('Invalid date format');
        }
        
        // Ensure the timestamp is in milliseconds
        if (timestamp < 1e10) {
          timestamp *= 1000;
        }
        
        // Convert to seconds for the blockchain
        dateTimestamp = Math.floor(timestamp / 1000);
        
        // Validate the date (should be in the future, at least 5 minutes from now)
        const currentTime = Math.floor(Date.now() / 1000);
        const minTime = currentTime + 300; // 5 minutes from now
        
        if (dateTimestamp < minTime) {
          throw new Error('Event date must be at least 5 minutes in the future');
        }
        
        console.log('Date validation:', {
          input: date,
          parsed: new Date(dateTimestamp * 1000).toISOString(),
          unixTimestamp: dateTimestamp
        });
      } catch (e) {
        console.error('Date parsing error:', e);
        throw new Error(e.message === 'Invalid date format' 
          ? 'Invalid date format. Please use YYYY-MM-DD format.' 
          : e.message || 'Please select a valid future date.');
      }
      
      // Ensure ticketsAvailable is a positive integer
      const tickets = Math.floor(Number(ticketsAvailable));
      if (isNaN(tickets) || tickets <= 0) {
        throw new Error('Number of tickets must be a positive number');
      }
      
      try {
        console.log('Calling contract.createEvent with:', {
          name,
          location,
          date: dateTimestamp,
          price: priceInWei.toString(),
          ticketsAvailable: tickets,
          description: description || ''
        });
        
        // Prepare the transaction parameters
        const txParams = {
          gasLimit: 3000000, // Increased gas limit for event creation
        };
        
        console.log('Sending transaction with params:', {
          name,
          location,
          date: dateTimestamp,
          price: priceInWei.toString(),
          tickets,
          description: description || '',
          txParams
        });
        
        // Call the smart contract with only the required parameters
        const tx = await contract.createEvent(
          name,                // string
          location,            // string
          dateTimestamp,       // uint256 (seconds since epoch)
          priceInWei,          // uint256 (in wei)
          tickets,             // uint256
          { ...txParams }      // Transaction overrides as the last parameter
        );
        
        console.log('Transaction sent, waiting for confirmation...');
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction mined:', receipt);
        
        // Get the event ID from the transaction receipt
        let eventId = null;
        if (receipt.logs) {
          for (const log of receipt.logs) {
            try {
              const parsedLog = contract.interface.parseLog(log);
              if (parsedLog && parsedLog.name === 'EventCreated') {
                eventId = parsedLog.args.eventId.toString();
                console.log('Event created with ID:', eventId);
                break;
              }
            } catch (e) {
              // Ignore logs that can't be parsed
              console.log('Skipping unparsable log:', e);
              continue;
            }
          }
        }
        
        if (!eventId) {
          console.warn('EventCreated event not found in receipt logs');
          // Try to get the latest event ID as a fallback
          try {
            const eventCount = await contract.eventCount();
            eventId = (eventCount - 1n).toString(); // Assuming eventCount is 1-based
            console.log('Falling back to latest event ID:', eventId);
          } catch (e) {
            console.error('Error getting event count:', e);
          }
        }
        
        if (!eventId) {
          throw new Error('Event created but could not retrieve event ID');
        }
        
        // Get the created event details
        const event = await contract.events(eventId);
        
        const result = {
          txHash: receipt.hash,
          eventId,
          name: event.name,
          location: event.location,
          date: event.date.toString(),
          price: ethers.formatEther(event.price),
          ticketsAvailable: event.ticketsAvailable.toString(),
          organizer: event.organizer,
          description: event.description || ''
        };
        
        console.log('Event created successfully:', result);
        return result;
        
      } catch (contractError) {
        console.error('Contract call error:', {
          error: contractError,
          message: contractError.message,
          reason: contractError.reason,
          code: contractError.code,
          data: contractError.data
        });
        
        // Rethrow with more context if needed
        throw contractError;
      }
      
    } catch (error) {
      console.error("Error creating event:", {
        error,
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data
      });
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to create event';
      
      if (error.code === 'INVALID_ARGUMENT') {
        errorMessage = 'Invalid input parameters. Please check your inputs and try again.';
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction would fail. Please check your inputs and try again.';
      } else if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        errorMessage = 'Transaction was rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Transaction failed. You may not have enough ETH for gas.';
      } else if (error.reason) {
        // Extract user-friendly error message from the revert reason
        errorMessage = error.reason
          .replace('execution reverted: ', '')
          .replace('VM Exception while processing transaction: revert ', '');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
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
        createEvent,
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
