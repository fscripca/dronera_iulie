import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Wallet, BarChart as ChartBar, Users, Settings, LogOut, ShieldPlus, Bell, HelpCircle, ExternalLink, Vote, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', primary: true },
    { path: '/investments', icon: ChartBar, label: 'Investments', primary: true }, 
    { path: '/wallet', icon: Wallet, label: 'Wallet', primary: true },
    { path: '/governance', icon: Vote, label: 'Governance', primary: true },
    { path: '/profits', icon: TrendingUp, label: 'My Profits', primary: true },
    { path: '/documents', icon: FileText, label: 'Documents', primary: true },
    { path: '/settings', icon: Settings, label: 'Settings', primary: false },
    { path: '/help', icon: HelpCircle, label: 'Help & Support', primary: false },
  ];

  // Add KYC menu item if not approved
  const kycMenuItem = user?.kyc_status !== 'approved' ? {
    path: '/dashboard',
    icon: Shield,
    label: 'Complete KYC',
    primary: true,
    isKyc: true
  } : null;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Overlay for mobile
  const overlayClasses = isOpen 
    ? 'fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden' 
    : 'hidden';

  // Sidebar classes
  const sidebarClasses = `fixed top-0 left-0 h-full w-64 bg-[#0a0a0f] border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } lg:translate-x-0 lg:static lg:z-0`;

  return (
    <>
      {/* Mobile overlay */}
      <div className={overlayClasses} onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldPlus className="w-8 h-8 text-plasma" />
              <span className="text-xl font-bold text-white dronera-logo">
                DRONE<span className="text-plasma dronera-one">RA</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-plasma rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#0a0a0f] font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="overflow-hidden">
                {user?.first_name || user?.last_name ? (
                  <p className="font-medium text-white truncate max-w-[160px]">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                  </p>
                ) : null}
                <p className={`text-gray-300 truncate max-w-[160px] ${user?.first_name || user?.last_name ? 'text-sm' : 'font-medium text-white'}`}>{user?.email}</p>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    user?.kyc_status === 'approved' ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  <p className={`text-xs ${
                    user?.kyc_status === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {user?.kyc_status === 'approved' ? 'Active Investor' : 'KYC Required'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">MAIN NAVIGATION</p>
              <nav className="space-y-1">
                {/* KYC Menu Item (if needed) */}
                {kycMenuItem && (
                  <Link
                    key={kycMenuItem.path}
                    to={kycMenuItem.path}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 bg-red-900 bg-opacity-20 text-red-400 border border-red-500 border-opacity-30 hover:bg-red-900 hover:bg-opacity-30 animate-pulse"
                    onClick={onClose}
                  >
                    <kycMenuItem.icon className="w-5 h-5 text-red-400" />
                    <span className="font-medium">{kycMenuItem.label}</span>
                  </Link>
                )}
                
                {menuItems.filter(item => item.primary).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]'
                        : `text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)] ${
                            user?.kyc_status !== 'approved' && item.path !== '/dashboard' && item.path !== '/help' && item.path !== '/settings' 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`
                    }`}
                    onClick={onClose}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-plasma' : ''}`} />
                    <span>{item.label}</span>
                    {user?.kyc_status !== 'approved' && item.path !== '/dashboard' && item.path !== '/help' && item.path !== '/settings' && (
                      <Shield className="w-3 h-3 text-red-400 ml-auto" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="px-4 mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">OTHER</p>
              <nav className="space-y-1">
                {menuItems.filter(item => !item.primary).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-[rgba(0,204,255,0.1)] text-plasma border-l-2 border-plasma shadow-[0_0_10px_rgba(0,204,255,0.3)]'
                        : 'text-gray-400 hover:text-white hover:bg-[rgba(0,204,255,0.05)] hover:shadow-[0_0_8px_rgba(0,204,255,0.1)]'
                    }`}
                    onClick={onClose}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-plasma' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Notifications */}
          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[rgba(255,0,51,0.1)] text-red-400 rounded-lg hover:bg-red-900 hover:bg-opacity-30 transition-all duration-300 border border-transparent hover:border-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            
            <div className="mt-4 text-center">
              <a 
                href="https://dronera.eu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-plasma flex items-center justify-center transition-colors duration-200"
              >
                <span>dronera.eu</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;