"use client";

import React, { createContext, useEffect, useState } from 'react';
import useSession from '@/hooks/useSession';

// Create a session context
export const SessionContext = createContext<{
  initialized: boolean;
}>({
  initialized: false,
});

// This component will be used in the layout.tsx to ensure session is loaded
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useSession();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitialized(true);
    }
  }, [isLoading]);

  return (
    <SessionContext.Provider value={{ initialized }}>
      {children}
    </SessionContext.Provider>
  );
}