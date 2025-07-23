import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import HudPanel from './HudPanel';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CryptoPaymentForm from './CryptoPaymentForm';
import LocalPaymentForm from './LocalPaymentForm';
import CyberButton from './CyberButton';
import { supabase } from '../lib/supabase';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: (transactionHash: string) => void;
  paymentMethod: string;
  kycStatus?: 'verified' | 'pending' | 'unverified';
  onStartKYC?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSuccess, 
  paymentMethod,
  kycStatus = 'unverified',
  onStartKYC = () => {}
}) => {
  console.log('PaymentModal rendered with props:', { isOpen, amount, paymentMethod });
  
  // All hooks must be called before any conditional returns
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessingInvestment, setIsProcessingInvestment] = useState(false);
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);

  // Conditional return must come after all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <HudPanel className="max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Complete Your Investment</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            disabled={isRedirectingToStripe}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Investment Amount:</span>
            <span className="font-bold">€{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-400">DRONE Tokens:</span>
            <span className="font-bold text-plasma">{Math.floor(amount / 0.050).toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-4">
          {paymentMethod === 'crypto' ? (
            <CryptoPaymentForm
              amount={amount}
              kycStatus={kycStatus}
              onStartKYC={onStartKYC}
              onSuccess={onPaymentSuccess}
              onError={(err) => setPaymentError(err)}
            />
          ) : paymentMethod === 'card' ? (
            <Elements stripe={stripePromise}>
              <LocalPaymentForm
                amount={amount}
                onSuccess={onPaymentSuccess}
                onCancel={onClose}
              />
            </Elements>
          ) : null}
        </div>

        {paymentError && (
          <div className="mt-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-300">{paymentError}</p>
            </div>
          </div>
        )}

        {isProcessingInvestment && (
          <div className="mt-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin text-blue-400" />
              <p className="text-sm text-blue-300">Processing your investment...</p>
            </div>
          </div>
        )}
      </HudPanel>
    </div>
  );
};

export default PaymentModal;