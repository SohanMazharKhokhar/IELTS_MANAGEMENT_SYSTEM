// src/hooks/useAuth.tsx - Add export to adminUsers

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types';

// This is now your "JSON file". Only users in this list can log in.
// --- ADD 'export' HERE ---
export const adminUsers: User[] = [
  // --- Core Admins ---
  { id: '1', name: 'Ahmad (Super Admin)', email: 'admin@ielts.com', password: 'password123' },
  { id: '2', name: 'Maria Sanchez (Admin)', email: 'maria@ielts.com', password: 'password789' },
  { id: '3', name: 'John Smith (Lead Admin)', email: 'john.smith@ielts.com', password: 'password111' },
  { id: '4', name: 'Emily Clark (Audit)', email: 'emily.clark@ielts.com', password: 'password222' },

  // --- Content Editors ---
  { id: '5', name: 'Alex Johnson (Editor)', email: 'editor@ielts.com', password: 'password456' },
  { id: '6', name: 'David Lee (Reading Editor)', email: 'david.lee@ielts.com', password: 'readedit' },
  { id: '10', name: 'Robert Green (Grammar Specialist)', email: 'robert.g@ielts.com', password: 'gram123' },

  // --- Marketing/Sales Admins ---
  { id: '11', name: 'Laura Martinez (Marketing)', email: 'laura.m@ielts.com', password: 'market1' },
  { id: '12', name: 'Kevin Hall (Affiliate Manager)', email: 'kevin.h@ielts.com', password: 'affiliate' },
  { id: '13', name: 'Olivia Scott (Sales)', email: 'olivia.s@ielts.com', password: 'sales' },

  // --- Support / QA ---
  { id: '14', name: 'Daniel King (Support Lead)', email: 'daniel.k@ielts.com', password: 'support1' },
  { id: '15', name: 'Grace Wilson (QA Tester)', email: 'grace.w@ielts.com', password: 'qauser' },

  // --- Additional General Admins ---
  { id: '16', name: 'Ryan Adams', email: 'ryan.a@ielts.com', password: 'testuser1' },
  { id: '17', name: 'Chloe Baker', email: 'chloe.b@ielts.com', password: 'testuser2' }
];
const CURRENT_USER_STORAGE_KEY = 'ielts_admin_current_user';

const getCurrentUserFromStorage = (): User | null => {
    const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUserFromStorage());

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check against the hardcoded adminUsers list
    const user = adminUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  // We removed the signup function
  const value = { currentUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};