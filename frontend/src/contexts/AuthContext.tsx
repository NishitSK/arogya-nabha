import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedApiCall } from '../lib/api';

interface AuthContextType {
  token: string | null;
  user: any | null;
  role: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getPayloadFromToken(token: string | null): any {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async (authToken: string) => {
    const payload = getPayloadFromToken(authToken);
    if (!payload || !payload.role) {
      setLoading(false);
      return;
    }
    setRole(payload.role);
    const apiUrl = payload.role === 'doctor' ? '/api/doctor/me' : '/api/patient/me';
    
    try {
      // Store current token temporarily for this call
      const currentToken = localStorage.getItem('token');
      localStorage.setItem('token', authToken);
      
      const data = await authenticatedApiCall(apiUrl);
      setUser(data);
      setLoading(false);
      
      // Restore original token
      if (currentToken) {
        localStorage.setItem('token', currentToken);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setLoading(true);
    fetchUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
    navigate('/login');
  };

  const refetchUser = () => {
    if (token) {
      setLoading(true);
      fetchUser(token);
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, role, loading, login, logout, refetchUser }}>
      {!loading && children}
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
