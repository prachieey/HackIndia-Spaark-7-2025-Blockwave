import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Mail, 
  Star, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  ExternalLink,
  HelpCircle,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Mock functions
const mockDownloadTicket = (ticket) => {
  console.log(`Downloading ticket for ${ticket.eventName}`);
  toast.success('Ticket downloaded successfully!');  
  // In a real app, this would trigger an actual download
  return new Promise(resolve => setTimeout(resolve, 1000));
};

const mockSendConfirmationEmail = (ticket) => {
  console.log(`Sending confirmation email for ticket ${ticket.id}`);
  return new Promise(resolve => {
    setTimeout(() => {
      toast.success('Confirmation email sent!');
      resolve();
    }, 1000);
  });
};

// QR Code Component
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

const PaymentSuccessPage = () => {
  const location = useLocation();
  const { ticket, transaction } = location.state || {};
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Generate mock data if not provided
  const currentTransaction = transaction || {
    id: 'TXN' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    amount: ticket?.resellPrice || 0,
    date: new Date(),
    status: 'completed',
    paymentMethod: 'Credit Card',
    discount: 0
  };

  // Format date and time
  const formattedDate = currentTransaction.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTransaction.date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleDownloadTicket = async () => {
    if (!ticket) return;
    setIsDownloading(true);
    try {
      await mockDownloadTicket(ticket);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download ticket. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailTicket = async () => {
    if (!ticket) return;
    setIsSendingEmail(true);
    try {
      await mockSendConfirmationEmail(ticket);
      setEmailSent(true);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Confetti effect on mount
  useEffect(() => {
    if (ticket) {
      // Trigger confetti effect
      const timer = setTimeout(() => {
        // This would be replaced with a real confetti library in production
        console.log('Confetti effect!');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Ticket Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find your ticket details. Please check your email or contact support.</p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/my-tickets">View My Tickets</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="show"
        variants={staggerContainer}
      >
        {/* Success Header */}
        <motion.div 
          className="text-center mb-10"
          variants={fadeIn}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your ticket for <span className="font-semibold text-gray-900">{ticket.eventName}</span> has been confirmed.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500">Order ID:</span>
            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
              <span className="font-mono text-sm">{currentTransaction.id}</span>
              <button 
                onClick={() => copyToClipboard(currentTransaction.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                aria-label="Copy order ID"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ticket Details */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            variants={fadeIn}
          >
            {/* Event Ticket Card */}
            <Card className="overflow-hidden border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{ticket.eventName}</h2>
                    <p className="text-blue-100">{ticket.ticketType || 'General Admission'}</p>
                  </div>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-sm font-medium">
                    E-Ticket
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                        <p className="text-gray-900 font-medium">
                          {formattedDate}
                          <span className="block text-sm text-gray-500 mt-0.5">
                            <Clock className="inline h-4 w-4 mr-1" />
                            {formattedTime} (IST)
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        <p className="text-gray-900 font-medium">
                          {ticket.eventLocation || 'Venue Name'}
                          <span className="block text-sm text-gray-500 mt-0.5">
                            {ticket.eventCity || 'City, Country'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Attendee</h4>
                        <p className="text-gray-900 font-medium">
                          {ticket.attendeeName || 'Your Name'}
                          <span className="block text-sm text-gray-500 mt-0.5">
                            {ticket.attendeeEmail || 'email@example.com'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Ticket Details</h4>
                        <p className="text-gray-900 font-medium">
                          1x {ticket.ticketType || 'General Admission'}
                          <span className="block text-sm text-gray-500">
                            Order #{currentTransaction.id.substring(0, 8).toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                      <QRCode ticketId={currentTransaction.id} />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Scan this code at the entrance</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ShieldCheck className="h-4 w-4 text-green-500 mr-1.5" />
                  <span>Secured by <span className="font-medium">Blockwave</span></span>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 sm:flex-none"
                    onClick={handleDownloadTicket}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 sm:flex-none"
                    onClick={handleEmailTicket}
                    disabled={isSendingEmail || emailSent}
                  >
                    {isSendingEmail ? (
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
                        Email
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Order Details Accordion */}
            <Card>
              <button 
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                aria-expanded={showOrderDetails}
                aria-controls="order-details-content"
              >
                <h3 className="font-medium text-gray-900">Order Details</h3>
                {showOrderDetails ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {showOrderDetails && (
                  <motion.div
                    id="order-details-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID</span>
                        <div className="flex items-center">
                          <span className="font-mono">{currentTransaction.id}</span>
                          <button 
                            onClick={() => copyToClipboard(currentTransaction.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                            aria-label="Copy order ID"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order Date</span>
                        <span>{formattedDate} at {formattedTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="capitalize">{currentTransaction.paymentMethod || 'Credit Card'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="inline-flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          <span className="capitalize">Completed</span>
                        </span>
                      </div>
                      <div className="pt-4 mt-4 border-t border-gray-100">
                        <h4 className="font-medium text-gray-900 mb-2">Billing Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Name</p>
                            <p>{ticket.attendeeName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="truncate">{ticket.attendeeEmail || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Amount Paid</p>
                            <p>₹{currentTransaction.amount.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Transaction ID</p>
                            <div className="flex items-center">
                              <span className="font-mono text-sm truncate max-w-[120px]">{currentTransaction.id}</span>
                              <button 
                                onClick={() => copyToClipboard(currentTransaction.id)}
                                className="ml-1 text-gray-400 hover:text-gray-600"
                                aria-label="Copy transaction ID"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Check your email</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      We've sent a confirmation email with your ticket to <span className="font-medium">{ticket.attendeeEmail || 'your email address'}</span>.
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-blue-600 hover:text-blue-800 mt-1"
                      onClick={handleEmailTicket}
                      disabled={isSendingEmail || emailSent}
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Sending...
                        </>
                      ) : emailSent ? (
                        'Email Sent!'
                      ) : (
                        'Resend email'
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Add to calendar</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Don't forget to add this event to your calendar. We'll send you a reminder 24 hours before the event.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Google Calendar
                      </Button>
                      <Button variant="outline" size="sm" className="text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Apple Calendar
                      </Button>
                      <Button variant="outline" size="sm" className="text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Outlook
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 pt-2">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-0.5">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Share your experience</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      How was your booking experience? We'd love to hear your feedback!
                    </p>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="focus:outline-none"
                          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                        >
                          <Star 
                            className={`h-6 w-6 ${feedbackRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                      {feedbackRating > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          {feedbackRating} star{feedbackRating !== 1 ? 's' : ''} - Thank you!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Order Summary */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            variants={fadeIn}
          >
            <Card>
              <CardHeader className="bg-gray-50 pb-4">
                <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Price</span>
                    <span>₹{ticket.resellPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {currentTransaction.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({currentTransaction.discount}%)</span>
                      <span>-₹{(ticket.resellPrice * (currentTransaction.discount / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-medium">Total Paid</span>
                    <span className="font-bold text-lg text-blue-600">
                      ₹{currentTransaction.amount?.toFixed(2) || ticket.resellPrice?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleDownloadTicket}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Download Ticket
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => copyToClipboard(window.location.href)}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
                    Secure Payment
                  </h4>
                  <p className="text-sm text-gray-600">
                    Your payment is secure and encrypted. We use industry-standard SSL encryption to protect your data.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your ticket or the event? Our support team is here to help.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-white/50 rounded-full p-3 inline-flex items-center justify-center mb-3">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Enjoying our service?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Rate your experience and help us improve
                  </p>
                  <div className="flex justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`focus:outline-none ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        <Star 
                          className="h-6 w-6"
                          fill={feedbackRating >= star ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                  {feedbackRating > 0 && (
                    <p className="text-sm text-gray-700 mb-3">
                      Thank you for your {feedbackRating} star{feedbackRating !== 1 ? 's' : ''} rating!
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      // In a real app, this would submit the rating
                      toast.success('Thank you for your feedback!');
                    }}
                  >
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">More Events Awaiting</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Discover more exciting events you might be interested in.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/events">
                    Browse Events
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Navigation */}
        <motion.div 
          className="mt-12 pt-8 border-t border-gray-200 text-center"
          variants={fadeIn}
        >
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline" className="px-8">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild className="px-8 bg-blue-600 hover:bg-blue-700">
              <Link to="/my-tickets" className="flex items-center">
                View All Tickets
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            A confirmation has been sent to your email. See you at the event!
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} Blockwave. All rights reserved.</span>
            <div className="hidden sm:block w-px h-4 bg-gray-200"></div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-600">Terms</a>
              <a href="#" className="hover:text-gray-600">Privacy</a>
              <a href="#" className="hover:text-gray-600">Help Center</a>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* This is where toast notifications will appear */}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
