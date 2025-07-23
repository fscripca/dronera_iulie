import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Euro,
  DollarSign,
  Users,
  Target,
  Shield, 
  Zap,
  Network,
  Download,
  Eye,
  X,
  Menu,
  LayoutDashboard,
  Home
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import PaymentModal from '../components/PaymentModal';
import KYCStatusBanner from '../components/KYCStatusBanner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useInterval } from '../hooks/useInterval';
import { kycService } from '../lib/kycService';

// Initialize Stripe outside component to avoid re-creating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface JVAgreement {
  id: string;
  title: string;
  partnerName: string;
  agreementType: string;
  status: string;
  startDate: string;
  endDate: string;
  value: number;
  documentUrl: string;
  publishedDate: string;
  version: number;
}

const DashboardPage: React.FC = () => {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate(); 
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wire');
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'unverified'>('unverified');
  const [buyedTokens, setBuyedTokens] = useState<number>(0);
  const [kycVerificationWindow, setKycVerificationWindow] = useState<Window | null>(null);
  const [isKycInProgress, setIsKycInProgress] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [jvAgreements, setJvAgreements] = useState<JVAgreement[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<JVAgreement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [kycSessionId, setKycSessionId] = useState<string | null>(null);
  const [kycCheckInterval, setKycCheckInterval] = useState<number | null>(null);

  const isDevelopment = import.meta.env.DEV;

  useInterval(() => {
    if (kycSessionId && kycStatus !== 'verified') {
      checkKYCStatus();
    }
  }, kycCheckInterval);

  useEffect(() => {
    if (user && !loading) {
      setIsAuthenticated(true);
      setEmail(user.email || '');
      if (user.email === 'florin@dronera.eu') {
        setKycStatus('verified');
      } else {
        setKycStatus('unverified');
      }
      loadJVAgreements();
    } else {
      setIsAuthenticated(false);
    }
  }, [user, loading]);

  useEffect(() => {
    const amount = parseFloat(investmentAmount);
    setBuyedTokens(isNaN(amount) || amount <= 0 ? 0 : amount / 0.050);
  }, [investmentAmount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-plasma mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return <Navigate to="/" />;
  }

  const loadJVAgreements = () => {
    const mockAgreement: JVAgreement = {
      id: 'jv-001',
      title: 'Join-Venture Agreement - Dronera',
      partnerName: 'European Aerospace Research Institute',
      agreementType: 'Partnership',
      status: 'Active',
      startDate: '2025-01-15T00:00:00Z',
      endDate: '2027-01-15T00:00:00Z',
      value: 50,
      documentUrl: '/pdfs/Joint_Venture.pdf',
      publishedDate: '2025-01-12T09:30:00Z',
      version: 1
    };
    
    setJvAgreements([mockAgreement]);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setEmail('');
      setPassword('');
      setAuthError('');
      setInvestmentAmount('');
      setKycStatus('unverified');
      setJvAgreements([]);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        const result = await signIn(email, password);
        if (result && result.user && !result.user.email?.includes('admin')) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startKYCVerification = async () => {
    if (!user?.email || !user?.id) {
      setAuthError('User ID and Email are required for KYC verification');
      return;
    }

    setIsCreatingSession(true);
    setAuthError('');

    try {
      const response = await fetch('https://dronera.onrender.com/api/create-verification-session', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email
        }),
      });

      const { url } = await response.json();
      
      // Open Stripe Identity verification in a new tab
      const verificationWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      // Check if popup was blocked
      if (!verificationWindow || verificationWindow.closed || typeof verificationWindow.closed === 'undefined') {
        // Fallback: redirect in current window if popup is blocked
        window.location.href = url;
      } else {
        // Optional: Monitor the verification window
        const checkClosed = setInterval(() => {
          if (verificationWindow.closed) {
            clearInterval(checkClosed);
            // Optionally refresh the page or check KYC status
            window.location.reload();
          }
        }, 1000);
        
        // Clear interval after 10 minutes to prevent memory leaks
        setTimeout(() => {
          clearInterval(checkClosed);
        }, 600000);
      }
    } catch (error: any) {
      console.error('Error starting KYC verification:', error);
      setAuthError(`Failed to start KYC verification: ${error.message}`);
      alert('Failed to start KYC verification. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleKYCWindowClosed = async (verificationCompleted: boolean) => {
    setIsKycInProgress(false);
    setKycVerificationWindow(null);
    
    if (!verificationCompleted) {
      if (kycStatus === 'unverified') {
        setKycStatus('pending');
      }

      try {
        const response = await fetch('/api/kyc/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user?.getIdToken()}`
          },
          body: JSON.stringify({
            email: user?.email,
            sessionId: 'e902badd-bd46-4b0a-a17d-8d3c004ce8ed'
          })
        });

        const data = await response.json();

        if (data.status === 'success' && data.kycStatus) {
          setKycStatus(data.kycStatus === 'approved' ? 'verified' : data.kycStatus === 'pending' ? 'pending' : 'unverified');
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
      }
    }
  };

  const handleKYCSuccess = async (result: any) => {
    setIsKycInProgress(false);
    setKycVerificationWindow(null);
    
    try {
      const response = await fetch('/api/kyc/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          sessionId: 'e902badd-bd46-4b0a-a17d-8d3c004ce8ed',
          status: 'approved',
          verificationData: result
        })
      });

      if (response.ok) {
        setKycStatus('verified');
      } else {
        throw new Error('Failed to update KYC status');
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      setAuthError('KYC verification completed but failed to update status. Please contact support.');
    }
  };

  const handleKYCFailure = (error: any) => {
    setIsKycInProgress(false);
    setKycVerificationWindow(null);
    setKycStatus('unverified');
    setAuthError(`KYC verification failed: ${error.message || 'Unknown error'}`);
  };

  const checkKYCStatus = async () => {
    if (!user?.email) return;
    if (!kycSessionId && kycStatus !== 'pending') return;

    try {
      if (isDevelopment) {
        console.info('Development mode: Simulating KYC status check');
        return;
      }

      try {
        const statusData = await kycService.checkStatus(kycSessionId, user.email);

        if (statusData.status === 'success') {
          const newStatus = statusData.kycStatus === 'approved' ? 'verified' : 
                            statusData.kycStatus === 'pending' ? 'pending' : 'unverified';

          setKycStatus(newStatus);

          if (newStatus === 'verified') {
            setKycCheckInterval(null);
          }
        }
      } catch (serviceError) {
        console.warn('KYC status check failed:', serviceError);

        if (isDevelopment && kycStatus === 'pending') {
          setTimeout(() => {
            setKycStatus('verified');
            setKycCheckInterval(null);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);

      if (isDevelopment && kycStatus === 'pending') {
        setTimeout(() => {
          setKycStatus('verified');
          setKycCheckInterval(null);
        }, 5000);
      }
    }
  };

  const continueKYCVerification = () => {
    startKYCVerification();
  };

  const viewAgreement = (agreement: JVAgreement) => {
    window.open(agreement.documentUrl, '_blank');
  };

  const downloadAgreement = (agreement: JVAgreement) => {
    const link = document.createElement('a');
    link.href = agreement.documentUrl;
    link.download = `${agreement.title.replace(/\s+/g, '_')}_v${agreement.version}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-stealth flex">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <img src="/Stripe_Emb_transp.png" alt="DRONE Token" className="w-6 h-6" />
            <span className="font-bold text-white">Dashboard</span>
          </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            {/* KYC Banner */}
            {user?.kyc_status !== 'approved' && (
              <div className="mb-8">
                <HudPanel className="p-8 text-center">
                  <div className="max-w-2xl mx-auto">
                    <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4 text-red-400">KYC Verification Required</h2>
                    <p className="text-gray-300 mb-6">
                      To comply with financial regulations and protect our platform, you must complete 
                      identity verification before accessing investment features.
                    </p>
                    <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                        <div className="text-left">
                          <h3 className="font-medium text-yellow-300 mb-1">What you'll need:</h3>
                          <ul className="text-sm text-yellow-200 space-y-1">
                            <li>• Government-issued photo ID (passport, driver's license, or national ID)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <CyberButton onClick={startKYCVerification} className="mx-auto">
                      <Shield className="w-5 h-5 mr-2" />
                      {isCreatingSession ? 'Creating Session...' : 'Start KYC Verification'}
                    </CyberButton>
                    <p className="text-sm text-gray-400 mt-4">
                      Your personal information is encrypted and secure.
                    </p>
                  </div>
                </HudPanel>
              </div>
            )}

            {/* Investment Section */}
            <section className="w-full h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Euro className="text-plasma mr-3 w-7 h-7" />
                Make an Investment
              </h2>
              <HudPanel className="p-6 flex-grow">
                <div className="mb-4 text-sm">
                  <div className="text-plasma font-medium leading-tight">Phase 1: 1 DRN = 0,050 €</div>
                  <div className="text-gray-500 leading-tight">Phase 2: 1 DRN = 0,125 €</div>
                  <div className="text-gray-500 leading-tight">Phase 3: 1 DRN = 2,85 €</div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-300 mb-2">
                        Investment Amount (EUR)
                      </label>
                      <input
                        type="number"
                        id="payment-amount"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md"
                        placeholder="Minimum €50"
                        min="50"
                        step="50"
                      />
                    </div>
                    <div>
                      <label htmlFor="buyed-tokens" className="block text-sm font-medium text-gray-300 mb-2">
                        Buy Tokens (DRN)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="buyed-tokens"
                          value={buyedTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          readOnly
                          className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <img src="/images/Stripe_Emb_transp.png" alt="DRN Token Icon" className="w-12 h-12" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <CyberButton
                      onClick={() => {
                        setPaymentMethod('card');
                        setShowPaymentModal(true);
                      }}
                      className="flex-1"
                      disabled={!investmentAmount || parseInt(investmentAmount) < 50}
                    >
                      <Euro className="w-4 h-4 mr-2" /> Pay with Stripe
                    </CyberButton>

                    <CyberButton
                      onClick={() => {
                        setPaymentMethod('crypto');
                        setShowPaymentModal(true);
                      }}
                      className="flex-1"
                      disabled={!investmentAmount || parseInt(investmentAmount) < 50}
                    >
                      <Euro className="w-4 h-4 mr-2" /> Pay with Crypto
                    </CyberButton>
                  </div>

                  {paymentSuccess && (
                    <div className="mt-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <div>
                          <h4 className="font-bold text-green-300">Payment Successful!</h4>
                          <p className="text-sm text-green-200">Your investment has been processed successfully.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </HudPanel>
            </section>

            {/* JV Agreement Section */}
            <section className="w-full h-full flex flex-col mt-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FileText className="text-plasma mr-3 w-6 h-6" />
                Joint Venture Agreement 
              </h2>
              <HudPanel className="p-6 flex-grow">
                {jvAgreements.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No agreements available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jvAgreements.map(agreement => (
                      <div key={agreement.id} className="bg-[#0d0d14] p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold">{agreement.title}</h3>
                            <p className="text-sm text-gray-400">Partner: {agreement.partnerName}</p>
                          </div>
                          <div className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                            {agreement.status.toUpperCase()}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-400">Type</p>
                            <p>{agreement.agreementType}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Value</p>
                            <p className="text-plasma">50%</p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <CyberButton className="text-xs py-1 px-3 flex-1" onClick={() => viewAgreement(agreement)}>
                            <Eye className="w-3 h-3 mr-1" /> View
                          </CyberButton>
                          <CyberButton className="text-xs py-1 px-3 flex-1" onClick={() => downloadAgreement(agreement)}>
                            <Download className="w-3 h-3 mr-1" /> Download
                          </CyberButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </HudPanel>
            </section>

            {/* Portfolio Section */}
            <section className={`mt-10 ${user?.kyc_status !== 'approved' ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="text-plasma mr-3 w-6 h-6" />
                Portfolio Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HudPanel className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider">DRONE Tokens</h3>
                    <img src="/images/Stripe_Emb_transp.png" alt="DRONE Token" className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-plasma">0</p>
                  <p className="text-sm text-gray-400">€0,00</p>
                </HudPanel>

                <HudPanel className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider">Expected IRR</h3>
                    <TrendingUp className="w-5 h-5 text-plasma" />
                  </div>
                  <p className="text-2xl font-bold text-plasma">18-23%</p>
                  <p className="text-sm text-gray-400">Annual Return</p>
                </HudPanel>

                <HudPanel className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider">Next Distribution</h3>
                    <DollarSign className="w-5 h-5 text-plasma" />
                  </div>
                  <p className="text-2xl font-bold text-plasma">Q4 2028</p>
                  <p className="text-sm text-gray-400">Estimated</p>
                </HudPanel>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

