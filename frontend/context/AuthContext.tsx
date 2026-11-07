'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AuthUser, 
  loginUser, 
  registerUser, 
  fetchCurrentUser, 
  logoutUser, 
  forgotPasswordRequest, 
  resetPasswordRequest, 
  updateUserProfile, 
  changeUserPassword 
} from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  register: (payload: { full_name: string; email: string; password: string; confirm_password?: string; phone?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; token?: string | null }>;
  resetPassword: (payload: { token: string; new_password: string; confirm_password?: string }) => Promise<{ message: string }>;
  updateProfile: (payload: { full_name?: string; phone?: string }) => Promise<AuthUser>;
  changePassword: (payload: { old_password: string; new_password: string; confirm_password?: string }) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'railassist_auth_token';
const REMEMBER_KEY = 'railassist_remember_me';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          try {
            const currentUser = await fetchCurrentUser(storedToken);
            if (isMounted) {
              setUser(currentUser);
              setToken(storedToken);
            }
          } catch {
            // Token is invalid/expired
            localStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REMEMBER_KEY);
            if (isMounted) {
              setUser(null);
              setToken(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (emailOrUsername: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email_or_username: emailOrUsername, password, remember_me: rememberMe });
      setUser(res.user);
      setToken(res.token);

      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(REMEMBER_KEY, 'true');
        sessionStorage.removeItem(TOKEN_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, res.token);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: {
    full_name: string;
    email: string;
    password: string;
    confirm_password?: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await registerUser(payload);
      setUser(res.user);
      setToken(res.token);
      // Store in session storage by default
      sessionStorage.setItem(TOKEN_KEY, res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutUser().catch(() => {});
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return await forgotPasswordRequest(email);
  }, []);

  const resetPassword = useCallback(async (payload: { token: string; new_password: string; confirm_password?: string }) => {
    return await resetPasswordRequest(payload);
  }, []);

  const updateProfile = useCallback(async (payload: { full_name?: string; phone?: string }) => {
    if (!token) throw new Error('Not authenticated');
    const updatedUser = await updateUserProfile(token, payload);
    setUser(updatedUser);
    return updatedUser;
  }, [token]);

  const changePassword = useCallback(async (payload: { old_password: string; new_password: string; confirm_password?: string }) => {
    if (!token) throw new Error('Not authenticated');
    return await changeUserPassword(token, payload);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

