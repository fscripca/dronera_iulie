import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  Phone, 
  FileText, 
  Search, 
  ChevronRight, 
  ExternalLink, 
  Menu,
  Send,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { emailService } from '../lib/emailService';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string; // UUID from database
  subject: string;
  message: string;
  status: 'new' | 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string; // created_at from database
  lastUpdated: string; // updated_at from database
  user_id?: string;
  responses?: Array<{
    message: string;
    from: 'user' | 'support';
    timestamp: string;
  }>;
}

const HelpSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Support tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "How do I verify my identity for KYC compliance?",
      answer: "To complete KYC verification, navigate to the Compliance section in your dashboard. You'll need to provide a government-issued ID, proof of address, and complete the identity verification process through our secure partner.",
      category: "kyc"
    },
    {
      question: "What tokens are available for investment?",
      answer: "Our platform offers various tokenized investment opportunities including real estate, commodities, and equity tokens. Each token represents fractional ownership in underlying assets with full regulatory compliance.",
      category: "tokens"
    },
    {
      question: "How do I withdraw my profits?",
      answer: "Profits can be withdrawn through the 'My Profits' section. You can choose to reinvest, withdraw to your connected wallet, or convert to stablecoins. All withdrawals are subject to compliance checks.",
      category: "profits"
    },
    {
      question: "What are the minimum investment amounts?",
      answer: "Minimum investment amounts vary by token type. Most opportunities start from $100 USD equivalent, making institutional-grade investments accessible to retail investors.",
      category: "investment"
    },
    {
      question: "How secure is the platform?",
      answer: "We employ bank-grade security including multi-signature wallets, cold storage, regular security audits, and compliance with international financial regulations. Your assets are protected by institutional-grade security measures.",
      category: "security"
    },
    {
      question: "Can I trade tokens on secondary markets?",
      answer: "Yes, many of our tokens are tradeable on our integrated marketplace. Liquidity varies by asset type, and all trades are subject to regulatory compliance and holding period requirements.",
      category: "trading"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'kyc', name: 'KYC & Compliance' },
    { id: 'tokens', name: 'Tokens & Assets' },
    { id: 'profits', name: 'Profits & Withdrawals' },
    { id: 'investment', name: 'Investment' },
    { id: 'security', name: 'Security' },
    { id: 'trading', name: 'Trading' }
  ];

  // Load support tickets from database
  const loadTickets = async () => {
    if (!user) return;
    
    setIsLoadingTickets(true);
    setTicketsError(null);
    
    try {
      // Fetch tickets for the current user
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select(`
          id,
          subject,
          message,
          status,
          priority,
          created_at,
          updated_at,
          user_id,
          email
        `)
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('created_at', { ascending: false });
      
      if (ticketsError) throw ticketsError;
      
      // Fetch responses for each ticket
      const ticketsWithResponses = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          const { data: responsesData, error: responsesError } = await supabase
            .from('ticket_responses')
            .select('*')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });
          
          if (responsesError) {
            console.error(`Error fetching responses for ticket ${ticket.id}:`, responsesError);
            return {
              id: ticket.id,
              subject: ticket.subject,
              message: ticket.message,
              status: ticket.status,
              priority: ticket.priority,
              createdAt: ticket.created_at,
              lastUpdated: ticket.updated_at,
              user_id: ticket.user_id,
              responses: []
            };
          }
          
          // Map responses to the expected format
          const formattedResponses = (responsesData || []).map(response => ({
            message: response.message,
            from: response.from_support ? 'support' : 'user',
            timestamp: response.created_at
          }));
          
          return {
            id: ticket.id,
            subject: ticket.subject,
            message: ticket.message,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.created_at,
            lastUpdated: ticket.updated_at,
            user_id: ticket.user_id,
            responses: formattedResponses
          };
        })
      );
      
      setTickets(ticketsWithResponses);
    } catch (error) {
      console.error('Failed to load support tickets:', error);
      setTicketsError('Failed to load your support tickets. Please try again later.');
    } finally {
      setIsLoadingTickets(false);
    }
  };
  
  // Load tickets when component mounts or user changes
  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitStatus('idle');

    try {
      try {
        // Send support request to the system
        await emailService.sendSupportRequest({
          userEmail: user?.email || '',
          subject: contactForm.subject,
          message: contactForm.message,
          priority: contactForm.priority
        });
        
        // Try to send a copy to office@dronera.eu, but don't fail if this doesn't work
        try {
          await emailService.sendNotification(
            'office@dronera.eu',
            `Support Request: ${contactForm.subject}`,
            `A new support request has been submitted by ${user?.email || 'a user'}:\n\nPriority: ${contactForm.priority.toUpperCase()}\n\n${contactForm.message}`
          );
        } catch (notificationError) {
          console.warn('Failed to send notification copy, but continuing:', notificationError);
          // Don't throw here - we still want to show success if the main request was sent
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // For development mode, simulate success even if email fails
        if (import.meta.env.DEV) {
          console.log('DEV MODE: Simulating successful email submission');
        } else {
          throw emailError; // In production, propagate the error
        }
      }
      
      setSubmitStatus('success');
      setContactForm({ subject: '', message: '', priority: 'medium' });
    } catch (error) {
      console.error('Failed to send support request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status color for tickets
  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'text-yellow-400 bg-yellow-400/10';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10';
      case 'closed': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Get status icon for tickets
  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-stealth flex">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
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
            <HelpCircle className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Help & Support</span>
          </div>
        </div>
        
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Help & Support
                </h1>
                <p className="text-gray-400 mt-1">Get assistance and find answers to your questions</p>
              </div>
            </div>
          </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            {[
              { id: 'faq', name: 'FAQ', icon: HelpCircle },
              { id: 'contact', name: 'Contact Support', icon: MessageSquare },
              { id: 'tickets', name: 'My Tickets', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <HudPanel className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search frequently asked questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </HudPanel>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <HudPanel key={index} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <HelpCircle className="w-5 h-5 text-cyan-400 mr-2" />
                          {faq.question}
                        </h3>
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        <div className="mt-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {categories.find(cat => cat.id === faq.category)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </HudPanel>
                ))}
                
                {filteredFAQs.length === 0 && (
                  <HudPanel className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No FAQs Found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                  </HudPanel>
                )}
              </div>
            </div>
          )}

          {/* Contact Support Tab */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl">
              <HudPanel className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">Contact Our Support Team</h2>
                  <p className="text-gray-400">
                    Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
                  </p>
                </div>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-green-400">Your support request has been sent successfully!</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <span className="text-red-400">Failed to send your request. Please try again.</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Account issue</option>
                      <option value="high">High - Urgent problem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                      placeholder="Please provide detailed information about your issue..."
                    />
                  </div>

                  <CyberButton
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </div>
                    )}
                  </CyberButton>
                </form>

                {/* Alternative Contact Methods */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Other Ways to Reach Us</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Email</p>
                        <p className="text-sm text-gray-400">support@platform.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg">
                      <Phone className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-medium text-white">Phone</p>
                        <p className="text-sm text-gray-400">+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">My Support Tickets</h2>
                <CyberButton
                  onClick={() => setActiveTab('contact')}
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  New Ticket
                </CyberButton>
              </div>

              {/* Loading and Error States */}
              {isLoadingTickets && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your support tickets...</p>
                </div>
              )}
              
              {ticketsError && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-300">{ticketsError}</p>
                    </div>
                    <button
                      onClick={() => setTicketsError(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {!isLoadingTickets && tickets.length === 0 && !ticketsError && (
                  <HudPanel className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Support Tickets</h3>
                    <p className="text-gray-500 mb-4">You haven't submitted any support tickets yet.</p>
                    <CyberButton
                      onClick={() => setActiveTab('contact')}
                      size="sm"
                    >
                      Create Your First Ticket
                    </CyberButton>
                  </HudPanel>
                )}
                
                {!isLoadingTickets && tickets.map((ticket) => (
                  <HudPanel key={ticket.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">Ticket ID: {ticket.id}</p>
                        <p className="text-gray-300">{ticket.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      <span>Last Updated: {formatDate(ticket.lastUpdated)}</span>
                    </div>

                    {ticket.responses && ticket.responses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-white mb-3">Recent Response:</h4>
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">{ticket.responses[0].message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            From: {ticket.responses[0].from === 'support' ? 'Support Team' : 'You'} • 
                            {formatDate(ticket.responses[0].timestamp)}
                          </p>
                        </div>
                      </div>
                    )}
                  </HudPanel>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;