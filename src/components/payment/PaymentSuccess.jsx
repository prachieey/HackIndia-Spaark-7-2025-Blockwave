import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!paymentIntentId || !paymentIntentClientSecret) {
          throw new Error('Missing payment information');
        }

        // Verify the payment with your backend
        const response = await fetch(`/api/v1/payments/verify?payment_intent=${paymentIntentId}`);
        
        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        setPaymentDetails(data);
        setLoading(false);
        
        // Show success message
        toast.success('Payment successful! Your tickets have been confirmed.');
        
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('There was an issue verifying your payment. Please contact support.');
        setLoading(false);
      }
    };

    if (redirectStatus === 'succeeded') {
      verifyPayment();
    } else {
      setLoading(false);
    }
  }, [paymentIntentId, paymentIntentClientSecret, redirectStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
        </div>

        {paymentDetails && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
            <dl className="mt-4 space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Order Number</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {paymentDetails.id}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(paymentDetails.created * 1000).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Amount</dt>
                <dd className="text-sm text-gray-900">
                  ${(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Status</dt>
                <dd className="text-sm font-medium text-green-600">
                  {paymentDetails.status.toUpperCase()}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/my-tickets')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View My Tickets
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900">Need help?</h3>
          <p className="mt-2 text-sm text-gray-500">
            If you have any questions about your order, please contact our support team at{' '}
            <a href="mailto:support@scantyx.com" className="font-medium text-blue-600 hover:text-blue-500">
              support@scantyx.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
