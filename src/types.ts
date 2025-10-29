// src/types.ts

// ===================================
// AUTH/ADMIN USER TYPE (Portal Login)
// ===================================
// Roles for users who can log into the ADMIN PORTAL
export type PortalUserRole = 'SuperAdmin' | 'Admin' | 'Editor';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Should be hashed in production
  role: PortalUserRole; // Use the specific portal roles
}

// ===================================
// APPLICATION USER TYPES (Managed Users)
// ===================================
// All possible roles within the application ecosystem
export type AppUserRole = 'SuperAdmin' | 'Admin' | 'Editor' | 'User';

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Should be hashed in production
  role: AppUserRole; // Use the full set of roles

  // Other fields remain the same
  referralCode: string;
  referredBy?: string;
  discountAmount: number | null;
  createdBy: string; // ID of creator
  createdAt: string;
  editedBy?: string;
  editedAt?: string;
  deletedBy?: string; // For soft deletes if implemented later
  deletedAt?: string; // For soft deletes if implemented later
}


// ===================================
// EXERCISE / TASK TYPES (Remain the same)
// ===================================
export type ExerciseType = 'Reading' | 'Writing' | 'Listening' | 'Speaking';
export type TaskType = 'Matching' | 'Filling Blanks' | 'MCQ' | 'QA' | 'Writing';
// ... (BaseTask, Specific Task Interfaces, Task Union, Exercise Interface remain the same) ...
export interface BaseTask { /* ... */ }
export interface MatchingTask extends BaseTask { /* ... */ }
export interface FillingBlanksTask extends BaseTask { /* ... */ }
export interface MCQTask extends BaseTask { /* ... */ }
export interface QATask extends BaseTask { /* ... */ }
export interface WritingTask extends BaseTask { /* ... */ }
export type Task = MatchingTask | FillingBlanksTask | MCQTask | QATask | WritingTask;
export interface Exercise { /* ... */ }