import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleBackground from './ParticleBackground';
import PdfViewerModal from './PdfViewerModal';

const Layout: React.FC = () => {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  const handleOpenPdf = (url: string) => {
    setCurrentPdfUrl(url);
    setShowPdfModal(true);
  };

  const handleClosePdfModal = () => {
    setCurrentPdfUrl(null);
    setShowPdfModal(false);
  };

  return (
    <div className="min-h-screen bg-stealth flex flex-col">
      <ParticleBackground />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer onOpenPdf={handleOpenPdf} />
      
      {/* PDF Viewer Modal - rendered at top level */}
      {showPdfModal && currentPdfUrl && (
        <PdfViewerModal pdfUrl={currentPdfUrl} onClose={handleClosePdfModal} />
      )}
    </div>
  );
};

export { Layout as default };