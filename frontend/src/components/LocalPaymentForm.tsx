import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CyberButton from './CyberButton';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import './StripeStyles.css';

interface LocalPaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

const LocalPaymentForm: React.FC<LocalPaymentFormProps> = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      postal_code: '',
      country: ''
    }
  });

  // Create payment intent when component mounts
  React.useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          throw new Error('Supabase URL not configured');
        }

        console.log('Creating payment intent for amount:', amount);
        const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log('Payment intent created:', data);
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCustomerInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setCustomerInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Validate customer information
      if (!customerInfo.name || !customerInfo.email || !customerInfo.address.line1 || 
          !customerInfo.address.city || !customerInfo.address.postal_code || !customerInfo.address.country) {
        throw new Error('Please fill in all required fields');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              line1: customerInfo.address.line1,
              city: customerInfo.address.city,
              postal_code: customerInfo.address.postal_code,
              country: customerInfo.address.country
            }
          }
        }
      });

      if (error) {
        throw error;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment failed or was canceled');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Payment failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <Lock className="w-12 h-12 text-plasma mx-auto mb-2" />
        <h3 className="text-xl font-bold text-white">Secure Payment</h3>
        <p className="text-gray-400">Complete your investment of €{amount.toLocaleString()}</p>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-plasma">Customer Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              name="address.line1"
              value={customerInfo.address.line1}
              onChange={handleInputChange}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              placeholder="123 Main St"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                name="address.city"
                value={customerInfo.address.city}
                onChange={handleInputChange}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="New York"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                name="address.postal_code"
                value={customerInfo.address.postal_code}
                onChange={handleInputChange}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="10001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="address.country"
                value={customerInfo.address.country}
                onChange={handleInputChange}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="US"
                required
              />
            </div>
          </div>
        </div>

        {/* Card Details */}
        <div>
          <h4 className="font-medium text-plasma mb-2">Card Details</h4>
          <div className="bg-[#0d0d14] border border-gray-700 rounded-lg p-4 stripe-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#aab7c4'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <CyberButton
            type="button"
            variant="red"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </CyberButton>
          
          <CyberButton
            type="submit"
            disabled={!stripe || !clientSecret || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay €${amount.toLocaleString()}`}
          </CyberButton>
        </div>
      </form>
      
      <div className="text-center text-xs text-gray-500 mt-4">
        <p>You'll receive a confirmation email once your payment is processed.</p>
      </div>
    </div>
  );
};

export default LocalPaymentForm;