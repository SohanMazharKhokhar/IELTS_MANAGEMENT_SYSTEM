// src/components/AddUserModal.tsx

import React, { useEffect, useState, useMemo } from 'react'; // <-- IMPORT useMemo
import { useForm, SubmitHandler } from 'react-hook-form';
// Import all necessary types from the central types file
import { AppUser, AppUserRole, User, PortalUserRole } from '../types';
import { UserCircleIcon, EmailIcon, LockIcon } from './icons';

/**
 * Helper function to get the numerical level of a role for comparison.
 */
const getRoleLevel = (role: AppUserRole | PortalUserRole | undefined): number => {
    switch (role) {
        case 'SuperAdmin': return 4;
        case 'Admin': return 3;
        case 'Editor': return 2;
        case 'User': return 1;
        default: return 0;
    }
};

// Define all possible AppUser roles
const allAppUserRoles: AppUserRole[] = ['User', 'Editor', 'Admin', 'SuperAdmin'];

// Form input type includes all editable fields
type UserFormInputs = Pick<AppUser, 'firstName' | 'lastName' | 'email' | 'password' | 'role' | 'referralCode' | 'discountAmount'>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: AppUser | undefined;
  onAddUser: (data: any, userId?: string) => Promise<boolean>;
  currentUserRole: PortalUserRole; // Use PortalUserRole for the logged-in user
  currentUserId: string; // <-- ADD currentUserId
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, editingUser, onAddUser, currentUserRole, currentUserId }) => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UserFormInputs>({
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '',
      role: 'User', referralCode: '', discountAmount: null,
    },
  });
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const isEditing = !!editingUser;
  const currentUserLevel = getRoleLevel(currentUserRole);

  // --- FIX: Stabilize assignableRoles with useMemo ---
  // This prevents it from being a new array on every render,
  // which was causing the useEffect hook to re-run and reset the form.
  const assignableRoles = useMemo(() => {
    return allAppUserRoles.filter(role => {
        if (currentUserRole === 'SuperAdmin') return true; // SuperAdmin can assign any role
        // Others can only assign roles strictly below their own level
        return getRoleLevel(role) < currentUserLevel;
    });
  }, [currentUserRole, currentUserLevel]);
  // --------------------------------------------------

  // Check if the user being edited is the current user
  const isEditingSelf = isEditing && editingUser && editingUser.id === currentUserId;

  // Effect to load data or reset form
  useEffect(() => {
     if (isOpen) {
        setSubmissionError(null);
        if (editingUser) {
            // Load existing user data
            reset({
                firstName: editingUser.firstName, lastName: editingUser.lastName, email: editingUser.email,
                password: '', // Clear password on edit
                role: editingUser.role, // Load existing role
                referralCode: editingUser.referralCode, discountAmount: editingUser.discountAmount,
            });
        } else {
             // Reset for creation, default role depends on what's assignable
             reset({
                firstName: '', lastName: '', email: '', password: '',
                role: assignableRoles.includes('User') ? 'User' : assignableRoles[0] || 'User', // Sensible default
                referralCode: '', discountAmount: null,
             });
        }
    }
  }, [isOpen, reset, editingUser, assignableRoles]); // <-- UPDATED dependency array

  // Submit handler (passes data up)
  const onSubmit: SubmitHandler<UserFormInputs> = async (data) => {
     console.log("[AddUserModal] Submitting data:", data);

     // Check if the user is trying to assign a role they aren't allowed to.
     if (!assignableRoles.includes(data.role)) {
        // This is fine *only* if they are editing themselves and keeping their
        // current (unassignable) role.
        const isEditingSelfWithSameRole = isEditingSelf && editingUser && editingUser.role === data.role;

        if (!isEditingSelfWithSameRole) {
             setSubmissionError(`You do not have permission to assign the role '${data.role}'.`);
             return;
        }
     }

     setSubmissionError(null);
     const success = await onAddUser(data, editingUser?.id);
     if (success) onClose();
     else setSubmissionError('An account with this email already exists or another error occurred.');
  };

  // CSS classes
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const errorTextClasses = "text-red-500 text-xs mt-1";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md"> {/* Modal Container */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Modal Header */}
                <div className="p-6 border-b"><h2 className="text-xl font-semibold text-gray-800">{isEditing ? 'Edit User' : 'Create New User'}</h2></div>

                {/* Form Fields */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {submissionError && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{submissionError}</p>}

                    {/* Fields: Name, Email, Pass, Discount */}
                    <div>
                        <label htmlFor="firstName" className={labelClasses}>First Name</label>
                        <input id="firstName" type="text" {...register('firstName', { required: 'First name is required' })} className={commonInputClasses} placeholder="John"/>
                        {errors.firstName && <p className={errorTextClasses}>{errors.firstName.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                        <input id="lastName" type="text" {...register('lastName', { required: 'Last name is required' })} className={commonInputClasses} placeholder="Doe"/>
                        {errors.lastName && <p className={errorTextClasses}>{errors.lastName.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="email" className={labelClasses}>Email Address</label>
                        <input id="email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} className={commonInputClasses} placeholder="user@example.com"/>
                        {errors.email && <p className={errorTextClasses}>{errors.email.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="password" className={labelClasses}>Password {isEditing ? '(Leave blank to keep current)' : ''}</label>
                        <input id="password" type="password" {...register('password', { required: isEditing ? false : 'Password is required', minLength: isEditing ? undefined : { value: 6, message: 'Password must be at least 6 characters' } })} className={commonInputClasses} placeholder="••••••••"/>
                        {errors.password && <p className={errorTextClasses}>{errors.password.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="discountAmount" className={labelClasses}>Discount Amount (%)</label>
                        <input id="discountAmount" type="number" step="0.1" {...register('discountAmount', { setValueAs: (v) => v === '' ? null : parseFloat(v), min: { value: 0, message: 'Min 0%'}, max: { value: 100, message: 'Max 100%'} })} className={commonInputClasses} placeholder="e.g., 10"/>
                        {errors.discountAmount && <p className={errorTextClasses}>{errors.discountAmount.message}</p>}
                    </div>


                    {/* Role Dropdown with Hierarchy Logic */}
                    <div>
                      <label htmlFor="role" className={labelClasses}>Role</label>
                      <select
                          id="role"
                          {...register('role', { required: 'Role is required' })}
                          className={commonInputClasses}
                      >
                        {/* Only show roles the current user can assign */}
                        {assignableRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                        {/* If editing a user whose role is normally unassignable (i.e., YOURSELF), show it as an option */}
                        {isEditingSelf && editingUser && !assignableRoles.includes(editingUser.role) && (
                            <option key={editingUser.role} value={editingUser.role}>{editingUser.role} (Current)</option>
                        )}
                      </select>
                      {errors.role && <p className={errorTextClasses}>{errors.role.message}</p>}
                    </div>

                    {/* Conditional: Referral Code */}
                    {isEditing && (
                        <div>
                         <label htmlFor="referralCode" className={labelClasses}>Referral Code</label>
                         <input type="text" id="referralCode" {...register('referralCode')} className={commonInputClasses} placeholder="Auto-generated or Manual" />
                         {/* Optional validation */}
                        </div>
                    )}
                </div>
                {/* Modal Footer Buttons */}
                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white border border-transparent rounded-md hover:bg-blue-700">{isEditing ? 'Save Changes' : 'Create User'}</button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AddUserModal;
