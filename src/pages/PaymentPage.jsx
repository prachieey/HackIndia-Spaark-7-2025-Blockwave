import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Lock, 
  ArrowLeft, 
  Check, 
  Loader2,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Banknote,
  Calendar,
  User,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Tag,
  Headset,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

// Mock payment gateway API
const mockPaymentGateway = async ({ method, details, amount }) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
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
    status: 'success',
    method: method
  };
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticket = location.state?.ticket || null;
  
  // State
  const [activeTab, setActiveTab] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    walletBalance: 1250.50
  });
  const [formErrors, setFormErrors] = useState({});
  const [cardType, setCardType] = useState('');

  // Detect card type
  useEffect(() => {
    const number = formData.cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(number)) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(number)) {
      setCardType('amex');
    } else if (/^6(?:011|5)/.test(number)) {
      setCardType('discover');
    } else {
      setCardType('');
    }
  }, [formData.cardNumber]);

  // Format card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (activeTab === 'card') {
      if (!formData.cardNumber || !/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Valid card number is required';
      }
      if (!formData.cardName || !/^[a-zA-Z\s]+$/.test(formData.cardName)) {
        errors.cardName = 'Valid cardholder name is required';
      }
      if (!formData.expiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiry)) {
        errors.expiry = 'Valid expiry date (MM/YY) is required';
      } else {
        const [month, year] = formData.expiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month), 0);
        const currentDate = new Date();
        
        if (expiryDate < currentDate) {
          errors.expiry = 'Card has expired';
        }
      }
      if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = cardType === 'amex' ? '4-digit CVV required' : '3-digit CVV required';
      }
    } else if (activeTab === 'upi') {
      if (!formData.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/.test(formData.upiId)) {
        errors.upiId = 'Valid UPI ID is required (e.g., name@upi)';
      }
    } else if (activeTab === 'wallet') {
      if (formData.walletBalance < (ticket?.resellPrice || 0) * (1 - discount)) {
        errors.wallet = 'Insufficient wallet balance';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle promo code
  const applyPromoCode = () => {
    const promo = promoCode.trim().toUpperCase();
    
    if (!promo) {
      setError('Please enter a promo code');
      return;
    }
    
    // Simulate API call to validate promo code
    setLoading(true);
    
    setTimeout(() => {
      if (promo === 'SAVE10') {
        setDiscount(0.1); // 10% discount
        setSuccess('Promo code applied successfully! 10% off your order!');
        setError('');
      } else if (promo === 'WELCOME15') {
        setDiscount(0.15); // 15% discount
        setSuccess('Welcome discount applied! 15% off your order!');
        setError('');
      } else {
        setDiscount(0);
        setError('Invalid or expired promo code');
        setSuccess('');
      }
      setLoading(false);
    }, 800);
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
    setError('');
    setSuccess('');
    
    try {
      const paymentDetails = {
        method: activeTab,
        details: {
          ...formData,
          cardNumber: formData.cardNumber.replace(/\s/g, '')
        },
        amount: ticket.resellPrice * (1 - discount)
      };
      
      const result = await mockPaymentGateway(paymentDetails);
      
      if (savePayment) {
        console.log(`Saving ${activeTab} details for future use`);
      }
      
      // Show success message before navigation
      setSuccess('Payment successful! Redirecting...');
      
      // Navigate to success page after a short delay
      setTimeout(() => {
        navigate('/payment-success', {
          state: {
            ticket,
            transaction: {
              id: result.transactionId,
              timestamp: result.timestamp,
              amount: ticket.resellPrice * (1 - discount),
              method: activeTab,
              discount: discount * 100
            }
          }
        });
      }, 1500);
      
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;
    
    // Apply formatting based on input type
    if (id === 'cardNumber') {
      formattedValue = formatCardNumber(value).substring(0, 19);
    } else if (id === 'expiry') {
      formattedValue = formatExpiry(value).substring(0, 5);
    } else if (id === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, cardType === 'amex' ? 4 : 3);
    } else if (id === 'cardName') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [id]: formattedValue }));
    
    // Clear error for this field when user types
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    if (!ticket) return 0;
    const subtotal = ticket.resellPrice || 0;
    const discountAmount = subtotal * discount;
    return (subtotal - discountAmount).toFixed(2);
  };

  // Mock QR code component
  const QRCode = () => (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-gray-200">
      <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center mb-4">
        <div className="text-center p-4">
          <div className="text-xs text-gray-500 mb-2">Scan to pay with UPI</div>
          <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded flex items-center justify-center mx-auto mb-2">
            <Smartphone className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-xs text-gray-500 mt-2">UPI ID: {formData.upiId || 'yourname@upi'}</div>
        </div>
      </div>
      <div className="text-sm text-gray-600 text-center font-sans">
        <p className="font-medium">Or enter this UPI ID in your payment app</p>
        <div className="mt-2 p-2 bg-gray-50 rounded font-mono text-sm tracking-wider border border-gray-200">
          {formData.upiId || 'yourname@upi'}
        </div>
      </div>
    </div>
  );

  // Payment method tabs
  const paymentTabs = [
    {
      id: 'card',
      label: 'Card',
      icon: <CreditCard className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <div className="relative mb-4">
            <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className={cn(
                  "pr-10 text-base font-normal tracking-wide",
                  formErrors.cardNumber && "border-red-500"
                )}
              />
              {cardType && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {cardType === 'visa' ? (
                    <span className="text-blue-600 font-semibold text-sm tracking-wide">VISA</span>
                  ) : cardType === 'mastercard' ? (
                    <span className="text-orange-600 font-semibold text-sm tracking-wide">MC</span>
                  ) : cardType === 'amex' ? (
                    <span className="text-blue-800 font-semibold text-sm tracking-wide">AMEX</span>
                  ) : (
                    <span className="text-gray-600 font-bold text-sm">CARD</span>
                  )}
                </div>
              )}
            </div>
            {formErrors.cardNumber && (
              <p className="mt-1 text-xs text-red-500">{formErrors.cardNumber}</p>
            )}
          </div>
          
          <div className="mb-4">
            <Label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</Label>
            <Input
              id="cardName"
              type="text"
              placeholder="John Doe"
              value={formData.cardName}
              onChange={handleInputChange}
              className={formErrors.cardName && "border-red-500"}
            />
            {formErrors.cardName && (
              <p className="mt-1 text-xs text-red-500">{formErrors.cardName}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={handleInputChange}
                className={formErrors.expiry && "border-red-500"}
              />
              {formErrors.expiry && (
                <p className="mt-1 text-xs text-red-500">{formErrors.expiry}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV {cardType === 'amex' ? '(4 digits)' : '(3 digits)'}
              </Label>
              <Input
                id="cvv"
                type="password"
                placeholder={cardType === 'amex' ? '1234' : '123'}
                value={formData.cvv}
                onChange={handleInputChange}
                className={formErrors.cvv && "border-red-500"}
                maxLength={cardType === 'amex' ? 4 : 3}
              />
              {formErrors.cvv && (
                <p className="mt-1 text-xs text-red-500">{formErrors.cvv}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start space-x-3 pt-1 pb-4 border-b border-gray-100 mb-6">
            <Checkbox 
              id="saveCard" 
              checked={savePayment}
              onCheckedChange={(checked) => setSavePayment(checked)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="saveCard" className="text-sm font-medium text-gray-800 cursor-pointer">
                Save card for future payments
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">
                Securely save your card details for faster checkout next time
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'upi',
      label: 'UPI',
      icon: <Smartphone className="h-4 w-4 mr-2" />,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@upi"
              value={formData.upiId}
              onChange={handleInputChange}
              className={formErrors.upiId && "border-red-500"}
            />
            {formErrors.upiId ? (
              <p className="mt-1 text-xs text-red-500">{formErrors.upiId}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">e.g., yourname@upi, 1234567890@ybl</p>
            )}
          </div>
          
          <div className="pt-4">
            <QRCode />
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Lock className="h-4 w-4 text-green-500" />
            <span>Secure UPI payment powered by</span>
            <span className="font-semibold">BHIM UPI</span>
          </div>
        </div>
      )
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: <Wallet className="h-4 w-4 mr-2" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">Wallet Balance</span>
              </div>
              <span className="text-xl font-bold">₹{formData.walletBalance.toFixed(2)}</span>
            </div>
            {formErrors.wallet && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-100 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {formErrors.wallet}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Available Offers</h4>
            <div className="space-y-2">
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">5% Cashback</p>
                  <p className="text-xs text-gray-500">On wallet recharges above ₹1000</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">100% Secure</p>
                  <p className="text-xs text-gray-500">Your money is always safe with us</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => {
                // In a real app, this would open an add money to wallet flow
                setSuccess('Redirecting to add money to wallet...');
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Money to Wallet
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'netbanking',
      label: 'Net Banking',
      icon: <Banknote className="h-4 w-4 mr-2" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                You will be redirected to your bank's secure payment page to complete the transaction.
              </p>
            </div>
          </div>
          
          <div>
            <Label>Select Bank</Label>
            <div className="mt-2 space-y-2">
              {[
                'State Bank of India',
                'HDFC Bank',
                'ICICI Bank',
                'Axis Bank',
                'Kotak Mahindra Bank',
                'Punjab National Bank',
                'Other Banks'
              ].map((bank) => (
                <div 
                  key={bank}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <Banknote className="h-4 w-4 text-gray-500" />
                  </div>
                  <span className="text-sm font-medium">{bank}</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-gray-500 flex items-center">
              <Lock className="h-3 w-3 mr-1 text-green-500" />
              Your transaction is secured with 256-bit encryption
            </p>
          </div>
        </div>
      )
    }
  ];

  // If no ticket is selected, show error
  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="text-center p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Ticket Selected</h2>
          <p className="text-gray-600 mb-6">
            It seems you haven't selected any ticket to purchase. Please go back and select a ticket to continue.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Event
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Payment form */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <CardTitle className="text-2xl font-semibold flex items-center">
                  <Lock className="h-6 w-6 mr-3" />
                  Secure Payment
                </CardTitle>
                <CardDescription className="text-blue-100 text-base mt-1 font-light">
                  Complete your purchase with a secure payment method
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Error and success messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-800">Payment Error</p>
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                      <button 
                        onClick={() => setError('')}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Success</p>
                        <p className="text-sm text-green-600">{success}</p>
                      </div>
                      <button 
                        onClick={() => setSuccess('')}
                        className="ml-auto text-green-500 hover:text-green-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Payment method tabs */}
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-50 p-1 rounded-lg">
                    {paymentTabs.map((tab) => (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id}
                        className="flex items-center justify-center py-3 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md transition-colors"
                      >
                        <span className="mr-1.5">{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {paymentTabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      {tab.content}
                    </TabsContent>
                  ))}
                </Tabs>
                
                {/* Promo code section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Have a promo code?</h4>
                      <div className="flex mt-1">
                        <Input
                          id="promoCode"
                          type="text"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="rounded-r-none"
                        />
                        <Button 
                          type="button" 
                          onClick={applyPromoCode}
                          disabled={loading || !promoCode.trim()}
                          className="rounded-l-none"
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Tag className="h-4 w-4 mr-2" />
                          )}
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Terms and conditions */}
                <div className="mt-6 flex items-start">
                  <Checkbox 
                    id="terms" 
                    className="mt-1"
                    defaultChecked
                  />
                  <Label 
                    htmlFor="terms" 
                    className="ml-2 text-sm leading-5 text-gray-600"
                  >
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                
                {/* Pay now button */}
                <Button 
                  type="submit" 
                  className="w-full mt-6 py-6 text-base font-medium"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{calculateTotal()}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                
                {/* Secure payment info */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center">
                    <Lock className="h-3 w-3 mr-1 text-green-500" />
                    <span>Secure payment powered by</span>
                    <span className="ml-1 font-medium">Razorpay</span>
                  </p>
                  <div className="flex justify-center space-x-6 mt-3">
                    {['visa', 'mastercard', 'amex', 'rupay'].map((type) => (
                      <div key={type} className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">
                          {type === 'visa' ? 'VISA' : 
                           type === 'mastercard' ? 'MC' : 
                           type === 'amex' ? 'AMEX' : 'RUPAY'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { 
                  icon: <Shield className="h-5 w-5 text-green-500" />, 
                  title: '100% Secure',
                  desc: 'Payments are encrypted and secure'
                },
                { 
                  icon: <ShieldCheck className="h-5 w-5 text-blue-500" />, 
                  title: 'SSL Protected',
                  desc: 'Your data is always encrypted'
                },
                { 
                  icon: <CreditCard className="h-5 w-5 text-purple-500" />, 
                  title: 'Multiple Payments',
                  desc: 'Credit, Debit, UPI & more'
                },
                { 
                  icon: <Headset className="h-5 w-5 text-orange-500" />, 
                  title: '24/7 Support',
                  desc: 'Dedicated support team'
                }
              ].map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-gray-50 rounded-full mr-2">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Event details */}
                <div className="p-5 border-b">
                  <div className="flex items-start">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {ticket.eventImage ? (
                        <img 
                          src={ticket.eventImage} 
                          alt={ticket.eventName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{ticket.eventName}</h3>
                      <p className="text-sm text-gray-500 mt-1">{ticket.ticketType}</p>
                      <div className="mt-1 flex items-center">
                        <User className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">1 {ticket.ticketType} Ticket</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Price breakdown */}
                <div className="p-5 space-y-3">
                  <h4 className="font-medium text-gray-900">Price Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ticket Price</span>
                      <span>₹{ticket.resellPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Discount ({discount * 100}%)
                        </span>
                        <span className="text-green-600">
                          -₹{(ticket.resellPrice * discount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Convenience Fee</span>
                      <span>₹0.00</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (18%)</span>
                      <span>₹{(ticket.resellPrice * 0.18).toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order info */}
                <div className="bg-gray-50 p-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono">ORD{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Support info */}
              <CardFooter className="p-4 bg-gray-50 border-t">
                <div className="text-center w-full">
                  <p className="text-sm text-gray-600 mb-1">Need help with your order?</p>
                  <div className="flex items-center justify-center space-x-2">
                    <a 
                      href="tel:+919876543210" 
                      className="text-blue-600 hover:underline text-sm font-medium flex items-center"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      +91 98765 43210
                    </a>
                    <span className="text-gray-300">|</span>
                    <a 
                      href="mailto:support@example.com" 
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Email Us
                    </a>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {/* Secure payment info */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your payment information is encrypted and secure. We do not store your credit card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Payment</DialogTitle>
            <DialogDescription className="text-base">
              You're about to pay <span className="font-bold">₹{calculateTotal()}</span> for your ticket.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">
                  {activeTab === 'card' ? 'Credit/Debit Card' : 
                   activeTab === 'upi' ? 'UPI Payment' : 
                   activeTab === 'wallet' ? 'Wallet' : 'Net Banking'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'card' ? `•••• •••• •••• ${formData.cardNumber.slice(-4)}` : 
                   activeTab === 'upi' ? formData.upiId || 'UPI ID not provided' :
                   activeTab === 'wallet' ? `Balance: ₹${formData.walletBalance.toFixed(2)}` : 
                   'You will be redirected to your bank'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ticket Price</span>
                <span>₹{ticket.resellPrice?.toFixed(2) || '0.00'}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">
                    Discount ({discount * 100}%)
                  </span>
                  <span className="text-green-600">
                    -₹{(ticket.resellPrice * discount).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">GST (18%)</span>
                <span>₹{(ticket.resellPrice * 0.18).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmPayment}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm & Pay
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

PaymentPage.propTypes = {
  // No direct props, using route state
};

export default PaymentPage;
