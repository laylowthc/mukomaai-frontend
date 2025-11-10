'use client';

import React, { useMemo, type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const firebaseServices = useMemo(() => {
    if (isMounted) {
      // Initialize Firebase on the client side, once the component is mounted.
      return initializeFirebase();
    }
    return null;
  }, [isMounted]); 

  if (!firebaseServices) {
    // On the server and on the initial client render, return null or a loading state
    // to prevent hydration mismatch. Children will be rendered on the next pass.
    return null; 
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
