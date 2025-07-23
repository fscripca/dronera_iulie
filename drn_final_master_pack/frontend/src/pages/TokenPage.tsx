import React from 'react';
import { useState, useEffect } from 'react';
import { PieChart, BarChart, Wallet, FileText, Shield, ArrowRight, Target, Rocket } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import TokenMetrics from '../components/TokenMetrics';
import { supabase } from '../lib/supabase';

const TokenPage: React.FC = () => {
  const [tokenMetricsData, setTokenMetricsData] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchTokenMetrics = async () => {
    setIsLoadingMetrics(true);
    setMetricsError(null);
    try {
      const { data, error } = await supabase.rpc('get_token_metrics');
      if (error) {
        console.error('RPC Error:', error);
        // If the function doesn't exist, use fallback data
        if (error.message?.includes('function get_token_metrics() does not exist')) {
          setTokenMetricsData({
            total_supply: 100000000, 
            total_distributed: 0,
            holders_count: 0
          });
        } else {
          throw error;
        }
      } else {
        setTokenMetricsData(data);
      }
    } catch (error: any) {
      console.error('Error fetching token metrics:', error.message);
      // Use fallback data instead of showing error
      setTokenMetricsData({ 
        total_supply: 100000000,
        total_distributed: 0,
        holders_count: 0
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchTokenMetrics();
  }, []);

  return (
    <div className="pt-20 pb-12 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 mt-4">
            <img 
              src="/images/Stripe_Emb_transp.png" 
              alt="DRONE Token" 
              className="w-24 h-24 inline-block mr-2" 
            />
            DRONE DRN <img 
              src="/images/DRN_Emb_transp.png" 
              alt="DRN Token" 
              className="w-24 h-24 inline-block mx-2" 
            /> <span className="text-plasma">Token</span>
          </h1>
          <p className="text-xl text-gray-300">
            The token is the digital representation of a Joint Venture Agreement, which gives the right to obtain a profit of 50% of the benefits obtained from the partnership, in relation to the participation share, audited quarterly, governed via DAO and issued under EU-compliant frameworks.
          </p>
        </div>

        {/* Token Metrics */}
        <div className="mb-12">
          {isLoadingMetrics ? (
            <HudPanel className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
              <p className="text-gray-400">Loading token metrics...</p>
            </HudPanel>
          ) : metricsError ? (
            <HudPanel className="p-6 text-center">
              <p className="text-red-400">{metricsError}</p>
            </HudPanel>
          ) : (
            <TokenMetrics
              raisedAmount={tokenMetricsData?.total_distributed || 0}
              targetAmount={tokenMetricsData?.total_supply || 100000000}
              expectedIRR="18–23%"
              holders={0}
            />
          )}
        </div>

        {/* Token Economics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <PieChart className="text-plasma mr-3 w-7 h-7" />
              Tokenomics
            </h2>
            <HudPanel className="p-6">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-plasma mb-4">Token Allocation</h3>
                <div className="h-[310px] w-full bg-[#0d0d14] rounded-lg p-4 flex items-center justify-center">
                  {/* Placeholder for Pie Chart */}
                  <div className="relative w-50 h-50">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#0d0d14" 
                        strokeWidth="20"
                      />
                      
                      {/* Private Sale segment - 14.67% (Blue) */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#ff0033" /* ion red */
                        strokeWidth="20" 
                        strokeDasharray={`${14.67 * 2.51} ${85.33 * 2.51}`} 
                        strokeDashoffset="0" 
                      />
                      {/* Reserve segment - 85.33% (Red) */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                         stroke="#00ccff" 
                        strokeWidth="20" 
                        strokeDasharray={`${85.33 * 2.51} ${14.67 * 2.51}`} 
                        strokeDashoffset={`-${14.67 * 2.51}`} /* Offset by the length of the first segment */
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-plasma text-2xl font-bold">100M</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-plasma rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">Private Sale</p>
                    <p className="font-bold text-plasma">85.33%</p> 
                  </div>
                   
                  <div className="text-center">
                    <div className="w-4 h-4 bg-ion rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">Reserve</p>
                    <p className="text-gray-300 font-bold">14.67%</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-plasma mb-4">Key Facts</h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">ERC3643 Security Token Standard</p>
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">50% of all DRONERA net benefits distributed to token holders</p>
                  </li>
                 
                  <li className="flex items-start mb-4">
                    <Shield className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">Compliance verification for all investors</p>
                  </li>
                   
                </ul>
              </div>
            </HudPanel>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Rocket className="text-plasma mr-3 w-7 h-7" />
              Private Sale Milestones
            </h2>
            
            <div className="space-y-3">
              <HudPanel className="p-4">
                <div className="flex items-center mb-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0d0d14] text-plasma border border-plasma mr-3">
                    <span className="text-1xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-1xl font-bold">Phase 1 (MVP)</h3>
                    <p className="text-plasma mono text-sm font-bold">€1,000,000</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-300 pl-11">
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Full Q-OS kernel v0.1 and federated node</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">SwarmOS virtual mission</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Hardware-in-the-loop (HiL) setup for Phase 2</p>
                  </div>
                            
                </div>
              </HudPanel>
              
              <HudPanel className="p-4">
                <div className="flex items-center mb-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0d0d14] text-plasma border border-plasma mr-3">
                    <span className="text-1xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-1xl font-bold">Phase 2</h3>
                    <p className="text-plasma mono text-sm font-bold ">€4,000,000</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-300 pl-11">
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Swarm flight demo, TRL 6 prototype</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Hardware DevKit V1</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">EDF/NATO submission-ready tech pack</p>
                  </div>
                </div>
              </HudPanel>
              
              <HudPanel className="p-4">
                <div className="flex items-center mb-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0d0d14] text-plasma border border-plasma mr-3">
                    <span className="text-1xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-1xl font-bold">Phase 3</h3>
                    <p className="text-plasma mono text-sm font-bold">€95,000,000</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-300 pl-11">
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Validated H-L.E.V. hypersonic strike system</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">TRL 8 deployment pack for defense partners</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Strategic licensing blueprint</p>
                  </div>
                  <div className="flex items-start">
                    <Target className="w-3 h-3 text-plasma mr-2 mt-1 flex-shrink-0" />
                    <p className="text-sm">Strategic licensing blueprint</p>
                    </div>
                </div>
              </HudPanel>
              
              <HudPanel className="p-4 mt-6">
                <h3 className="text-1xl font-bold text-plasma mb-4">Legal Framework</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded-lg mr-0.5 flex-shrink-0">
                      <FileText className="w-5 h-5 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">ESMA Compliant</h4>
                      <p className="text-sm text-gray-400">Fully compliant with European Securities and Markets Authority regulations.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded-lg mr-1 flex-shrink-0">
                      <Wallet className="w-5 h-5 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Utility Token Offering</h4>
                      <p className="text-sm text-gray-400">Regulation (EU) 2023/1114 on markets in crypto-assets.</p>
                    </div>
                  </div>
                </div>
              </HudPanel>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TokenPage;