import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Shield, 
  Menu,
  RefreshCw,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Investment {
  id: string;
  amount: number;
  tokenAmount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  transactionId?: string;
}

const MyInvestmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch investments from wallet_transactions table
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data
      const transformedInvestments: Investment[] = (data || []).map(transaction => ({
        id: transaction.id,
        amount: parseFloat(transaction.amount),
        tokenAmount: transaction.amount / 0.050, // Phase 1 rate: 1 DRN = 0.050 €
        date: transaction.created_at,
        status: transaction.status,
        paymentMethod: transaction.token_type === 'EUR' ? 'Credit Card' : 'Cryptocurrency',
        transactionId: transaction.transaction_hash
      }));
      
      setInvestments(transformedInvestments);
      
      // Calculate totals
      const total = transformedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      const tokens = transformedInvestments.reduce((sum, inv) => sum + inv.tokenAmount, 0);
      
      setTotalInvested(total);
      setTotalTokens(tokens);
      
    } catch (err) {
      console.error('Failed to fetch investments:', err);
      setError('Failed to load investment data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleExportData = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Amount (EUR)', 'Tokens', 'Status', 'Payment Method', 'Transaction ID'].join(','),
      ...investments.map(inv => [
        formatDate(inv.date),
        inv.amount,
        inv.tokenAmount.toFixed(0),
        inv.status,
        inv.paymentMethod,
        inv.transactionId || ''
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-investments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stealth flex">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">My Investments</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Investments</h1>
                <p className="text-gray-400">Track your DRONERA investment portfolio</p>
              </div>
              <div className="flex items-center space-x-4">
                <CyberButton onClick={fetchInvestments} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </CyberButton>
                <CyberButton onClick={handleExportData} disabled={investments.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </CyberButton>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Investment Summary */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${user?.kyc_status !== 'approved' ? 'opacity-50 pointer-events-none' : ''}`}>
              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Total Invested</h3>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalInvested)}</p>
                <p className="text-sm text-gray-400">Across {investments.length} investments</p>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">DRONE Tokens</h3>
                  <Shield className="w-5 h-5 text-plasma" />
                </div>
                <p className="text-2xl font-bold text-plasma">{totalTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-sm text-gray-400">Current value: {formatCurrency(totalTokens * 0.050)}</p>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Next Token Phase</h3>
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">Phase 2</p>
                <p className="text-sm text-gray-400">Token price: €0.125</p>
              </HudPanel>
            </div>

            {/* Investment History */}
            <HudPanel className={`p-6 ${user?.kyc_status !== 'approved' ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-xl font-bold mb-6">Investment History</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 text-plasma animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading investment data...</p>
                </div>
              ) : investments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#161620] rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Investments Found</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    You haven't made any investments yet. Start your investment journey with DRONERA today.
                  </p>
                  <CyberButton to="/dashboard" className="mt-4">
                    Start Investing
                  </CyberButton>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Tokens</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment Method</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((investment) => (
                        <tr key={investment.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                          <td className="py-3 px-4">
                            {formatDate(investment.date)}
                          </td>
                          <td className="py-3 px-4 font-medium text-green-400">
                            {formatCurrency(investment.amount)}
                          </td>
                          <td className="py-3 px-4 font-medium text-plasma">
                            {investment.tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              investment.status === 'completed' ? 'bg-green-900 text-green-300' :
                              investment.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {investment.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {investment.paymentMethod}
                          </td>
                          <td className="py-3 px-4">
                            {investment.transactionId ? (
                              <a 
                                href={`https://basescan.org/tx/${investment.transactionId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-plasma hover:underline flex items-center"
                              >
                                <span>View Transaction</span>
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </a>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </HudPanel>

            {/* Investment Strategy */}
            <HudPanel className="p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">Investment Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-plasma mb-3">Token Value Growth</h3>
                  <p className="text-gray-300 mb-4">
                    DRONE tokens increase in value through each investment phase:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <div>
                        <span className="font-medium">Phase 1:</span>
                        <span className="text-gray-300"> €0.050 per token</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <div>
                        <span className="font-medium">Phase 2:</span>
                        <span className="text-gray-300"> €0.125 per token</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <div>
                        <span className="font-medium">Phase 3:</span>
                        <span className="text-gray-300"> €2.850 per token</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-plasma mb-3">Profit Distribution</h3>
                  <p className="text-gray-300 mb-4">
                    As a DRONE token holder, you receive:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span className="text-gray-300">50% of DRONERA's net profits distributed to token holders</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span className="text-gray-300">Quarterly profit distributions</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span className="text-gray-300">Expected IRR of 18-23%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </HudPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInvestmentsPage;