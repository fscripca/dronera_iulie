import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      if (isSignUp) {
        // Check if passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        try {
          const result = await signUp(email, password);
          if (!result.session) {
            // Email confirmation is required
            setConfirmSent(true);
          } else {
            // User is signed in immediately (email confirmation disabled)
            navigate('/dashboard');
          }
        } catch (signUpError: any) {
          if (signUpError.message?.includes('confirmation email') || signUpError.message?.includes('server configuration')) {
            // Show specific error message for email/SMTP issues
            setAuthError(signUpError.message + ' Please contact support if this issue persists.');
          } else {
            throw signUpError;
          }
        }
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <HudPanel className="p-8">
          <div className="text-center mb-8">
           
            <h1 className="text-2xl font-bold mb-2">DRONERA Dashboard</h1>
            <p className="text-gray-400">Access your investment portal</p>
          </div>

          {confirmSent ? (
            <div className="text-center">
              <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4 mb-6">
                <p className="text-green-300">
                  Please check your email to confirm your account. Once confirmed, you can log in.
                </p>
              </div>
              <CyberButton
                onClick={() => {
                  setIsSignUp(false);
                  setConfirmSent(false);
                }}
                className="w-full"
              >
                Return to Login
              </CyberButton>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              {authError && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                  <p className="text-sm text-red-300">{authError}</p>
                </div>
              )}

              <CyberButton
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </CyberButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setConfirmPassword('');
                    setAuthError('');
                  }}
                  className="text-plasma hover:underline text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-800 flex justify-center">
            <CyberButton
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </CyberButton>
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default LoginPage;