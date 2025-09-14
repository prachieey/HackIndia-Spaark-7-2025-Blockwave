import axios from 'axios';
import { API_BASE_URL } from '../config';

// Get all tickets for the current user
export const getTicketsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tickets/user/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error.response?.data || new Error('Failed to fetch tickets');
  }
};

// Get a single ticket by ID
export const getTicketById = async (ticketId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error.response?.data || new Error('Failed to fetch ticket');
  }
};

// Transfer a ticket to another user
export const transferTicket = async (ticketId, { recipientEmail, message }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tickets/${ticketId}/transfer`,
      { recipientEmail, message }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error transferring ticket:', error);
    throw error.response?.data || new Error('Failed to transfer ticket');
  }
};

// Cancel a ticket
export const cancelTicket = async (ticketId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tickets/${ticketId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    throw error.response?.data || new Error('Failed to cancel ticket');
  }
};

// Verify a ticket (for event organizers)
export const verifyTicket = async (ticketId, { status = 'used', notes = '' } = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tickets/${ticketId}/verify`,
      { status, notes }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error verifying ticket:', error);
    throw error.response?.data || new Error('Failed to verify ticket');
  }
};

// Get tickets for an event (for event organizers)
export const getTicketsByEvent = async (eventId, { status, page = 1, limit = 20 } = {}) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    const response = await axios.get(
      `${API_BASE_URL}/events/${eventId}/tickets?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    throw error.response?.data || new Error('Failed to fetch event tickets');
  }
};

// Check in a ticket (for event organizers)
export const checkInTicket = async (ticketId, { checkInTime = new Date(), notes = '' } = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tickets/${ticketId}/check-in`,
      { checkInTime, notes }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error checking in ticket:', error);
    throw error.response?.data || new Error('Failed to check in ticket');
  }
};

// Generate a ticket QR code
export const generateTicketQRCode = async (ticketId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/tickets/${ticketId}/qrcode`,
      { responseType: 'blob' }
    );
    return URL.createObjectURL(new Blob([response.data]));
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error.response?.data || new Error('Failed to generate QR code');
  }
};

// Download ticket as PDF
export const downloadTicketPDF = async (ticketId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/tickets/${ticketId}/download`,
      { responseType: 'blob' }
    );
    
    // Create a blob URL for the PDF
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ticket-${ticketId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading ticket:', error);
    throw error.response?.data || new Error('Failed to download ticket');
  }
};
