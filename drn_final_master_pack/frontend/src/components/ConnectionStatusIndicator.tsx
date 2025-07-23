import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { testSupabaseConnection, getConnectionStatus } from '../lib/supabase';
import CyberButton from './CyberButton';

interface ConnectionStatusIndicatorProps {
  onStatusChange?: (status: 'connected' | 'error' | 'checking') => void;
  showDetails?: boolean;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  onStatusChange,
  showDetails = false,
  className = ''
}) => {
  const [status, setStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [details, setDetails] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    setStatus('checking');
    
    try {
      const result = await testSupabaseConnection();
      setStatus(result.status);
      setDetails(result.message);
      
      if (onStatusChange) {
        onStatusChange(result.status);
      }
    } catch (error) {
      setStatus('error');
      setDetails(error instanceof Error ? error.message : 'Unknown error');
      
      if (onStatusChange) {
        onStatusChange('error');
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {status === 'connected' ? (
        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
      ) : status === 'error' ? (
        <XCircle className="w-4 h-4 text-red-400 mr-2" />
      ) : (
        <Database className="w-4 h-4 text-yellow-400 mr-2" />
      )}
      
      <span className={`text-sm ${
        status === 'connected' ? 'text-green-400' : 
        status === 'error' ? 'text-red-400' : 'text-yellow-400'
      }`}>
        {status === 'connected' ? 'Connected' : 
         status === 'error' ? 'Connection Error' : 'Checking...'}
      </span>
      
      {showDetails && details && (
        <span className="text-xs text-gray-400 ml-2">({details})</span>
      )}
      
      <CyberButton
        onClick={checkConnection}
        className="text-xs py-1 px-2 ml-2"
        disabled={isChecking}
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Checking...' : 'Test'}
      </CyberButton>
    </div>
  );
};

export default ConnectionStatusIndicator;