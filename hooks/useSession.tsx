'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SessionUser = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role?: string;
  isBanned?: boolean;
  createdAt?: string | Date;
};

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const fetchSession = async () => {
      try {
        // First try to get the sessionId from cookie
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('sessionId='));
        let sessionId = sessionCookie ? sessionCookie.split('=')[1].trim() : null;
        
        // If no cookie, check localStorage as fallback
        if (!sessionId) {
          try {
            sessionId = localStorage.getItem('sessionId');
          } catch (storageErr) {
            console.warn('localStorage access error:', storageErr);
          }
        }
        
        // If we have a sessionId from localStorage but no cookie, set the cookie
        if (sessionId && !sessionCookie) {
          try {
            document.cookie = `sessionId=${sessionId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
          } catch (cookieErr) {
            console.warn('Cookie setting error:', cookieErr);
          }
        }
        
        // Update state only if component is still mounted
        if (isMounted) {
          setSessionId(sessionId);
          console.log('useSession: sessionId found:', sessionId ? 'YES' : 'NO');
        }
        
        // If no sessionId, we don't need to make an API call - user is not logged in
        if (!sessionId) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }
        
        // Add a timeout for the API call to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('useSession: API request timed out after 5 seconds');
          controller.abort();
        }, 5000);
        
        try {
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionId}`
            },
            body: JSON.stringify({ sessionId }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
          
          const userData = await response.json();
          
          // Make sure we're still mounted before updating state
          if (!isMounted) return;
          
          if (userData.error) {
            console.warn('Session invalid or expired', userData.error);
            // Clear invalid session
            document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            try { localStorage.removeItem('sessionId'); } catch(e) {}
            setSessionId(null);
          } else if (userData.user) {
            console.log('useSession: User data received:', userData.user.email, 'Role:', userData.user.role);
            setUser(userData.user);
          } else {
            console.warn('User data missing in API response');
            setUser(null);
          }
        } catch (err) {
          clearTimeout(timeoutId);
          
          // Handle abort errors gracefully
          const error = err as Error;
          if (error.name === 'AbortError') {
            console.log('useSession: Request was aborted (likely due to timeout)');
            // Don't clear session on timeout, just treat as loading failure
            if (isMounted) {
              setError('Connection timeout. Please refresh the page.');
            }
          } else {
            console.error('API error:', error);
            
            if (isMounted) {
              // Don't show API errors to users, just treat as not logged in
              document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              try { localStorage.removeItem('sessionId'); } catch(e) {}
              setSessionId(null);
            }
          }
        }
      } catch (err) {
        console.error('Error in session management:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchSession();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);
  
  const signOut = async () => {
    if (sessionId) {
      try {
        // Call API to invalidate session
        try {
          await fetch('/api/auth/signout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionId}`
            },
            body: JSON.stringify({ sessionId }),
          });
        } catch (apiError) {
          console.warn('API signout error (continuing with local signout):', apiError);
        }
        
        // Clear the cookie (more thorough approach)
        document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
        document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        // Clear localStorage
        try {
          localStorage.removeItem('sessionId');
        } catch (storageError) {
          console.warn('localStorage clear error:', storageError);
        }
        
        // Update state
        setSessionId(null);
        setUser(null);
        
        console.log('Sign out successful');
        
        // Redirect to home page instead of login
        router.push('/');
        
        // Force refresh the page to ensure all components update
        setTimeout(() => {
          router.refresh();
        }, 100);
      } catch (err) {
        console.error('Error signing out:', err);
        
        // Fallback: force clear everything
        document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        try { localStorage.removeItem('sessionId'); } catch(e) {}
        setSessionId(null);
        setUser(null);
        
        // Force refresh the window
        window.location.href = '/';
      }
    }
  };
  
  const requireAuth = () => {
    if (!isLoading && !sessionId) {
      router.push('/login');
    }
  };

  return {
    sessionId,
    user,
    isLoading,
    error,
    signOut,
    requireAuth
  };
}

export default useSession;