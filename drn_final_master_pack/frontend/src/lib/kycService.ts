import { supabase } from './supabase';

// Development mode flag
const isDevelopment = import.meta.env.DEV;

/**
 * Service for managing KYC verification
 */
export class KYCService {
  private static instance: KYCService;

  private constructor() {}

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  /**
   * Start a new KYC verification session
   * @param userData User data for KYC verification
   * @returns Promise with the verification session details
   */
  public async startVerification(userData: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
    country?: string;
    documentType?: string;
    documentNumber?: string;
    phoneNumber?: string;
    walletAddress?: string;
  }): Promise<any> {
    try {
      // In development mode, return a simulated response
      if (isDevelopment) {
        console.info('Development mode: Simulating KYC verification start');
        return {
          success: true,
          message: "KYC verification initiated successfully",
          sessionId: "dev-session-" + Date.now(),
          verificationUrl: "https://example.com/verify",
          status: "pending"
        };
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('kyc-api', {
          body: userData,
          method: 'POST',
          path: 'submit'
        });

        if (error) {
          console.error('Error starting KYC verification:', error);
          throw error;
        }

        return data;
      } catch (invokeError) {
        console.error('Failed to invoke KYC API:', invokeError);
        
        // In case of error, return a simulated response in development
        if (isDevelopment) {
          return {
            success: true,
            message: "KYC verification initiated successfully (simulated)",
            sessionId: "dev-session-" + Date.now(),
            verificationUrl: "https://example.com/verify",
            status: "pending"
          };
        }
        throw invokeError;
      }
    } catch (error) {
      console.error('Failed to start KYC verification:', error);
      throw error;
    }
  }

  /**
   * Check the status of a KYC verification session
   * @param sessionId The session ID to check
   * @param email The user's email (optional, used if sessionId is not provided)
   * @returns Promise with the verification status
   */
  public async checkStatus(sessionId?: string, email?: string): Promise<any> {
    try {
      if (!sessionId && !email) {
        throw new Error('Either sessionId or email must be provided');
      }

      // In development mode, return a simulated response
      if (isDevelopment) {
        console.info('Development mode: Simulating KYC status check');
        return {
          status: "success",
          kycStatus: "pending",
          session: {
            id: sessionId || "dev-session",
            email: email || "dev@example.com",
            status: "pending"
          }
        };
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('kyc-api', {
          body: { sessionId, email },
          method: 'POST',
          path: 'status'
        });

        if (error) {
          console.error('Error checking KYC status:', error);
          throw error;
        }

        return data;
      } catch (invokeError) {
        console.error('Failed to invoke KYC API for status check:', invokeError);
        
        // In case of error, return a simulated response in development
        if (isDevelopment) {
          return {
            status: "success",
            kycStatus: "pending",
            session: {
              id: sessionId || "dev-session",
              email: email || "dev@example.com",
              status: "pending"
            }
          };
        }
        throw invokeError;
      }
    } catch (error) {
      console.error('Failed to check KYC status:', error);
      throw error;
    }
  }

  /**
   * Update the status of a KYC verification session
   * @param sessionId The session ID to update
   * @param status The new status
   * @param verificationData Additional verification data
   * @returns Promise with the updated verification details
   */
  public async updateStatus(sessionId: string, status: string, verificationData?: any): Promise<any> {
    try {
      // In development mode, return a simulated response
      if (isDevelopment) {
        console.info('Development mode: Simulating KYC status update');
        return {
          status: "success",
          kycStatus: status,
          session: {
            id: sessionId,
            status: status
          }
        };
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('kyc-api', {
          body: { sessionId, status, verificationData },
          method: 'POST',
          path: 'update'
        });

        if (error) {
          console.error('Error updating KYC status:', error);
          throw error;
        }

        return data;
      } catch (invokeError) {
        console.error('Failed to invoke KYC API for status update:', invokeError);
        
        // In case of error, return a simulated response in development
        if (isDevelopment) {
          return {
            status: "success",
            kycStatus: status,
            session: {
              id: sessionId,
              status: status
            }
          };
        }
        throw invokeError;
      }
    } catch (error) {
      console.error('Failed to update KYC status:', error);
      throw error;
    }
  }
}

export const kycService = KYCService.getInstance();