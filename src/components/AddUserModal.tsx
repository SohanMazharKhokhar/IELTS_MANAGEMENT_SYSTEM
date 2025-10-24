// src/components/AddUserModal.tsx

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AppUser, AppUserRole } from '../../types';
import { UserCircleIcon, EmailIcon, LockIcon } from './icons'; 

// Form input type (excluding generated fields)
type UserFormInputs = Pick<AppUser, 'firstName' | 'lastName' | 'email' | 'password' | 'role' | 'referralCode'>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: AppUser | undefined; 
  onAddUser: (data: any, userId?: string) => Promise<boolean>; 
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, editingUser, onAddUser }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormInputs>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'User', // Default to 'User'
      referralCode: '',
    },
  });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const isEditing = !!editingUser;

  useEffect(() => {
    if (isOpen) {
      setSubmissionError(null);
      if (editingUser) {
        // --- LOAD DATA FOR EDITING ---
        reset({
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          password: editingUser.password,
          role: editingUser.role, // Loads the existing role
          referralCode: editingUser.referralCode,
        });
      } else {
        // --- RESET FOR CREATING NEW USER ---
        reset({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'User',
          referralCode: '',
        }); 
      }
    }
  }, [isOpen, reset, editingUser]);

  const onSubmit: SubmitHandler<UserFormInputs> = async (data) => {
    setSubmissionError(null);
    
    // Pass the entire 'data' object and the user ID to the parent handler
    const success = await onAddUser(data, editingUser?.id); 
    
    if (success) {
      onClose();
    } else {
      setSubmissionError('An account with this email already exists.');
    }
  };

  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* The entire form must wrap all fields */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit User' : 'Create New User'}</h2>
          </div>
          
          <div className="p-6 space-y-4">
            {submissionError && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{submissionError}</p>}
            
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className={labelClasses}>First Name</label>
              <input
                id="firstName"
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                className={commonInputClasses}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className={labelClasses}>Last Name</label>
              <input
                id="lastName"
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                className={commonInputClasses}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClasses}>Email Address</label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required', 
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } 
                })}
                className={commonInputClasses}
                placeholder="user@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClasses}>Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: isEditing ? undefined : 'Password is required', 
                  minLength: { value: 6, message: 'Password must be at least 6 characters' } 
                })}
                className={commonInputClasses}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Role (Dropdown) */}
            <div>
              <label htmlFor="role" className={labelClasses}>Role</label>
              <select id="role" {...register('role', { required: true })} className={commonInputClasses}>
                <option value="User">User</option>
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Conditional: Referral Code */}
            {isEditing && (
                <div>
                  <label htmlFor="referralCode" className={labelClasses}>Referral Code</label>
                  <input type="text" id="referralCode" {...register('referralCode')} className={commonInputClasses} placeholder="Optional referral code" />
                </div>
            )}
          </div>

          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
            {/* Cancel Button - MUST be type="button" */}
            <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {/* Save Button - MUST be type="submit" */}
            <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;