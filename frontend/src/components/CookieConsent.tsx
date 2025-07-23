import React, { useState } from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import { X, Info } from 'lucide-react';
import CyberButton from './CyberButton';

const GDPRCookieConsent: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="Accept All"
        cookieName="dronera-gdpr-consent"
        style={{
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(0, 204, 255, 0.3)',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.3)',
          padding: '16px',
          zIndex: 9999,
        }}
        buttonStyle={{
          background: 'var(--plasma-blue)',
          color: '#0a0a0f',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '8px 16px',
          borderRadius: '4px',
          fontFamily: '"Roboto Mono", monospace',
        }}
        declineButtonStyle={{
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          fontSize: '14px',
          padding: '8px 16px',
          borderRadius: '4px',
          marginRight: '10px',
          fontFamily: '"Roboto Mono", monospace',
        }}
        declineButtonText="Necessary Only"
        enableDeclineButton
        onDecline={() => {
          // Set cookie for only necessary cookies
          Cookies.set('dronera-gdpr-consent-necessary', 'true', { expires: 365 });
        }}
        expires={365}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="flex-1 pr-4">
            <p className="text-sm mb-2">
              This website uses cookies to enhance your experience. By clicking "Accept All", you consent to the use of all cookies. 
              You can choose "Necessary Only" or{' '}
              <button 
                onClick={() => setShowDetails(!showDetails)} 
                className="text-plasma underline"
              >
                customize your preferences
              </button>.
            </p>
            {showDetails && (
              <div className="mt-3 p-3 bg-[#0d0d14] rounded-lg border border-gray-800 text-xs">
                <div className="mb-2 font-bold">Cookie Categories:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="text-plasma">Necessary:</span> Essential for website functionality</li>
                  <li><span className="text-plasma">Analytics:</span> Help us understand how you use our site</li>
                  <li><span className="text-plasma">Marketing:</span> Used to deliver relevant ads</li>
                  <li><span className="text-plasma">Preferences:</span> Store your settings and preferences</li>
                </ul>
                <div className="mt-2">
                  <a href="/privacy" className="text-plasma underline">View our Privacy Policy</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </CookieConsent>
    </>
  );
};

export default GDPRCookieConsent;