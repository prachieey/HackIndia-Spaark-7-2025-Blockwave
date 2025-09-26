import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, Bank, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import PropTypes from 'prop-types';
import { cn } from '../lib/utils';

// Mock payment gateway API
const mockPaymentGateway = async ({ method, details, amount }) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  if (method === 'card' && !/^\d{16}$/.test(details.cardNumber)) {
    throw new Error('Invalid card number');
  }
  if (method === 'upi' && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/.test(details.upiId)) {
    throw new Error('Invalid UPI ID');
  }
  if (method === 'wallet' && details.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  return {
    transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    status: 'success'
  };
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticket = location.state?.ticket || null;
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [savePayment, setSavePayment] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
    walletBalance: 1000 // Mock wallet balance
  });
  const [formErrors, setFormErrors] = useState({});

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (selectedMethod === 'card') {
      if (!/^\d{16}$/.test(formData.cardNumber)) errors.cardNumber = 'Card number must be 16 digits';
      if (!/^[a-zA-Z\s]+$/.test(formData.cardName)) errors.cardName = 'Invalid name';
      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(formData.expiry)) errors.expiry = 'Invalid expiry (MM/YY)';
      if (!/^\d{3,4}$/.test(formData.cvv)) errors.cvv = 'Invalid CVV';
    }
    if (selectedMethod === 'upi') {
      if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/.test(formData.upiId)) {
        errors.upiId = 'Invalid UPI ID';
      }
    }
    if (selectedMethod === 'wallet' && formData.walletBalance < (ticket?.resellPrice || 0) * (1 - discount)) {
      errors.wallet = 'Insufficient wallet balance';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(0.1); // 10% discount
      setError('');
    } else {
      setDiscount(0);
      setError('Invalid promo code');
    }
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!ticket) {
      setError('No ticket selected. Please go back and select a ticket.');
      return;
    }
    if (!validateForm()) {
      setError('Please fix the errors in the form.');
      return;
    }
    setShowConfirmDialog(true);
  };

  // Confirm payment
  const confirmPayment = async () => {
    setLoading(true);
    setShowConfirmDialog(false);
    try {
      const paymentDetails = {
        method: selectedMethod,
        details: {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          expiry: formData.expiry,
          cvv: formData.cvv,
          upiId: formData.upiId,
          balance: formData.walletBalance
        },
        amount: ticket.resellPrice * (1 - discount)
      };
      const result = await mockPaymentGateway(paymentDetails);
      if (savePayment) {
        console.log(`Saving ${selectedMethod} details for future use`);
      }
      navigate('/payment-success', {
        state: {
          ticket,
          transaction: {
            id: result.transactionId,
            timestamp: result.timestamp,
            amount: ticket.resellPrice * (1 - discount),
            method: selectedMethod
          }
        }
      });
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setFormErrors(prev => ({ ...prev, [id]: '' }));
  };

  // Mock QR code SVG
  const QRCode = () => (
    <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
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

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5 mr-2 text-gray-700" /> },
    { id: 'upi', label: 'UPI Payment', icon: <Smartphone className="h-5 w-5 mr-2 text-gray-700" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5 mr-2 text-gray-700" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <Bank className="h-5 w-5 mr-2 text-gray-700" /> }
  ];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Complete Your Purchase</h1>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 text-red-600 rounded-lg"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Summary */}
          {ticket ? (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{ticket.eventName}</h3>
                  <p className="text-sm text-gray-600">{ticket.ticketType}</p>
                </div>
                <div className="flex justify-between">
                  <span>Ticket Price</span>
                  <span>₹{ticket.resellPrice.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoCode})</span>
                    <span>-₹{(ticket.resellPrice * discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{(ticket.resellPrice * (1 - discount)).toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Event Date: {new Date(ticket.eventDate).toLocaleDateString('en-IN')}</p>
                  <p>Location: {ticket.eventLocation}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-1">
              <CardContent className="p-6 text-center">
                <p className="text-red-600">No ticket selected. Please go back to select a ticket.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)} aria-label="Go back">
                  Go Back
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Payment Methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        'p-4 border rounded-lg cursor-pointer transition-all duration-200',
                        selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      )}
                      onClick={() => setSelectedMethod(method.id)}
                      role="radio"
                      aria-checked={selectedMethod === method.id}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3',
                            selectedMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          )}
                        >
                          {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        {method.icon}
                        <span className="text-gray-900">{method.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="space-y-2">
                  <Label htmlFor="promoCode" className="block text-sm font-medium text-gray-900">
                    Promo Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      aria-label="Promo code"
                    />
                    <Button onClick={applyPromoCode} disabled={!promoCode} aria-label="Apply promo code">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayment} className="space-y-6">
                  {selectedMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-900 mb-1">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className={cn(
                            'text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500',
                            formErrors.cardNumber && 'border-red-500'
                          )}
                          required
                          maxLength={16}
                          aria-label="Card number"
                        />
                        {formErrors.cardNumber && <p className="text-xs text-red-600 mt-1">{formErrors.cardNumber}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cardName" className="block text-sm font-medium text-gray-900 mb-1">
                          Name on Card
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className={cn(
                            'text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500',
                            formErrors.cardName && 'border-red-500'
                          )}
                          required
                          aria-label="Name on card"
                        />
                        {formErrors.cardName && <p className="text-xs text-red-600 mt-1">{formErrors.cardName}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="block text-sm font-medium text-gray-900 mb-1">
                            Expiry Date
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            className={cn(
                              'text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500',
                              formErrors.expiry && 'border-red-500'
                            )}
                            required
                            aria-label="Expiry date"
                          />
                          {formErrors.expiry && <p className="text-xs text-red-600 mt-1">{formErrors.expiry}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="block text-sm font-medium text-gray-900 mb-1">
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            type="password"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={cn(
                              'text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500',
                              formErrors.cvv && 'border-red-500'
                            )}
                            required
                            maxLength={4}
                            aria-label="CVV"
                          />
                          {formErrors.cvv && <p className="text-xs text-red-600 mt-1">{formErrors.cvv}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={savePayment}
                          onCheckedChange={setSavePayment}
                          aria-label="Save card for future payments"
                        />
                        <Label htmlFor="saveCard" className="text-sm text-gray-900">
                          Save card for future payments
                        </Label>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'upi' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-700 mb-2">Scan the QR code or enter your UPI ID</p>
                        <QRCode />
                      </div>
                      <div>
                        <Label htmlFor="upiId" className="block text-sm font-medium text-gray-900 mb-1">
                          UPI ID
                        </Label>
                        <Input
                          id="upiId"
                          placeholder="yourname@upi"
                          value={formData.upiId}
                          onChange={handleInputChange}
                          className={cn(
                            'text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500',
                            formErrors.upiId && 'border-red-500'
                          )}
                          required
                          aria-label="UPI ID"
                        />
                        {formErrors.upiId && <p className="text-xs text-red-600 mt-1">{formErrors.upiId}</p>}
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'wallet' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                          Wallet Balance: ₹{formData.walletBalance.toLocaleString()}
                        </p>
                        {formErrors.wallet && <p className="text-xs text-red-600 mt-1">{formErrors.wallet}</p>}
                        <Button
                          variant="link"
                          className="p-0 text-yellow-600 mt-2"
                          onClick={() => alert('Add funds functionality not implemented')}
                          aria-label="Add funds to wallet"
                        >
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Select your bank to proceed with net banking.</p>
                      </div>
                      <div>
                        <Label htmlFor="bank" className="block text-sm font-medium text-gray-900 mb-1">
                          Select Bank
                        </Label>
                        <select
                          id="bank"
                          className="w-full p-2 border rounded text-gray-900 focus:ring-2 focus:ring-blue-500"
                          required
                          aria-label="Select bank"
                        >
                          <option value="">Select a bank</option>
                          <option value="sbi">State Bank of India</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Mock CSRF Token */}
                  <input type="hidden" name="csrfToken" value="mock-csrf-token" />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading || !ticket}
                      aria-label="Pay now"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Pay Now'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                      aria-label="Cancel payment"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                You are about to pay ₹{(ticket?.resellPrice * (1 - discount)).toLocaleString()} for {ticket?.eventName}. Proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} aria-label="Cancel payment confirmation">
                Cancel
              </Button>
              <Button onClick={confirmPayment} aria-label="Confirm payment">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

PaymentPage.propTypes = {
  // No props are passed directly, but defining for future extensibility
};

export default PaymentPage;
