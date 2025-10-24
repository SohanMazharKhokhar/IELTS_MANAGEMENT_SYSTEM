// src/pages/UsersManagement.tsx - Updated

import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import AddUserModal from '../components/AddUserModal';
import { PlusIcon, TrashIcon } from '../components/icons';
import { UserFormInputs } from '../components/AddUserModal'; // Import the form types

const USERS_STORAGE_KEY = 'ielts_app_users';
const CURRENT_ADMIN_USER_ID = '1'; // Placeholder for the currently logged-in admin user ID

// Helper function to get users from localStorage
const getInitialUsers = (): AppUser[] => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  return storedUsers ? JSON.parse(storedUsers) : [];
};

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>(getInitialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>(undefined); // NEW state for editing

  // Effect to save users to localStorage whenever the 'users' state changes
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);
  
  // Handlers for Modal
  const handleCreateClick = () => {
    setEditingUser(undefined); // Set to undefined for Create action
    setIsModalOpen(true);
  };

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user); // Set the user to edit
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(undefined); // Clear editing state
  };

  // Handler to create or update a user
  const handleSaveUser = async (
    data: UserFormInputs,
    userId?: string
  ): Promise<boolean> => {
    // Check for duplicate email, excluding the user being edited
    if (users.some(u => u.email === data.email && u.id !== userId)) {
      return false; // Indicate failure (email already exists)
    }

    if (userId) {
      // Logic for EDITING
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              ...data,
              editedAt: new Date().toISOString(),
              editedBy: CURRENT_ADMIN_USER_ID,
            } 
          : u
      ));
    } else {
      // Logic for CREATING NEW USER (with default values for new fields)
      const newUser: AppUser = {
        ...data,
        id: new Date().toISOString(),
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate random code
        referredBy: undefined, 
        discounted: false,
        createdBy: CURRENT_ADMIN_USER_ID, // Use the current admin user's ID
        createdAt: new Date().toISOString(),
        // Auditing fields start empty
        editedBy: undefined,
        editedAt: undefined,
        deletedBy: undefined,
        deletedAt: undefined,
      };

      setUsers(prevUsers => [...prevUsers, newUser]);
    }
    return true; // Indicate success
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-500 mt-1">Create and manage your app's users.</p>
        </div>
        <button
          onClick={handleCreateClick} // Use the new handler
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="mr-2" />
          Create New User
        </button>
      </div>

      {/* User List Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* PRIMARY COLUMNS */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              
              {/* NEW COLUMNS */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted</th>
              
              {/* AUDIT COLUMNS - Condensed to avoid massive table */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>

              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{user.id.substring(0, 5)}...</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'Editor' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                
                {/* NEW DATA CELLS */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.referralCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.referredBy || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-semibold ${user.discounted ? 'text-green-600' : 'text-red-600'}`}>
                        {user.discounted ? 'Yes' : 'No'}
                    </span>
                </td>

                {/* CREATED AT */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleEditClick(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  No users found. Click "Create New User" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal} // Use the new handler
        editingUser={editingUser} // Pass the user being edited
        onSaveUser={handleSaveUser} // Use the combined save handler
      />
    </>
  );
};

export default UsersManagement;