import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const { ticket, transactionId } = location.state || {};

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">Your ticket has been successfully purchased.</p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            {ticket && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium text-gray-900">{ticket.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Type:</span>
                  <span className="font-medium text-gray-900">{ticket.ticketType}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-900">{transactionId || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>Total Paid:</span>
              <span className="text-green-600">₹{ticket?.resellPrice?.toLocaleString() || '0'}</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/my-tickets">View My Tickets</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
