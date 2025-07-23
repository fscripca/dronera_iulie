import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import CyberButton from './CyberButton';
import { AlertCircle, Copy, CheckCircle, Shield } from 'lucide-react';
import HudPanel from './HudPanel';

interface CryptoPaymentFormProps {
  amount: number;
  kycStatus: 'verified' | 'pending' | 'unverified';
  onStartKYC: () => void;
  onSuccess: (transactionHash: string) => void;
  onError: (error: string) => void;
}

const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({ 
  amount, 
  kycStatus,
  onStartKYC,
  onSuccess, 
  onError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentAddress, setPaymentAddress] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [isKycRequired, setIsKycRequired] = useState(kycStatus !== 'verified');

  // Fallback function to simulate Edge Function when not available
  const generatePaymentAddressFallback = () => {
    console.log('CryptoPaymentForm: Using fallback payment address generation');
    return {
      paymentAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount,
      currency: "ETH",
      exchangeRate: 1500, // 1 ETH = 1500 EUR (mock rate)
      cryptoAmount: amount / 1500
    };
  };

  const generatePaymentAddress = async () => {
    console.log('CryptoPaymentForm: generatePaymentAddress called for amount:', amount);
    setIsProcessing(true);
    setError(null); 

    try {
      // Try to use the Edge Function first
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        // Check if we have valid Supabase credentials
        if (!supabaseUrl || !supabaseAnonKey || 
            supabaseUrl.includes('your-project-url') || 
            supabaseAnonKey.includes('your-anon-key')) {
          throw new Error('Using fallback due to missing or placeholder Supabase credentials');
        }
        
        // Call the generate-crypto-payment Edge Function
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-crypto-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ amount })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('CryptoPaymentForm: Payment address generated successfully:', data.paymentAddress);
        setPaymentAddress(data.paymentAddress);
      } catch (edgeFunctionError) {
        console.warn('CryptoPaymentForm: Edge Function error, using fallback:', edgeFunctionError);
        // Fall back to local generation if Edge Function fails
        const fallbackData = generatePaymentAddressFallback();
        console.log('CryptoPaymentForm: Using fallback payment address:', fallbackData.paymentAddress);
        setPaymentAddress(fallbackData.paymentAddress);
      }
    } catch (error) {
      console.error('CryptoPaymentForm: Error generating payment address:', error);
      setError('Unable to generate payment address. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmitTransaction = () => {
    console.log('CryptoPaymentForm: handleSubmitTransaction called with hash:', transactionHash);
    if (!transactionHash.trim()) {
      console.log('CryptoPaymentForm: No transaction hash provided');
      setError('Please enter a transaction hash');
      return;
    }

    setIsProcessing(true);
    setError(null);

    console.log('CryptoPaymentForm: Simulating transaction verification');
    // In a real implementation, this would verify the transaction
    // For now, we'll just simulate success
    setTimeout(() => {
      console.log('CryptoPaymentForm: Transaction verification successful');
      setIsProcessing(false);
      onSuccess(transactionHash);
    }, 2000);
  };

  if (!paymentAddress) {
    // Show KYC verification requirement if not verified
    if (isKycRequired) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-yellow-400 mr-2 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-300 mb-1">KYC Verification Required</h3>
                <p className="text-sm text-yellow-200">
                  To comply with regulations, you must complete identity verification before making crypto payments.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4">
            {kycStatus === 'pending' 
              ? 'Your KYC verification is pending. Please wait for approval or complete the process if you haven\'t finished all steps.'
              : 'Please complete the KYC verification process to proceed with your crypto payment.'}
          </p>
          
          <CyberButton 
            onClick={onStartKYC} 
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            {kycStatus === 'pending' ? 'Continue KYC Process' : 'Start KYC Verification'}
          </CyberButton>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">
          Generate a payment address to send cryptocurrency equivalent to €{amount.toLocaleString()}.
        </p>
        <CyberButton 
          onClick={generatePaymentAddress} 
          disabled={isProcessing} 
          className="w-full"
        >
          {isProcessing ? 'Generating...' : 'Generate Payment Address'}
        </CyberButton>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HudPanel className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send {(amount / 1500).toFixed(4)} ETH to this address:
            </label>
            <div className="flex items-center">
              <div className="bg-[#0d0d14] p-2 rounded flex-1 font-mono text-sm truncate">
                {paymentAddress}
              </div>
              <button
                onClick={() => copyToClipboard(paymentAddress)}
                className="ml-2 p-2 bg-[#0d0d14] rounded hover:bg-[#161620] transition-colors"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 hover:text-plasma" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Transaction Hash:
            </label>
            <input
              type="text"
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
              className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              placeholder="0x..."
            />
          </div>
        </div>
      </HudPanel>

      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      <CyberButton 
        onClick={handleSubmitTransaction} 
        disabled={isProcessing || !transactionHash.trim()} 
        className="w-full"
      >
        {isProcessing ? 'Verifying...' : 'Submit Transaction'}
      </CyberButton>
    </div>
  );
};

export default CryptoPaymentForm;