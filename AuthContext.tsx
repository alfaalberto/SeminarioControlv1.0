





import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db, firebase } from './firebase/config';
import { Professor } from './types';

type FirebaseUser = firebase.User;

interface AuthContextType {
  user: Professor | null;
  loading: boolean;
  login: (email: string, password_param: string) => Promise<void>;
  logout: () => Promise<void>;
  firestoreError: firebase.firestore.FirestoreError | null;
  isFirstRun: boolean;
  retryInitialization: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<firebase.firestore.FirestoreError | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [retryToggle, setRetryToggle] = useState(false);

  const retryInitialization = () => {
    setLoading(true);
    setFirestoreError(null);
    setIsFirstRun(false);
    setRetryToggle(prev => !prev);
  };

  useEffect(() => {
    let authUnsubscribe: (() => void) | undefined;
    let firestoreUnsubscribe: (() => void) | undefined;

    const initializeApp = async () => {
      setLoading(true); // Ensure loading is true at the start of each attempt
      try {
        // Step 1: Attempt to enable persistence. This can be our first check.
        try {
          await db.enablePersistence({ synchronizeTabs: true });
        } catch (err: any) {
          if (err.code === 'failed-precondition') {
            // This is fine, just means multiple tabs are open.
          } else {
            // Re-throw other errors to be caught by the main try-catch
            throw err;
          }
        }
        
        // Step 2: Check for first run, but ensure we are connected to the server to make this decision.
        const usersSnapshot = await db.collection('users').limit(1).get({ source: 'server' });
        if (usersSnapshot.empty) {
            console.log("🚀 First run detected! No users in the database. Initializing setup flow.");
            setIsFirstRun(true);
            setLoading(false);
            return; // Stop here, show setup screen.
        }

        // Step 3: If not first run, set up the auth listener.
        authUnsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
          if (firestoreUnsubscribe) {
            firestoreUnsubscribe();
          }

          if (firebaseUser) {
            firestoreUnsubscribe = db.collection('users').doc(firebaseUser.uid).onSnapshot(
              (doc) => {
                if (doc.exists) {
                  setUser({ id: doc.id, ...doc.data() } as Professor);
                } else {
                   console.warn(`User ${firebaseUser.uid} authenticated but has no Firestore profile. Signing out.`);
                  auth.signOut();
                  setUser(null);
                }
                setLoading(false);
              },
              (error) => {
                // This listener might also get an 'unavailable' error if connection is lost later.
                console.error("Firestore listener error:", error);
                setFirestoreError(error); // Show the error screen if connection drops.
                setLoading(false);
              }
            );
          } else {
            setUser(null);
            setLoading(false);
          }
        });

      } catch (err: any) {
        // MAIN CATCH BLOCK: This will catch errors from enablePersistence AND the .get() call.
        if (err.code === 'unavailable') {
          console.log(
            "%cSEPI APP: ¡Acción requerida!%c\n\nError 'unavailable' detectado. Esto es esperado si la base de datos Firestore aún no ha sido creada.\n\nLa aplicación mostrará una guía con los pasos para solucionarlo. Por favor, sigue las instrucciones en pantalla.",
            "color: #ef4444; font-weight: bold; font-size: 14px;",
            "color: initial; font-weight: normal; font-size: initial;"
          );
          setFirestoreError(err as firebase.firestore.FirestoreError);
        } else {
          // For any other unexpected initialization error
          console.error("An unexpected error occurred during app initialization:", err);
          setFirestoreError(err as firebase.firestore.FirestoreError);
        }
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (firestoreUnsubscribe) firestoreUnsubscribe();
    };
  }, [retryToggle]);

  const login = async (email: string, password_param: string): Promise<void> => {
    try {
      await auth.signInWithEmailAndPassword(email, password_param);
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      throw error;
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };
  
  const value = { user, loading, login, logout, firestoreError, isFirstRun, retryInitialization };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};