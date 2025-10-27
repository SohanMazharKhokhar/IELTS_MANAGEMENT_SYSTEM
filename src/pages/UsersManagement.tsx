// src/pages/UsersManagement.tsx

import React, { useState, useEffect } from 'react';
import { AppUser, User } from '../types'; 
import AddUserModal from '../components/AddUserModal';
import { PlusIcon, TrashIcon } from '../components/icons';
import { adminUsers } from '../hooks/useAuth'; 

// Helper to convert admin users
const convertAdminToAppUser = (user: User): AppUser => {
    const parts = user.name.split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Admin';
    let role: AppUser['role'] = 'User';
    if (user.email.includes('admin') || user.name.includes('Super')) role = 'Admin';
    else if (user.name.includes('Editor') || user.name.includes('Specialist')) role = 'Editor';

    return {
        id: user.id,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        password: user.password,
        role: role,
        referralCode: `ADMIN-${user.id}`, 
        discountAmount: (role === 'Admin' || role === 'Editor') ? 5 : null, // Initial discount
        referredBy: 'System',
        createdBy: 'System', 
        createdAt: new Date().toISOString(),
        editedBy: undefined, 
        editedAt: undefined,
    };
};

const USERS_STORAGE_KEY = 'ielts_app_users';
const CURRENT_ADMIN_USER_ID = '1'; // Replace with actual logged-in user ID later

const getInitialUsers = (): AppUser[] => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    const initialAppUsers = adminUsers.map(convertAdminToAppUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialAppUsers));
    return initialAppUsers;
};


const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>(getInitialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>(undefined); 

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);
  
  const handleSaveUser = async (data: any, userId?: string): Promise<boolean> => {
    if (users.some(u => u.email === data.email && u.id !== userId)) {
      return false; 
    }

    // Convert discount input to number or null
    const discountValue = data.discountAmount ? parseFloat(data.discountAmount) : null;

    if (userId) {
      // EDIT existing user 
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId 
          ? { 
              ...u, 
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password || u.password, // Update password only if provided
              role: data.role, 
              referralCode: data.referralCode,
              discountAmount: discountValue, // Update discount

              editedAt: new Date().toISOString(),
              editedBy: CURRENT_ADMIN_USER_ID, 
            } 
          : u
      ));
    } else {
      // CREATE new user
      const newUser: AppUser = {
        id: new Date().toISOString(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountAmount: discountValue, // Save discount amount
        referredBy: undefined,
        createdBy: CURRENT_ADMIN_USER_ID, 
        createdAt: new Date().toISOString(),
        editedBy: undefined,
        editedAt: undefined,
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
    }
    return true;
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    }
  };
  
  const handleCreateClick = () => {
    setEditingUser(undefined); 
    setIsModalOpen(true);
  };

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user); 
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(undefined); 
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-500 mt-1">Create and manage your app's users.</p>
        </div>
        <button
          onClick={handleCreateClick} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="mr-2" />
          Create New User
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.referralCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.referredBy || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.discountAmount !== null ? `${user.discountAmount}%` : 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdBy || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.editedBy || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.editedAt ? new Date(user.editedAt).toLocaleDateString() : 'N/A'}
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
                <td colSpan={11} className="text-center py-10 text-gray-500"> 
                  No users found. Click "Create New User" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        onAddUser={handleSaveUser as any} 
      />
    </>
  );
};

export default UsersManagement;