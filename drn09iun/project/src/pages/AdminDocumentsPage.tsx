import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  title: string;
  description: string;
  category: 'Financial' | 'Legal' | 'Reports' | 'Other';
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'Active' | 'Inactive';
  visibility: 'all' | 'accredited' | 'institutional';
  created_at: string;
  updated_at: string;
  created_by: string;
}

const AdminDocumentsPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Financial' | 'Legal' | 'Reports' | 'Other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  
  // Form state for new/edit document
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    category: 'Financial' as 'Financial' | 'Legal' | 'Reports' | 'Other',
    file_path: '',
    file_size: 0,
    file_type: '',
    status: 'Active' as 'Active' | 'Inactive',
    visibility: 'all' as 'all' | 'accredited' | 'institutional'
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filterCategory, filterStatus]);

  // ... [rest of the component code remains the same until the return statement]

  return (
    <div className="space-y-6">
      {/* ... [rest of the JSX remains the same] ... */}
      
      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-2xl w-full p-6">
            <form onSubmit={handleSaveDocument}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedDocument ? 'Edit Document' : 'Add New Document'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {saveSuccess && (
                <div className="mb-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    <p className="text-sm text-green-300">Document saved successfully!</p>
                  </div>
                </div>
              )}
              
              {saveError && (
                <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{saveError}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={documentForm.category}
                    onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value as any })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    required
                  >
                    <option value="Financial">Financial</option>
                    <option value="Legal">Legal</option>
                    <option value="Reports">Reports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </form>
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentsPage;