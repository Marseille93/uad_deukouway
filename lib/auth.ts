import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'student' | 'landlord' | 'admin';
  bio?: string;
  avatarUrl?: string;
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Hook pour gérer l'authentification
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        return { 
          success: true, 
          user: {
            ...data.user,
            role: data.user.role
          }
        };
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Erreur de connexion'
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        return { success: true, user: data.user };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur de connexion';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null
        });
        return { success: true, user: data.user };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur lors de l\'inscription';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuth
  };
}