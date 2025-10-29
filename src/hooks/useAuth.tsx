// src/hooks/useAuth.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
// User type now includes 'User' role
import { User, PortalUserRole, AppUser } from '../types';
import { logActivity } from '../utils/activityLogger'; // Assuming path is correct

// --- This list is now ONLY for seeding data if localStorage is empty ---
// (It's used by UsersManagement.tsx)
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
];
// ------------------------------------

const CURRENT_USER_STORAGE_KEY = 'ielts_admin_current_user';
// --- CHANGE: Use the same key as UsersManagement ---
const USERS_STORAGE_KEY = 'ielts_app_users';

const getCurrentUserFromStorage = (): User | null => {
    const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            // --- CHANGE: Validate against the new role list (which includes 'User') ---
            if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role && ['SuperAdmin', 'Admin', 'Editor', 'User'].includes(parsedUser.role)) {
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
    // --- CHANGE: Read from localStorage, not hardcoded list ---
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const allUsers: AppUser[] = storedUsers ? JSON.parse(storedUsers) : [];

    const user = allUsers.find(u => u.email === email && u.password === password);
    // ----------------------------------------------------

    if (user) {
      // --- CHANGE: Convert AppUser to User for context ---
      const userForContext: User = {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`, // Combine names
        email: user.email,
        password: user.password,
        role: user.role, // This now matches PortalUserRole
      };
      // ------------------------------------------------

      setCurrentUser(userForContext);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userForContext));
      logActivity(`logged in`, userForContext.name);
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
