import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Download, Mail, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import PropTypes from 'prop-types';

// Mock functions for ticket download and email
const mockDownloadTicket = (ticket) => {
  console.log(`Downloading ticket for ${ticket.eventName}`);
  alert('Ticket PDF download initiated (mock implementation)');
};

const mockSendConfirmationEmail = (ticket, transaction) => {
  console.log(`Sending confirmation email for transaction ${transaction.id}`);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// Mock QR code SVG
const QRCode = ({ ticketId }) => (
  <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100" aria-label={`QR code for ticket ${ticketId}`}>
    <rect width="100" height="100" fill="#fff" />
    <rect x="10" y="10" width="20" height="20" fill="#000" />
    <rect x="70" y="10" width="20" height="20" fill="#000" />
    <rect x="10" y="70" width="20" height="20" fill="#000" />
    <rect x="40" y="40" width="20" height="20" fill="#000" />
    <path d="M15 15 h10 v10 h-10 v-10 M75 15 h10 v10 h-10 v-10 M15 75 h10 v10 h-10 v-10" fill="none" stroke="#000" strokeWidth="2" />
    <rect x="30" y="30" width="10" height="10" fill="#000" />
    <rect x="60" y="60" width="10" height="10" fill="#000" />
  </svg>
);

QRCode.propTypes = {
  ticketId: PropTypes.string.isRequired,
};

const PaymentSuccessPage = () => {
  const location = useLocation();
  const { ticket, transaction } = location.state || {};
  const [emailSent, setEmailSent] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Validate state
  const isValidState = ticket && transaction && transaction.id && transaction.amount && transaction.timestamp;

  // Handle email sending
  const handleSendEmail = async () => {
    if (!isValidState) return;
    setSendingEmail(true);
    try {
      await mockSendConfirmationEmail(ticket, transaction);
      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle feedback rating
  const handleFeedback = (rating) => {
    setFeedbackRating(rating);
    console.log(`User rated purchase experience: ${rating} stars`);
  };

  // Mock confetti effect
  const confettiEffect = (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 bg-blue-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: 1,
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        className="max-w-lg mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isValidState ? (
          <>
            {confettiEffect}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" aria-label="Payment success icon" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">
              Your ticket for <span className="font-semibold">{ticket.eventName}</span> has been successfully purchased.
            </p>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium text-gray-900">{ticket.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Type:</span>
                  <span className="font-medium text-gray-900">{ticket.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Date:</span>
                  <span className="text-gray-900">
                    {new Date(ticket.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-900">{ticket.eventLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm text-gray-900">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-900 capitalize">{transaction.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Date:</span>
                  <span className="text-gray-900">
                    {new Date(transaction.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                  <span>Total Paid:</span>
                  <span className="text-green-600">₹{transaction.amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* QR Code for Ticket */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Your Ticket QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <QRCode ticketId={transaction.id} />
                <p className="text-sm text-gray-600 mt-2">Scan this QR code at the event for entry.</p>
              </CardContent>
            </Card>

            {/* Feedback Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Rate Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleFeedback(star)}
                    className={cn(
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded',
                      feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'
                    )}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star className="h-6 w-6" fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => mockDownloadTicket(ticket)}
                aria-label="Download ticket"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Ticket
              </Button>
              <Button
                className="w-full"
                onClick={handleSendEmail}
                disabled={sendingEmail || emailSent || !isValidState}
                aria-label={emailSent ? 'Confirmation email sent' : 'Send confirmation email'}
              >
                {sendingEmail ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending...
                  </>
                ) : emailSent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Email Sent
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Confirmation Email
                  </>
                )}
              </Button>
              <Button asChild className="w-full">
                <Link to="/my-tickets" aria-label="View my tickets">
                  View My Tickets
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/events/${ticket.eventId}`} aria-label="View event details">
                  View Event Details
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/" aria-label="Back to home">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">No payment details found. Please complete your purchase.</p>
              <Button asChild variant="outline" aria-label="Go back to tickets">
                <Link to="/resell">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tickets
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

PaymentSuccessPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      ticket: PropTypes.shape({
        eventName: PropTypes.string,
        ticketType: PropTypes.string,
        eventDate: PropTypes.string,
        eventLocation: PropTypes.string,
        eventId: PropTypes.string,
        resellPrice: PropTypes.number,
      }),
      transaction: PropTypes.shape({
        id: PropTypes.string,
        timestamp: PropTypes.string,
        amount: PropTypes.number,
        method: PropTypes.string,
      }),
    }),
  }),
};

export default PaymentSuccessPage;
