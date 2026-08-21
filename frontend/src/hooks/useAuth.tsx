import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  role: 'student' | 'educator';
};

type AuthContextType = {
  user: User | null;
  login: (role: 'student' | 'educator') => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For demo MVP, we hardcode the seed IDs to match the database/seed.sql
const DEMO_USERS = {
  student: { id: '00000000-0000-0000-0000-000000000002', name: 'Ada Lovelace', role: 'student' as const },
  educator: { id: '00000000-0000-0000-0000-000000000001', name: 'Prof. Alan Turing', role: 'educator' as const },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    const stored = localStorage.getItem('cogniva_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = (role: 'student' | 'educator') => {
    const usr = DEMO_USERS[role];
    setUser(usr);
    localStorage.setItem('cogniva_user', JSON.stringify(usr));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cogniva_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
