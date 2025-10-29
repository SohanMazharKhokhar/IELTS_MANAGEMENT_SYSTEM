// src/pages/UsersManagement.tsx

import React from 'react';
import { useState, useEffect, useCallback } from 'react'; // <-- IMPORT useCallback
// Make sure these types include the latest role definitions
import { AppUser, User, AppUserRole } from '../types';
import AddUserModal from '../components/AddUserModal';
import { PlusIcon, TrashIcon } from '../components/icons';
// Import the list of admin users and the auth hook
import { adminUsers, useAuth } from '../hooks/useAuth';
// Import the activity logger
import { logActivity } from '../utils/activityLogger';

/**
 * Helper function to get the numerical level of a role for comparison.
 * Handles potential undefined roles gracefully.
 */
const getRoleLevel = (role: AppUserRole | User['role'] | undefined): number => {
    switch (role) {
        case 'SuperAdmin': return 4;
        case 'Admin': return 3;
        case 'Editor': return 2;
        case 'User': return 1;
        default: return 0; // Unknown or undefined role has the lowest level
    }
};

/**
 * Converts the User object (from auth) to the AppUser object (for management).
 * Ensures all necessary AppUser fields are populated.
 */
const convertAdminToAppUser = (user: User): AppUser => {
    const parts = user.name.split(' ');
    const firstName = parts[0] || 'Unknown'; // Fallback for name
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Admin';
    // Use the role defined in the User object, casting it to AppUserRole
    const role = user.role as AppUserRole;

    return {
        id: user.id,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        password: user.password, // Note: Storing plain passwords is insecure
        role: role,
        referralCode: `ADMIN-${user.id}`, // Example referral code
        // Example initial discount based on role
        discountAmount: (getRoleLevel(role) >= getRoleLevel('Editor')) ? 5 : null,
        referredBy: 'System',
        createdBy: 'System', // Mark initial users as system-created
        createdAt: new Date().toISOString(),
        editedBy: undefined, // Initialize audit fields
        editedAt: undefined,
        deletedBy: undefined,
        deletedAt: undefined,
    };
};

// Key for storing app users in localStorage
const USERS_STORAGE_KEY = 'ielts_app_users';

/**
 * Loads the initial list of AppUsers.
 * Tries localStorage first, falls back to converting adminUsers if empty or invalid.
 */
const getInitialUsers = (): AppUser[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      // Validate that it's a non-empty array before returning
      if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
        console.log("[UsersManagement] Loaded users from localStorage:", parsedUsers.length);
        return parsedUsers;
      }
      // Log if stored data is empty or invalid but proceed to initialize
      console.warn("[UsersManagement] localStorage user data is empty or invalid. Re-initializing.");
    } else {
      console.log("[UsersManagement] No user data found in localStorage. Initializing.");
    }

    // Initialize with default admin users if localStorage is empty/invalid
    console.log('[UsersManagement] Initializing list with default admin users.');
    const initialAppUsers = adminUsers.map(convertAdminToAppUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialAppUsers));
    return initialAppUsers;

  } catch (error) {
    console.error("[UsersManagement] CRITICAL ERROR loading/parsing users from localStorage:", error);
    // Attempt to recover by resetting with default admin users
    try {
        console.warn('[UsersManagement] Attempting recovery by initializing with default admin users.');
        const initialAppUsers = adminUsers.map(convertAdminToAppUser);
        localStorage.removeItem(USERS_STORAGE_KEY); // Clear potentially corrupted key
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialAppUsers));
        return initialAppUsers;
    } catch (initError) {
        console.error("[UsersManagement] CRITICAL ERROR during recovery initialization:", initError);
        return []; // Return empty array as the absolute last resort
    }
  }
};

