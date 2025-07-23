@@ .. @@
 import React from 'react';
 import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
 import { useEffect, useState } from 'react';
+import { testSupabaseConnection } from './lib/supabase';
 import HomePage from './pages/HomePage';
 import TechnologyPage from './pages/TechnologyPage';
import KYCCallbackPage from './pages/KYCCallbackPage';
// Inside <Routes>
<Route path="/kyc-callback" element={<KYCCallbackPage />} />
@@ .. @@
   const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
 
+  // Enhanced Supabase connection check
   useEffect(() => {
     const checkSupabaseConnection = async () => {
       try {
-        // Try to get the current session to test the connection
-        const { data, error } = await supabase.auth.getSession();
+        const result = await testSupabaseConnection();
         
-        if (error) {
-          console.error('Supabase connection error:', error);
+        if (result.status === 'error') {
+          console.error('Supabase connection error:', result.details);
           setConnectionStatus('error');
-          setErrorMessage(error.message);
+          setErrorMessage(result.message);
           return;
         }
         
-        console.log('Supabase connection successful!', data);
+        console.log('Supabase connection successful!', result.details);
         setConnectionStatus('success');
       } catch (err) {
         console.error('Unexpected error connecting to Supabase:', err);