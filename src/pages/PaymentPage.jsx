import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  
  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/payment-success', { 
        state: { 
          ticket: location.state?.ticket,
          transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
        } 
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5 mr-2 text-gray-700" /> },
    { id: 'upi', label: 'UPI Payment', icon: <Smartphone className="h-5 w-5 mr-2 text-gray-700" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5 mr-2 text-gray-700" /> }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Complete Your Purchase</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer ${selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 ${selectedMethod === method.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                      {selectedMethod === method.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    {method.icon}
                    <span className="text-gray-900">{method.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handlePayment} className="mt-6 space-y-4">
              {selectedMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-900 mb-1">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardName" className="block text-sm font-medium text-gray-900 mb-1">
                      Name on Card
                    </Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="block text-sm font-medium text-gray-900 mb-1">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cvv" className="block text-sm font-medium text-gray-900 mb-1">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        className="text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {selectedMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Enter your UPI ID to complete the payment.</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="upiId" className="block text-sm font-medium text-gray-900 mb-1">
                      UPI ID
                    </Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@upi"
                      className="text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
              
              {selectedMethod === 'wallet' && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">Wallet balance: ₹0</p>
                  <p className="text-xs text-yellow-600 mt-1">Please add money to your wallet to proceed.</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