// Props expected by the UsersManagement component from App.tsx
interface UsersManagementProps {
    currentUserRole: User['role'];
    currentUserId: string;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ currentUserRole, currentUserId }) => {
  // State for the list of users, modal visibility, and user being edited
  const [users, setUsers] = useState<AppUser[]>(getInitialUsers); // Load initial users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>(undefined);
  const { currentUser } = useAuth(); // Get full current user for logging name
  const currentUserLevel = getRoleLevel(currentUserRole); // Get level of logged-in user

  // Effect to save the user list to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Error saving users to localStorage:", error);
    }
  }, [users]);

  // Filter the user list based on role hierarchy
  // New rule: SuperAdmin, Admin, and Editor can "View All Users".
  const filteredUsers = users;

  // Handler for saving a new user or updating an existing one
  const handleSaveUser = useCallback(async (data: any, userId?: string): Promise<boolean> => {
    const assignedRoleLevel = getRoleLevel(data.role as AppUserRole);
    const loggedInUserName = currentUser?.name || 'Admin';
    const userBeingEdited = users.find(u => u.id === userId);

    // --- Permission Checks ---

    // Rule for "1 Super Admin"
    if (data.role === 'SuperAdmin' && (!userId || (userId && userBeingEdited?.role !== 'SuperAdmin'))) {
        const superAdminExists = users.some(u => u.role === 'SuperAdmin' && u.id !== userId);
        if (superAdminExists) {
            alert('Error: A SuperAdmin account already exists. Cannot create or assign another.');
            return false;
        }
    }
    
    // Check if the current user has permission to *assign* this role
    if (assignedRoleLevel > currentUserLevel && currentUserRole !== 'SuperAdmin') {
         alert(`Error: You do not have permission to assign the role '${data.role}'.`); return false;
    }

    // Check if the current user has permission to *edit* this user (if editing)
    if (userId && userBeingEdited && getRoleLevel(userBeingEdited.role) > currentUserLevel && currentUserRole !== 'SuperAdmin') {
         alert(`Error: You do not have permission to edit users with role '${userBeingEdited.role}'.`); return false;
    }
    
    // Check for duplicate email
    if (users.some(u => u.email === data.email && u.id !== userId)) {
        alert('Error: An account with this email already exists.'); return false;
     }
    // --- End Permission Checks ---

    const discountValue = data.discountAmount ? parseFloat(data.discountAmount) : null;
    const userNameForLog = `${data.firstName} ${data.lastName}`;

    if (userId) { // --- EDIT User ---
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                
                // --- THIS IS THE FIX ---
                // This check now correctly skips itself (u.id !== currentUserId)
                if (getRoleLevel(u.role) >= currentUserLevel && currentUserRole !== 'SuperAdmin' && u.id !== currentUserId) {
                    return u; // Return original user, no update
                }

                // Return the updated user object
                return { 
                    ...u,
                    firstName: data.firstName, lastName: data.lastName, email: data.email,
                    password: data.password || u.password, // Keep old pass if new one is blank in modal
                    role: data.role, // Update role
                    referralCode: data.referralCode, discountAmount: discountValue, // Update discount
                    editedAt: new Date().toISOString(), editedBy: currentUserId, // Set audit fields
                };
            }
            return u; // Return unchanged user
        }));
        logActivity(`updated user '${userNameForLog}' (Role: ${data.role})`, loggedInUserName);
    } else { // --- CREATE User ---
        const newUser: AppUser = {
            id: crypto.randomUUID(), // Use crypto for better unique IDs
            firstName: data.firstName, lastName: data.lastName, email: data.email,
            password: data.password, role: data.role,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate random code
            discountAmount: discountValue, referredBy: undefined,
            createdBy: currentUserId, createdAt: new Date().toISOString(),
            // Initialize other fields as undefined
            editedAt: undefined, editedBy: undefined, deletedAt: undefined, deletedBy: undefined,
        };
        setUsers(prevUsers => [...prevUsers, newUser]); // Add new user to state
        logActivity(`created new user '${userNameForLog}' with role '${newUser.role}'`, loggedInUserName);
    }
    return true; // Indicate success
  }, [currentUser, currentUserLevel, currentUserId, users]); // <-- Dependencies for useCallback

  // Handler for deleting a user with hierarchy check
  const handleRemoveUser = useCallback((userToDelete: AppUser) => {
    const userToDeleteLevel = getRoleLevel(userToDelete.role);
    const loggedInUserName = currentUser?.name || 'Admin';

    // Rule check: "Can Not... DELETE Own Profile"
    if (userToDelete.id === currentUserId) {
        alert('Error: You cannot delete your own account from this panel.');
        return;
    }

    // Prevent deleting users with roles >= own level (unless SuperAdmin)
    if (userToDeleteLevel >= currentUserLevel && currentUserRole !== 'SuperAdmin') {
        alert(`Error: You do not have permission to delete users with role '${userToDelete.role}' or higher.`);
        return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${userToDelete.firstName} ${userToDelete.lastName}?`)) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id)); // Remove user from state
      logActivity(`deleted user '${userToDelete.firstName} ${userToDelete.lastName}'`, loggedInUserName);
    }
  }, [currentUser, currentUserId, currentUserLevel, currentUserRole]); // <-- Dependencies for useCallback

  // Handlers to control the Add/Edit User modal
  const handleCreateClick = useCallback(() => {
      // Editors can now create users.
      setEditingUser(undefined); // Set to undefined for 'create' mode
      setIsModalOpen(true);
  }, []); // <-- Empty dependency array, function is stable
  
  const handleEditClick = useCallback((user: AppUser) => {
       const userLevel = getRoleLevel(user.role);
       const isSelf = user.id === currentUserId;

       // Rule check: Allow self-edit, OR check hierarchy for editing others
       if (isSelf) {
            // This is allowed (Rule: "Can... UPDATE, Own Profile")
       } else if (userLevel >= currentUserLevel && currentUserRole !== 'SuperAdmin') {
           // This is not allowed (e.g., Admin trying to edit another Admin)
           alert(`You do not have permission to edit users with role '${user.role}' or higher.`); return;
       }
      setEditingUser(user); // Set the user object for 'edit' mode
      setIsModalOpen(true);
   }, [currentUserId, currentUserLevel, currentUserRole]); // <-- Dependencies for useCallback
   
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(undefined); // Clear editing state when modal closes
  }, []); // <-- Empty dependency array, function is stable

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
            <p className="text-gray-500 mt-1">Manage Admins, Editors, and Users based on your role.</p>
          </div>
          {/* Show Create button to all portal roles (SA, Admin, Editor) */}
          {currentUserLevel > getRoleLevel('User') && (
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
               >
                  <PlusIcon className="mr-2 h-4 w-4" /> Create New User
              </button>
          )}
      </div>

      {/* User Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Table Headers */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edited By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edited At</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Map over filtered users */}
            {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const userLevel = getRoleLevel(user.role);
                const isSelf = user.id === currentUserId;

                // Rule: You can edit yourself OR users at a lower level.
                const canEdit = isSelf || (userLevel < currentUserLevel) || (currentUserRole === 'SuperAdmin' && !isSelf);
                
                // Rule: You can delete users at a lower level, but NOT yourself.
                const canDelete = !isSelf && (userLevel < currentUserLevel || currentUserRole === 'SuperAdmin');


                return (
                    <tr key={user.id}>
                        {/* Table Cells - Render user data */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{user.id.substring(0, 5)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName} {isSelf ? '(You)' : ''}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {/* Role Badge with specific styles */}
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'Editor' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800' // Style for User
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.referralCode || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.referredBy || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.discountAmount !== null ? `${user.discountAmount}%` : 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdBy || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.editedBy || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.editedAt ? new Date(user.editedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        {/* Action Buttons with conditional disabling */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                           <button onClick={() => handleEditClick(user)} className={`text-indigo-600 hover:text-indigo-900 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!canEdit} title={!canEdit ? "Cannot edit" : "Edit user"}>Edit</button>
                           <button onClick={() => handleRemoveUser(user)} className={`text-red-500 hover:text-red-700 ml-2 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!canDelete} title={!canDelete ? "Cannot delete" : "Delete user"}><TrashIcon className="w-5 h-5" /></button>
                        </td>
                    </tr>
                );
            }) : (
              // Empty state row
              <tr><td colSpan={11} className="text-center py-10 text-gray-500">No users found matching your permissions or none created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onAddUser={handleSaveUser as any} // Cast might be needed
        currentUserRole={currentUserRole} // Pass role to modal for dropdown filtering
        currentUserId={currentUserId} // <-- FIX: Pass currentUserId
      />
    </>
  );
};

export default UsersManagement;
