import React from 'react';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CyberButton from './CyberButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface KYCStatusBannerProps {
  className?: string;
}

const KYCStatusBanner: React.FC<KYCStatusBannerProps> = ({ className = '' }) => {
  const { user } = useAuth();

  if (user?.kyc_status === 'approved') return null;

  const getStatusInfo = () => {
    switch (user?.kyc_status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-400" />,
          title: 'KYC Verification Pending',
          message: 'Your identity verification is being reviewed. This usually takes 24–48 hours.',
          bgColor: 'bg-yellow-900 bg-opacity-30',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-300',
          showButton: false,
        };
      case 'declined':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
          title: 'KYC Verification Required',
          message: 'Your previous verification was declined. Please try again with valid documents.',
          bgColor: 'bg-red-900 bg-opacity-30',
          borderColor: 'border-red-500',
          textColor: 'text-red-300',
          showButton: true,
        };
      default:
        return {
          icon: <Shield className="w-5 h-5 text-blue-400" />,
          title: 'Complete Your KYC Verification',
          message: 'Verify your identity to access all investment features and comply with regulations.',
          bgColor: 'bg-blue-900 bg-opacity-30',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-300',
          showButton: true,
        };
    }
  };

  const handleStartKYC = async () => {
    try {
      const response = await fetch(`${API_URL}/api/create-verification-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          email: user?.email,
        }),
      });

      const result = await response.json();

      if (result?.url) {
        const win = window.open(result.url, '_blank', 'noopener,noreferrer');

        if (!win || win.closed || typeof win.closed === 'undefined') {
          // Popup blocked or failed → fallback to redirect in current window
          window.location.href = result.url;
        } else {
          // Monitor the verification window
          const checkClosed = setInterval(() => {
            if (win.closed) {
              clearInterval(checkClosed);
              // Refresh the page to update KYC status
              window.location.reload();
            }
          }, 1000);
          
          // Clear interval after 10 minutes
          setTimeout(() => {
            clearInterval(checkClosed);
          }, 600000);
        }
      } else {
        alert('Failed to start KYC session.');
      }
    } catch (err) {
      console.error('Error during KYC initiation:', err);
      alert('Unable to start KYC verification. Please try again later.');
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {statusInfo.icon}
        <div className="flex-1">
          <h3 className={`font-medium ${statusInfo.textColor} mb-1`}>
            {statusInfo.title}
          </h3>
          <p className="text-sm text-gray-300 mb-3">{statusInfo.message}</p>
          {statusInfo.showButton && (
            <CyberButton onClick={handleStartKYC} className="text-xs py-1 px-3">
              <Shield className="w-3 h-3 mr-1" />
              Start Verification
            </CyberButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCStatusBanner;
