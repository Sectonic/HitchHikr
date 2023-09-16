import { createContext, useContext } from 'react';
import useStorageState from './secureStorage';

const AuthContext = createContext(null);

export function SessionProvider(props) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: async (email, password) => {

          const request = await fetch(`${process.env.API_URL}/accounts/login?` + new URLSearchParams({ email, password }));
          const data = await request.json();

          if (!request.ok) return { success: false, message: data.description };

          setSession(data.user_id);
          return { success: true }

        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}