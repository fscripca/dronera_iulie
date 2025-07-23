import React from 'react';
import { X } from 'lucide-react';
import HudPanel from './HudPanel';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ 
  imageUrl, 
  onClose,
  title = "Image Viewer"
}) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <HudPanel className="max-w-4xl w-full p-6 flex flex-col">
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
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
      </HudPanel>
    </div>
  );
};

export default ImageViewerModal;