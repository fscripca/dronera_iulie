import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Development mode flag
export const isDevelopment = import.meta.env.DEV;

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Log configuration status in development mode
if (isDevelopment) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Development mode: Using placeholder Supabase credentials.');
    console.info('For full functionality, update your .env file with actual Supabase credentials.');
  } else {
    console.info('✅ Supabase configuration detected.');
  }
}

// Create Supabase client with custom settings
let supabaseClient: SupabaseClient;
let connectionStatus: 'connected' | 'error' | 'initializing' = 'initializing';

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit'
    },
    global: {
      headers: {
        'x-application-name': 'dronera-platform'
      }
    }
  });
  
  if (isDevelopment) {
    console.info('Supabase client initialized successfully');
    connectionStatus = 'connected';
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  connectionStatus = 'error';
  
  // Create a minimal client that won't throw errors in development
  if (isDevelopment) {
    console.warn('Creating fallback Supabase client for development');
    supabaseClient = createClient('https://placeholder-project.supabase.co', 'placeholder-key', {
      auth: { 
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    throw error;
  }
}

export const supabase = supabaseClient;

// Function to test the Supabase connection
export const testSupabaseConnection = async (): Promise<{
  status: 'connected' | 'error';
  message: string;
  details?: any;
}> => {
  try {
    // Try to get the current session to test the connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection test error:', error);
      return {
        status: 'error',
        message: `Connection error: ${error.message}`,
        details: error
      };
    }
    
    return {
      status: 'connected',
      message: 'Supabase connection successful',
      details: data
    };
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
    return {
      status: 'error',
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
};

// Export the connection status
export const getConnectionStatus = () => connectionStatus;

// Export types for better TypeScript integration
export type { User, Session } from '@supabase/supabase-js';