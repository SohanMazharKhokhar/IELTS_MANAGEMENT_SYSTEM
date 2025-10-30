// src/pages/UsersManagement.tsx

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { AppUser, User, AppUserRole } from '../types';
import AddUserModal from '../components/AddUserModal';
import { PlusIcon, TrashIcon } from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import { logActivity } from '../utils/activityLogger';
// Import our new API helper
import { apiFetch } from '../utils/apiService';

/**
 * Helper function to get the numerical level of a role.
 */
const getRoleLevel = (role: AppUserRole | User['role'] | undefined): number => {
    switch (role) {
        case 'SuperAdmin': return 4;
        case 'Admin': return 3;
        case 'Editor': return 2;
        case 'User': return 1;
        default: return 0;
    }
};

// Props expected by the UsersManagement component
interface UsersManagementProps {
    currentUserRole: User['role'];
    currentUserId: string;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ currentUserRole, currentUserId }) => {
  // State for the list of users, modal visibility, and user being edited
  const [users, setUsers] = useState<AppUser[]>([]); // Start with an empty array
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>(undefined);
  const { currentUser } = useAuth(); // Get full current user for logging name
  const currentUserLevel = getRoleLevel(currentUserRole);

  const [searchQuery, setSearchQuery] = useState('');

  // --- (NEW) Function to fetch all users from the API ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/users', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      
      // --- (THIS IS THE FIX) ---
      // 1. Log the data to your console to see its structure
      console.log("API response for /users:", data);

      // 2. Access the array inside the data object.
      // Your API probably sends { "users": [...] } or { "data": [...] }
      // Change 'data.users' to match your API structure.
      const usersArray = data.users; // <-- THIS IS THE LIKELY FIX. CHANGE 'users' if needed.

      if (!Array.isArray(usersArray)) {
        console.error("Fetched data is not an array:", usersArray);
        throw new Error("Invalid data format from API");
      }
      
      setUsers(usersArray as AppUser[]);
      // --- END OF FIX ---

    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set to empty array on error to prevent crash
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- (MODIFIED) Load users from API on component mount ---
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- (MODIFIED) Filter the user list based on search query ---
  const filteredUsers = users.filter(user => {
    if (!user || !user.firstName || !user.lastName) return false; // Add safety check
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // --- (MODIFIED) Handler for saving/updating a user ---
  const handleSaveUser = useCallback(async (data: any, userId?: string): Promise<boolean> => {
    const loggedInUserName = currentUser?.name || 'Admin';
    const userNameForLog = `${data.firstName} ${data.lastName}`;

    try {
      let response: Response;
      if (userId) {
        // --- EDIT User (PUT) ---
        response = await apiFetch(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update user');
        logActivity(`updated user '${userNameForLog}' (Role: ${data.role})`, loggedInUserName);

      } else {
        // --- CREATE User (POST) ---
        // Using /register endpoint as provided
        response = await apiFetch('/users/register', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create user');
        logActivity(`created new user '${userNameForLog}' with role '${data.role}'`, loggedInUserName);
      }

      await fetchUsers(); // Refresh the user list from the server
      return true; // Indicate success

    } catch (error) {
      console.error("Error saving user:", error);
      // You could parse the response error here and show it
      return false; // Indicate failure
    }
  }, [currentUser, fetchUsers]); // <-- Dependencies for useCallback

  // --- (MODIFIED) Handler for deleting a user ---
  const handleRemoveUser = useCallback(async (userToDelete: AppUser) => {
    const loggedInUserName = currentUser?.name || 'Admin';

    // ... (Permission checks remain the same) ...
    if (userToDelete.id === currentUserId) {
        alert('Error: You cannot delete your own account from this panel.');
        return;
    }
    if (getRoleLevel(userToDelete.role) >= currentUserLevel && currentUserRole !== 'SuperAdmin') {
        alert(`Error: You do not have permission to delete users with role '${userToDelete.role}' or higher.`);
        return;
    }
    
    if (window.confirm(`Are you sure you want to delete user: ${userToDelete.firstName} ${userToDelete.lastName}?`)) {
      try {
        const response = await apiFetch(`/users/${userToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        
        logActivity(`deleted user '${userToDelete.firstName} ${userToDelete.lastName}'`, loggedInUserName);
        await fetchUsers(); // Refresh the list
        
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  }, [currentUser, currentUserId, currentUserLevel, currentUserRole, fetchUsers]); // <-- Dependencies

  // --- (UNCHANGED) Handlers for modal clicks ---
  const handleCreateClick = useCallback(() => {
      setEditingUser(undefined); 
      setIsModalOpen(true);
  }, []); 
  
  const handleEditClick = useCallback((user: AppUser) => {
       const userLevel = getRoleLevel(user.role);
       const isSelf = user.id === currentUserId;
       if (!isSelf && userLevel >= currentUserLevel && currentUserRole !== 'SuperAdmin') {
           alert(`You do not have permission to edit users with role '${user.role}' or higher.`); return;
       }
      setEditingUser(user);
      setIsModalOpen(true);
   }, [currentUserId, currentUserLevel, currentUserRole]); 
   
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(undefined);
  }, []); 

  return (
    <>
      {/* Page Header (Unchanged) */}
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
            <p className="text-gray-500 mt-1">Manage Admins, Editors, and Users based on your role.</p>
          </div>
          {currentUserLevel > getRoleLevel('User') && (
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
               >
                  <PlusIcon className="mr-2 h-4 w-4" /> Create New User
              </button>
          )}
      </div>

      {/* Search Filter Input (Unchanged) */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* User Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* --- (MODIFIED) Added Status column --- */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edited At</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-500">Loading users...</td></tr>
            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => {
                // Add safety check for bad data
                if (!user || !user.id) return null;

                const userLevel = getRoleLevel(user.role);
                const isSelf = user.id === currentUserId;

                const canEdit = isSelf || (userLevel < currentUserLevel) || (currentUserRole === 'SuperAdmin' && !isSelf);
                const canDelete = !isSelf && (userLevel < currentUserLevel || currentUserRole === 'SuperAdmin');

                return (
                    <tr key={user.id}>
                        {/* --- (MODIFIED) Table Cells --- */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName} {isSelf ? '(You)' : ''}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'Editor' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        {/* --- (NEW) Status Cell --- */}
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                           }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.referralCode || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.discountAmount !== null ? `${user.discountAmount}%` : 'None'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.editedAt ? new Date(user.editedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                           <button onClick={() => handleEditClick(user)} className={`text-indigo-600 hover:text-indigo-900 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!canEdit} title={!canEdit ? "Cannot edit" : "Edit user"}>Edit</button>
                           <button onClick={() => handleRemoveUser(user)} className={`text-red-500 hover:text-red-700 ml-2 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!canDelete} title={!canDelete ? "Cannot delete" : "Delete user"}><TrashIcon className="w-5 h-5" /></button>
                        </td>
                    </tr>
                );
            }) : (
              <tr><td colSpan={8} className="text-center py-10 text-gray-500">
                {searchQuery ? 'No users found matching your search.' : 'No users created yet.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add User Modal (Unchanged, props are now fed by API-driven state) */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onAddUser={handleSaveUser as any} 
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default UsersManagement;