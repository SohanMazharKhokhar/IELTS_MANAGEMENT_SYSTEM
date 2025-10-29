// src/hooks/useAuth.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
// User type now includes specific PortalUserRole
import { User, PortalUserRole } from '../types';
import { logActivity } from '../utils/activityLogger'; // Assuming path is correct

// --- Assign Roles directly in the list ---
// Ensure only ONE SuperAdmin
export const adminUsers: User[] = [
  // SuperAdmin (Exactly ONE)
  { id: '1', name: 'Ahmad (Super Admin)', email: 'admin@ielts.com', password: 'password123', role: 'SuperAdmin' },

  // Admins
  { id: '2', name: 'Maria Sanchez (Admin)', email: 'maria@ielts.com', password: 'password789', role: 'Admin' },
  { id: '3', name: 'John Smith (Lead Admin)', email: 'john.smith@ielts.com', password: 'password111', role: 'Admin' },
  { id: '4', name: 'Emily Clark (Audit)', email: 'emily.clark@ielts.com', password: 'password222', role: 'Admin' },

  // Editors (These users see EditorTaskView)
  { id: '5', name: 'Alex Johnson (Editor)', email: 'editor@ielts.com', password: 'password456', role: 'Editor' },
  { id: '6', name: 'David Lee (Reading Editor)', email: 'david.lee@ielts.com', password: 'readedit', role: 'Editor' },
  { id: '10', name: 'Robert Green (Grammar Specialist)', email: 'robert.g@ielts.com', password: 'gram123', role: 'Editor' },
  { id: '11', name: 'Laura Martinez (Marketing)', email: 'laura.m@ielts.com', password: 'market1', role: 'Editor' },
  { id: '12', name: 'Kevin Hall (Affiliate Manager)', email: 'kevin.h@ielts.com', password: 'affiliate', role: 'Editor' },
  { id: '13', name: 'Olivia Scott (Sales)', email: 'olivia.s@ielts.com', password: 'sales', role: 'Editor' },
  { id: '14', name: 'Daniel King (Support Lead)', email: 'daniel.k@ielts.com', password: 'support1', role: 'Editor' },
  { id: '15', name: 'Grace Wilson (QA Tester)', email: 'grace.w@ielts.com', password: 'qauser', role: 'Editor' },
  { id: '16', name: 'Ryan Adams', email: 'ryan.a@ielts.com', password: 'testuser1', role: 'Editor' },
  { id: '17', name: 'Chloe Baker', email: 'chloe.b@ielts.com', password: 'testuser2', role: 'Editor' }
];
// ------------------------------------

const CURRENT_USER_STORAGE_KEY = 'ielts_admin_current_user';

const getCurrentUserFromStorage = (): User | null => {
    const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            // Validate essential fields including role
            if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role && ['SuperAdmin', 'Admin', 'Editor'].includes(parsedUser.role)) {
                return parsedUser as User;
            } else {
                 console.warn("Stored user data is invalid or missing role. Clearing.");
                 localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
            }
        } catch (error) {
            console.error("Error parsing current user from storage:", error);
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY); // Clear invalid data
        }
    }
    return null;
};

interface AuthContextType {
  currentUser: User | null; // currentUser object includes role
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUserFromStorage());

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = adminUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      logActivity(`logged in`, user.name);
      return true;
    }
    // Optional: Log failed login attempts?
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity(`logged out`, currentUser.name);
    }
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const value = { currentUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};