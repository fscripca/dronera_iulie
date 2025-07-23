import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const KycCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshSession } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing your verification...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get session ID from URL parameters (Stripe appends this)
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setStatus('failed');
          setMessage('No verification session found. Please try again.');
          return;
        }

        console.log('Processing KYC callback for session:', sessionId);

        // Update user's verification session ID in database
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              verification_session_id: sessionId,
              kyc_status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (error) {
            console.error('Error updating verification session ID:', error);
          }
        }

        // Set pending status - webhook will update to final status
        setStatus('pending');
        setMessage('Your identity documents have been submitted successfully. We\'re processing your verification and will notify you once complete.');

        // Refresh user session to get updated KYC status
        setTimeout(() => {
          refreshSession();
        }, 2000);

      } catch (error) {
        console.error('Error processing KYC callback:', error);
        setStatus('failed');
        setMessage('An error occurred while processing your verification. Please contact support.');
      }
    };

    handleCallback();
  }, [searchParams, user, refreshSession]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Clock className="w-16 h-16 text-plasma animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-16 h-16 text-red-400" />;
      default:
        return <Clock className="w-16 h-16 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-plasma';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing Verification...';
      case 'success':
        return 'Verification Complete!';
      case 'pending':
        return 'Documents Submitted';
      case 'failed':
        return 'Verification Failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-stealth flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <HudPanel className="p-8 text-center">
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
            {getTitle()}
          </h1>
          
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            {message}
          </p>

          {status === 'pending' && (
            <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400 mr-2" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-300 mb-1">What happens next?</h3>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Our team will review your documents</li>
                    <li>• You'll receive an email notification when complete</li>
                    <li>• Processing typically takes a few minutes to a few hours</li>
                    <li>• Your dashboard will be unlocked once approved</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <div className="text-left">
                  <h3 className="font-medium text-green-300 mb-1">Investor Status Activated!</h3>
                  <p className="text-sm text-green-200">
                    Your account has been verified and you now have full access to all investment features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <div className="text-left">
                  <h3 className="font-medium text-red-300 mb-1">Verification Issue</h3>
                  <p className="text-sm text-red-200">
                    There was an issue with your verification. Please contact support or try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CyberButton
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </CyberButton>
            
            {status === 'failed' && (
              <CyberButton
                onClick={() => navigate('/help')}
                variant="red"
                className="flex items-center justify-center"
              >
                Contact Support
              </CyberButton>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Verification powered by Stripe Identity - Your data is secure and encrypted
            </p>
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default KycCallbackPage;