import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import HudPanel from '../components/HudPanel';
import TokenMetrics from '../components/TokenMetrics';
import WalletActions from '../components/WalletActions';
import TransactionHistory from '../components/TransactionHistory';
import { TrendingUp, Wallet, Calendar, Shield, DollarSign, Activity } from 'lucide-react';

interface WalletStats {
  tokenBalance: number;
  totalInvested: number;
  totalReceived: number;
  isWalletLinked: boolean;
}

interface ProfitMetrics {
  nextDistribution: string;
  expectedAmount: number;
  lastDistribution: string;
  totalDistributed: number;
}

const InvestmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [walletStats, setWalletStats] = useState<WalletStats>({
    tokenBalance: 0,
    totalInvested: 0,
    totalReceived: 0,
    isWalletLinked: false
  });
  const [profitMetrics, setProfitMetrics] = useState<ProfitMetrics>({
    nextDistribution: 'TBD',
    expectedAmount: 0,
    lastDistribution: 'None',
    totalDistributed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletStats = async (silent = false) => {
    try {
      if (!user) return;

      if (!silent) setLoading(true);
      setError(null);

      // Fetch user profile data including wallet address and token balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_address, token_balance, investment_amount')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch profile data');
      }

      const walletStatsData: WalletStats = {
        tokenBalance: profileData?.token_balance || 0,
        totalInvested: profileData?.investment_amount || 0,
        totalReceived: 0.00,
        isWalletLinked: !!profileData?.wallet_address
      };

      // Log the token balance for debugging
      console.log('Token balance from profile:', walletStatsData.tokenBalance);

      setWalletStats(walletStatsData);
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error);
      if (!silent) {
        setError('Failed to load wallet data. Please try again.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchProfitMetrics = async () => {
    try {
      // Fetch next distribution
      const { data: nextDist } = await supabase
        .from('profit_distributions')
        .select('distribution_date, amount')
        .eq('status', 'scheduled') 
        .order('distribution_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Fetch last distribution
      const { data: lastDist } = await supabase
        .from('profit_distributions')
        .select('distribution_date, amount')
        .eq('status', 'completed') 
        .order('distribution_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch total distributed
      const { data: totalDist } = await supabase
        .from('profit_distributions')
        .select('amount')
        .eq('status', 'completed');

      const totalDistributed = totalDist?.reduce((sum, dist) => sum + Number(dist.amount), 0) || 0;

      setProfitMetrics({
        nextDistribution: nextDist ? new Date(nextDist.distribution_date).toLocaleDateString() : 'TBD',
        expectedAmount: nextDist ? Number(nextDist.amount) : 0,
        lastDistribution: lastDist ? new Date(lastDist.distribution_date).toLocaleDateString() : 'None',
        totalDistributed
      });
    } catch (error) {
      console.error('Failed to fetch profit metrics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWalletStats();
      fetchProfitMetrics();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <span className="text-cyan-400">Loading investment data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              onClick={() => fetchWalletStats()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Investment Dashboard</h1>
            <p className="text-gray-400">Monitor your DRONE token investments and profit distributions</p>
          </div>

          {/* Portfolio Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Portfolio Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HudPanel
                title="DRONE TOKENS"
                icon={
                  <img 
                    src="/DRN_Emb_transp.png" 
                    alt="DRONE Token" 
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                }
                className="border-cyan-500/30"
              >
                <div className="text-2xl font-bold text-cyan-400">
                  {walletStats.tokenBalance > 0 ? walletStats.tokenBalance.toLocaleString() : '-'}
                </div>
                <div className="text-sm text-gray-400">
                  {walletStats.tokenBalance > 0 
                    ? `€${(walletStats.tokenBalance * 0.050).toFixed(2)}`
                    : '-'
                  }
                </div>
              </HudPanel>

              <HudPanel
                title="TOTAL INVESTED"
                icon={<DollarSign className="text-green-400" size={20} />}
                className="border-green-500/30"
              >
                <div className="text-2xl font-bold text-green-400">
                  €{walletStats.totalInvested.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Fiat Investment</div>
              </HudPanel>

              <HudPanel
                title="EXPECTED IRR"
                icon={<Activity className="text-purple-400" size={20} />}
                className="border-purple-500/30"
              >
                <div className="text-2xl font-bold text-purple-400">12-15%</div>
                <div className="text-sm text-gray-400">Annual Return</div>
              </HudPanel>

              <HudPanel
                title="NEXT DISTRIBUTION"
                icon={<Calendar className="text-yellow-400" size={20} />}
                className="border-yellow-500/30"
              >
                <div className="text-2xl font-bold text-yellow-400">
                  {profitMetrics.nextDistribution}
                </div>
                <div className="text-sm text-gray-400">
                  €{profitMetrics.expectedAmount.toFixed(2)} expected
                </div>
              </HudPanel>
            </div>
          </div>

          {/* Token Metrics and Wallet Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <TokenMetrics />
            <WalletActions onStatsUpdate={() => fetchWalletStats(true)} />
          </div>

          {/* Transaction History */}
          <TransactionHistory />
        </div>
      </div>
    </Layout>
  );
};

export default InvestmentsPage;