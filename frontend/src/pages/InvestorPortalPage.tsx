import React, { useState } from 'react';
import { FileText, Download, ChevronRight, FileCheck, ArrowRight, Mail, Bell, Building, Cpu, Scale, Briefcase, AlertCircle } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import PdfViewerModal from '../components/PdfViewerModal';
import ImageViewerModal from '../components/ImageViewerModal';

const InvestorPortalPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const handleViewPitchDeck = async () => {
    // Use a local PDF file from the public directory
    const pitchDeckPath = '/pdfs/Dronera_White_Paper.pdf'; // Temporarily use the white paper as a fallback
    setCurrentPdfUrl(pitchDeckPath);
    setShowPdfModal(true);
  };

  const handleDownloadPdf = (pdfPath: string, filename: string) => {
    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = pdfPath;
      link.download = filename;
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Clear any previous errors
      setDownloadError(null);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError('Failed to download file. Please try again.');
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setCurrentPdfUrl(null);
  };

  const handleOpenImage = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setCurrentImageUrl(null);
  };

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Investor <span className="text-plasma">Portal</span>
          </h1>
          <p className="text-xl text-gray-300">
            Access essential documents and complete your investment in DRONERA's aerospace defense technology.
          </p>
        </div>
        
        {/* Documents Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <FileText className="text-plasma mr-3 w-7 h-7" />
            Investment Documents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pitch Deck */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Investor Pitch Deck</h3>
                    <p className="text-sm text-gray-400 mb-3">Pitch Deck</p>
                    <div className="flex space-x-3"> 
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/Investor_Pitch_Deck.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/Investor_Pitch_Deck.pdf', 'DRONERA_Investor_Pitch_Deck.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                      <p className="text-sm text-gray-400 mt-4 mb-2">Strategic Vision</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/Strategic_Vision.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/Strategic_Vision.pdf', 'DRONERA_Strategic_Vision.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                     <p className="text-sm text-gray-400 mt-4 mb-2">Financial Projections </p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/Business_Plan.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/Business_Plan.pdf', 'DRONERA_Business_Plan.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                  <div className="mt-auto">
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* Joint Venture Agreement */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileCheck className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Agreements</h3>
                    
                    <p className="text-sm text-gray-400 mb-2">Joint Venture Agreement</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/Joint_Venture.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/Joint_Venture.pdf', 'DRONERA_Joint_Venture.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                    
                     <p className="text-sm text-gray-400 mt-4 mb-2">Token Purchase Agreement</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/Token_Purchase_Agreement.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/Token.pdf', 'DRONERA_Token.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                     <p className="text-sm text-gray-400 mt-4 mb-2">SAFE Agreement</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/Token_Equity.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/Token_Equity.pdf', 'DRONERA_Token_Equity.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                  <div className="mt-auto">
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* Legal Compliance */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <Scale className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Legal Compliance</h3>
                     <p className="text-sm text-gray-400 mb-2">White Paper</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/White_Paper.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/White_Paper.pdf', 'DRONERA_White_Paper.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                    <p className="text-sm text-gray-400 mt-4 mb-2">MiCA Lite Paper</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/MiCA_White_Paper.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/MiCA_White_Paper.pdf', 'DRONERA_MiCA_White_Paper.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>

   <p className="text-sm text-gray-400 mt-4 mb-2">ESMA Notification</p>
                    <div className="flex space-x-3">
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => {
                          setCurrentPdfUrl('/pdfs/ESMA_Notification.pdf');
                          setShowPdfModal(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton 
                        className="text-xs py-1 px-3"
                        onClick={() => handleDownloadPdf('/pdfs/ESMA_Notification.pdf', 'DRONERA_ESMA_Notification.pdf')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                    
                  </div>
                  <div className="mt-auto">
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* Vaslui Drone Lab & Factory */}
            <HudPanel className="p-6">
                <div className="flex flex-col h-full w-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1 ml-8">Vaslui Drone Lab <span className="font-mono">&</span> Factory</h3>
                    <div className="w-full h-full overflow-hidden rounded-lg mb-3">
                      <div 
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleOpenImage("/images/Building.png")}
                      >
                        <img 
                          src="/images/Building.png" 
                          alt="DRONERA Facility in Vaslui" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                  </div>
                </div>
            </HudPanel>
            
                    
          </div>
        </section>

        {/* Error Message */}
        {downloadError && (
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-300">{downloadError}</p>
            </div>
          </div>
        )}

        {/* Use of Proceeds Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Briefcase className="text-plasma mr-3 w-7 h-7" />
            Use of Proceeds
          </h2>
          
          <HudPanel className="p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold mb-6">Fund Allocation</h3>
                <p className="text-gray-300 mb-8">
                  DRONERA is strategically allocating the €100 million fundraise to accelerate its growth
                  from TRL 6-7 to full commercial production at scale, enabling rapid market deployment
                  of its revolutionary aerospace defense technologies.
                </p>
                
                {/* Fund Distribution */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">Drone Factory Infrastructure</span>
                      </div>
                      <span className="font-bold text-plasma">40%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Cpu className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">IP Licensing, Testing Grounds</span>
                      </div>
                      <span className="font-bold text-plasma">25%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Scale className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">TRL 5-8 Development</span>
                      </div>
                      <span className="font-bold text-plasma">20%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">Legal, Compliance, Operations</span>
                      </div>
                      <span className="font-bold text-plasma">15%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HudPanel>
        </section>
        
        
        {/* Investment Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <FileCheck className="text-plasma mr-3 w-7 h-7" />
            Investment Process
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Review Documentation</h3>
              </div>
              <p className="text-gray-300 text-center mb-6">
                Download and review the investment memorandum, technical white paper, and financial projections.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Investment overview</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Technical documentation</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Financial projections</span>
                </li>
              </ul>
            </HudPanel>
            
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Complete KYC/AML</h3>
              </div>
              <p className="text-gray-300 text-center mb-6">
                Complete identity verification and compliance checks to qualify for DRONE token investment.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Identity confirmation</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Investment eligibility checks</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Compliance documentation</span>
                </li>
              </ul>
            </HudPanel>
            
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Sign & Invest</h3>
              </div>
              <p className="text-gray-300 text-center mb-6">
                Digitally sign the investment agreement and complete your contribution to secure DRONE tokens.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Digital signature process</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Fund transfer instructions</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Token allocation confirmation</span>
                </li>
              </ul>
            </HudPanel>
          </div>
        </section>

        {/* Newsletter Subscription Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Bell className="text-plasma mr-3 w-7 h-7" />
            Stay Updated
          </h2>
          
          <HudPanel className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-bold mb-4">Investment Newsletter</h3>
              <p className="text-gray-300 mb-8">
                Get exclusive updates on DRONERA's progress, funding milestones, and investment opportunities.
              </p>
              
              {!subscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 bg-[#0d0d14] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-plasma"
                    required
                  />
                  <CyberButton type="submit" className="px-6 py-3">
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </CyberButton>
                </form>
              ) : (
                <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-green-300">✓ Successfully subscribed to investment updates!</p>
                </div>
              )}
            </div>
          </HudPanel>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <HudPanel className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Invest in the Future?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join DRONERA's mission to revolutionize aerospace defense technology. 
              Complete your investment process and secure your position in the next generation of autonomous defense systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CyberButton to="/dashboard" className="px-8 py-4 text-lg">
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Investment Process
              </CyberButton>
              <CyberButton 
                variant="secondary" 
                className="px-8 py-4 text-lg"
                onClick={() => {
                  setCurrentPdfUrl('/pdfs/investor-pitch-deck.pdf');
                  setShowPdfModal(true);
                }}
              >
                <FileText className="w-5 h-5 mr-2" />
                View Pitch Deck
              </CyberButton>
            </div>
          </HudPanel>
        </section>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfModal && currentPdfUrl && (
        <PdfViewerModal
          pdfUrl={currentPdfUrl}
          onClose={handleClosePdfModal}
        />
      )}
      
      {/* Image Viewer Modal */}
      {showImageModal && currentImageUrl && (
        <ImageViewerModal
          imageUrl={currentImageUrl}
          onClose={handleCloseImageModal}
          title="Dronera Operations Center – 5,400 sqm, Vaslui, Romania"
        />
      )}
    </div>
  );
};

export default InvestorPortalPage;