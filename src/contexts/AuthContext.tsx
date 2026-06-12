import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('leadflow_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('leadflow_user');
      }
    }
    setLoading(false);
  }, []);

  const signup = useCallback(async (
    fullName: string,
    email: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if username already exists
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUsername) {
        return { success: false, error: 'Username already exists' };
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingEmail) {
        return { success: false, error: 'Email already exists' };
      }

      // Create user (in production, use proper password hashing with bcrypt on backend)
      const { data, error } = await supabase
        .from('users')
        .insert({
          full_name: fullName,
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password_hash: password // In production, this should be hashed server-side
        })
        .select()
        .single();

      if (error || !data) {
        return { success: false, error: 'Failed to create account. Please try again.' };
      }

      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try to find user by username or email
      const { data: userByUsername } = await supabase
        .from('users')
        .select('*')
        .eq('username', identifier.toLowerCase())
        .single();

      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', identifier.toLowerCase())
        .single();

      const userData = userByUsername || userByEmail;

      if (!userData) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Verify password (in production, use proper password comparison)
      if (userData.password_hash !== password) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Create user object without password
      const user: User = {
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        username: userData.username,
        created_at: userData.created_at
      };

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('leadflow_user', JSON.stringify(user));
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('leadflow_user');
  }, []);

  const value = useMemo(() => ({ isAuthenticated, user, login, signup, logout, loading }), [isAuthenticated, user, login, signup, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
