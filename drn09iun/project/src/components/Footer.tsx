import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldPlus, X, Facebook, Linkedin, Mail, FileText, BookOpen } from 'lucide-react';

interface FooterProps {
  onOpenPdf?: (url: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenPdf }) => {
  return (
    <footer className="bg-stealth bg-opacity-80 backdrop-blur-sm border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ShieldPlus className="w-8 h-8 text-plasma" />
              <span className="text-xl font-bold text-white dronera-logo">DRONERA</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Invest in quantum-secure UAVs with Mach 20+ performance. Tokenized aerospace defense for the future.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/DroneraEU" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-plasma transition-colors">
                <X className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/dronera.eu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-plasma transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/dronera/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-plasma transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:office@dronera.eu" className="text-gray-400 hover:text-plasma transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://dronera.eu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-plasma transition-colors flex items-center space-x-1">
                <span>dronera.eu</span>
                <BookOpen className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-plasma uppercase tracking-wider text-sm font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/technology" className="text-gray-400 hover:text-white text-sm transition-colors">Technology</Link></li>
              <li><Link to="/token" className="text-gray-400 hover:text-white text-sm transition-colors">DRONE Token</Link></li>
              <li><Link to="/proceeds" className="text-gray-400 hover:text-white text-sm transition-colors">Use of Proceeds</Link></li>
              <li><Link to="/team" className="text-gray-400 hover:text-white text-sm transition-colors">Team & Governance</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-plasma uppercase tracking-wider text-sm font-medium mb-4">Investors</h3>
            <ul className="space-y-2">
              <li><Link to="/investor-portal" className="text-gray-400 hover:text-white text-sm transition-colors">Investor Portal</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
              <li>
                <button
                  type="button"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  onClick={() => onOpenPdf && onOpenPdf('/pdfs/White_Paper.pdf')}
                >
                  Whitepaper <FileText className="w-3 h-3 inline-block ml-1" />
                </button>
              </li>
              <li><Link to="/legal-documents" className="text-gray-400 hover:text-white text-sm transition-colors">Legal Documents</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-plasma uppercase tracking-wider text-sm font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/compliance" className="text-gray-400 hover:text-white text-sm transition-colors">Compliance</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} DRONERA. All rights reserved.</p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">DRONE Token is a token offered under EU regulatory frameworks.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
