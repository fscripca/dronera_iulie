import React from 'react';
import HudPanel from './HudPanel';
import { X } from 'lucide-react';

interface PdfViewerModalProps {
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ 
  onClose, 
  pdfUrl, 
  title = "Document Viewer" 
}) => {
  if (!pdfUrl) return null;

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    try {
      // Create a link element
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-0">
      <HudPanel className="max-w-full w-full h-screen p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 bg-[#0d0d14] rounded-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title={title}
            className="w-full h-full"
          >
            <p>Your browser does not support iframes. You can <a href={pdfUrl} target="_blank" rel="noopener noreferrer">download the PDF</a> instead.</p>
          </iframe>
        </div>
      </HudPanel>
    </div>
  );
};

export default PdfViewerModal;