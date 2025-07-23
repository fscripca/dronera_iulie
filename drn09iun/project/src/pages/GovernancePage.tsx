import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  Plus, 
  Calendar, 
  BarChart, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Menu,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import CreateProposal from '../components/CreateProposal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Proposal, Vote as VoteType } from '../types/governance';

const GovernancePage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotes, setUserVotes] = useState<VoteType[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteType, setVoteType] = useState<'for' | 'against' | 'abstain'>('for');
  const [voteWeight, setVoteWeight] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'passed' | 'rejected' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'treasury' | 'technical' | 'governance' | 'community'>('all');
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Set up real-time subscription for proposals
  useEffect(() => {
    const proposalsSubscription = supabase
      .channel('governance_proposals_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'governance_proposals' 
        }, 
        (payload) => {
          // Refresh proposals when changes occur
          loadProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(proposalsSubscription);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadProposals();
      loadUserVotes();
    }
  }, [user]);

  const loadProposals = async () => {
    try {
      setError(null);
      
      // Fetch proposals from Supabase
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database results to our Proposal interface
      const mappedProposals: Proposal[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        startDate: item.start_date,
        endDate: item.end_date,
        votesFor: item.votes_for,
        votesAgainst: item.votes_against,
        votesAbstain: item.votes_abstain,
        quorum: item.quorum,
        category: item.category,
        createdBy: item.created_by,
        createdAt: item.created_at,
        proposedChanges: item.proposed_changes,
        implementationTimeline: item.implementation_timeline,
        expectedImpact: item.expected_impact
      }));

      setProposals(mappedProposals);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load proposals:', error);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!user) return;
    
    try {
      // Fetch user's votes from Supabase
      const { data, error } = await supabase
        .from('governance_votes')
        .select('*')
        .eq('voter_address', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database results to our Vote interface
      const mappedVotes: VoteType[] = (data || []).map(item => ({
        id: item.id,
        proposalId: item.proposal_id,
        voterAddress: item.voter_address,
        voteType: item.vote_type,
        voteWeight: item.vote_weight,
        transactionHash: item.transaction_hash,
        createdAt: item.created_at
      }));

      setUserVotes(mappedVotes);
    } catch (error) {
      console.error('Failed to load user votes:', error);
    }
  };

  const handleVote = async () => {
    if (!selectedProposal || !user) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      // Check if user has already voted
      const existingVote = userVotes.find(vote => vote.proposalId === selectedProposal.id);
      if (existingVote) {
        throw new Error('You have already voted on this proposal');
      }

      // Submit vote to Supabase
      const { data, error } = await supabase
        .from('governance_votes')
        .insert({
          proposal_id: selectedProposal.id,
          voter_address: user.id,
          vote_type: voteType,
          vote_weight: voteWeight
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const newVote: VoteType = {
        id: data.id,
        proposalId: data.proposal_id,
        voterAddress: data.voter_address,
        voteType: data.vote_type,
        voteWeight: data.vote_weight,
        transactionHash: data.transaction_hash,
        createdAt: data.created_at
      };

      setUserVotes(prev => [newVote, ...prev]);

      // Update proposal vote counts
      const updatedProposal = { ...selectedProposal };
      switch (voteType) {
        case 'for':
          updatedProposal.votesFor += voteWeight;
          break;
        case 'against':
          updatedProposal.votesAgainst += voteWeight;
          break;
        case 'abstain':
          updatedProposal.votesAbstain += voteWeight;
          break;
      }

      setProposals(prev => prev.map(p => p.id === selectedProposal.id ? updatedProposal : p));
      setShowVoteModal(false);
      setSelectedProposal(null);
      
    } catch (error: any) {
      console.error('Failed to submit vote:', error);
      setError(error.message || 'Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleCreateProposal = () => {
    setShowCreateModal(true);
  };

  const handleProposalCreated = () => {
    // Refresh proposals when a new one is created
    loadProposals();
  };

  // Filter proposals based on search and filters
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || proposal.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Calendar className="w-4 h-4 text-yellow-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-900 text-blue-300';
      case 'passed': return 'bg-green-900 text-green-300';
      case 'rejected': return 'bg-red-900 text-red-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'treasury': return <BarChart className="w-4 h-4 text-plasma" />;
      case 'technical': return <FileText className="w-4 h-4 text-plasma" />;
      case 'governance': return <Vote className="w-4 h-4 text-plasma" />;
      case 'community': return <Users className="w-4 h-4 text-plasma" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (votesFor: number, votesAgainst: number, votesAbstain: number) => {
    const total = votesFor + votesAgainst + votesAbstain;
    return {
      for: total > 0 ? (votesFor / total) * 100 : 0,
      against: total > 0 ? (votesAgainst / total) * 100 : 0,
      abstain: total > 0 ? (votesAbstain / total) * 100 : 0
    };
  };

  const calculateQuorumProgress = (votesFor: number, votesAgainst: number, votesAbstain: number, quorum: number) => {
    const total = votesFor + votesAgainst + votesAbstain;
    return Math.min((total / quorum) * 100, 100);
  };

  const hasUserVoted = (proposalId: string) => {
    return userVotes.some(vote => vote.proposalId === proposalId);
  };

  const getUserVote = (proposalId: string) => {
    return userVotes.find(vote => vote.proposalId === proposalId);
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
            <Vote className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Governance</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Governance</h1>
                <p className="text-gray-400">Participate in DRONERA's decentralized governance</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400 hidden md:block">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
                <CyberButton onClick={loadProposals} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </CyberButton>
                <CyberButton onClick={handleCreateProposal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
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

            {/* Governance Overview */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${user?.kyc_status !== 'approved' ? 'opacity-50 pointer-events-none' : ''}`}>
              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Active Proposals</h3>
                  <Vote className="w-5 h-5 text-plasma" />
                </div>
                <p className="text-2xl font-bold text-plasma">{proposals.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-gray-400">Currently voting</p>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Your Votes</h3>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">{userVotes.length}</p>
                <p className="text-sm text-gray-400">Proposals voted on</p>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-400 uppercase tracking-wider">Voting Power</h3>
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">1,000</p>
                <p className="text-sm text-gray-400">Based on token holdings</p>
              </HudPanel>
            </div>

            {/* Search and Filters */}
            <HudPanel className="p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search proposals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="passed">Passed</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as any)}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    >
                      <option value="all">All Categories</option>
                      <option value="treasury">Treasury</option>
                      <option value="technical">Technical</option>
                      <option value="governance">Governance</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end items-end">
                  <div className="text-sm text-gray-400">
                    Showing {filteredProposals.length} of {proposals.length} proposals
                  </div>
                </div>
              </div>
            </HudPanel>

            {/* Proposals List */}
            <HudPanel className={`p-6 ${user?.kyc_status !== 'approved' ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-xl font-bold mb-6">Active Proposals</h2>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 text-plasma animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading proposals...</p>
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No proposals found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                      ? 'Try adjusting your search filters' 
                      : 'Be the first to create a governance proposal'
                    }
                  </p>
                  {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' ? (
                    <CyberButton onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterCategory('all');
                    }}>
                      Clear Filters
                    </CyberButton>
                  ) : (
                    <CyberButton onClick={handleCreateProposal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Proposal
                    </CyberButton>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredProposals.map((proposal) => {
                    const progress = calculateProgress(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain);
                    const quorumProgress = calculateQuorumProgress(proposal.votesFor, proposal.votesAgainst, proposal.votesAbstain, proposal.quorum);
                    const userVote = getUserVote(proposal.id);
                    const hasVoted = hasUserVoted(proposal.id);
                    
                    return (
                      <div key={proposal.id} className="bg-[#0d0d14] rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold">{proposal.title}</h3>
                              <div className={`px-2 py-1 rounded text-xs inline-flex items-center space-x-1 ${getStatusColor(proposal.status)}`}>
                                {getStatusIcon(proposal.status)}
                                <span className="capitalize">{proposal.status}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-plasma">
                                {getCategoryIcon(proposal.category)}
                                <span className="text-sm capitalize">{proposal.category}</span>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4">{proposal.description}</p>
                            
                            {/* Voting Progress */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span>Voting Progress</span>
                                <span>{quorumProgress.toFixed(1)}% of quorum reached</span>
                              </div>
                              <div className="w-full h-2 bg-[#161620] rounded-full overflow-hidden mb-2">
                                <div 
                                  className="h-full bg-plasma" 
                                  style={{ width: `${quorumProgress}%` }}
                                ></div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="flex justify-between">
                                    <span className="text-green-400">For</span>
                                    <span>{proposal.votesFor.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#161620] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-400" 
                                      style={{ width: `${progress.for}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between">
                                    <span className="text-red-400">Against</span>
                                    <span>{proposal.votesAgainst.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#161620] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-red-400" 
                                      style={{ width: `${progress.against}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between">
                                    <span className="text-yellow-400">Abstain</span>
                                    <span>{proposal.votesAbstain.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full h-1 bg-[#161620] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-yellow-400" 
                                      style={{ width: `${progress.abstain}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm text-gray-400">
                              <span>Start: {formatDate(proposal.startDate)}</span>
                              <span>End: {formatDate(proposal.endDate)}</span>
                              <span>Quorum: {proposal.quorum.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="ml-6">
                            {hasVoted ? (
                              <div className="text-center">
                                <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3 mb-2">
                                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                                  <p className="text-xs text-green-300">Voted</p>
                                </div>
                                <p className="text-xs text-gray-400">
                                  {userVote?.voteType.toUpperCase()} ({userVote?.voteWeight.toLocaleString()})
                                </p>
                              </div>
                            ) : proposal.status === 'active' ? (
                              <CyberButton
                                onClick={() => {
                                  setSelectedProposal(proposal);
                                  setShowVoteModal(true);
                                }}
                                className="px-6"
                              >
                                <Vote className="w-4 h-4 mr-2" />
                                Vote
                              </CyberButton>
                            ) : (
                              <div className="text-center text-gray-500">
                                <Clock className="w-6 h-6 mx-auto mb-1" />
                                <p className="text-xs">Voting Closed</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </HudPanel>
          </div>
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Cast Your Vote</h2>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">{selectedProposal.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{selectedProposal.description}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Vote
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setVoteType('for')}
                    className={`p-3 rounded text-center transition-colors ${
                      voteType === 'for' 
                        ? 'bg-green-900 text-green-300 border border-green-500' 
                        : 'bg-[#0d0d14] text-gray-400 hover:bg-green-900 hover:bg-opacity-30'
                    }`}
                  >
                    For
                  </button>
                  <button
                    onClick={() => setVoteType('against')}
                    className={`p-3 rounded text-center transition-colors ${
                      voteType === 'against' 
                        ? 'bg-red-900 text-red-300 border border-red-500' 
                        : 'bg-[#0d0d14] text-gray-400 hover:bg-red-900 hover:bg-opacity-30'
                    }`}
                  >
                    Against
                  </button>
                  <button
                    onClick={() => setVoteType('abstain')}
                    className={`p-3 rounded text-center transition-colors ${
                      voteType === 'abstain' 
                        ? 'bg-yellow-900 text-yellow-300 border border-yellow-500' 
                        : 'bg-[#0d0d14] text-gray-400 hover:bg-yellow-900 hover:bg-opacity-30'
                    }`}
                  >
                    Abstain
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Voting Weight
                </label>
                <input
                  type="number"
                  value={voteWeight}
                  onChange={(e) => setVoteWeight(parseInt(e.target.value) || 0)}
                  min="1"
                  max="10000"
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Based on your token holdings (max: 10,000)
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <CyberButton
                onClick={() => setShowVoteModal(false)}
                variant="red"
                className="flex-1"
              >
                Cancel
              </CyberButton>
              <CyberButton
                onClick={handleVote}
                className="flex-1"
                disabled={isVoting || voteWeight <= 0}
              >
                {isVoting ? 'Submitting...' : 'Submit Vote'}
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Create Proposal Modal */}
      <CreateProposal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProposalCreated={handleProposalCreated}
      />
    </div>
  );
};

export default GovernancePage;