// src/types.ts - Complete and Unified

// ===================================
// USER TYPES
// ===================================

export interface User { // This is the admin portal user (used by useAuth)
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this should be a hash.
}

export type AppUserRole = 'Admin' | 'Editor' | 'User'; // Roles for the application users

export interface AppUser {
  id: string;
  firstName: string; 
  lastName: string;  
  email: string;
  password: string; // In a real app, this should be a hash.
  role: AppUserRole;
  
  // Custom Fields
  referralCode: string;
  referredBy?: string; // Optional ID of the user who referred them
  discounted: boolean;
  
  // Auditing/Metadata fields
  createdBy: string;
  createdAt: string;
  editedBy?: string;
  editedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
}


// ===================================
// EXERCISE / TASK TYPES
// (As provided and confirmed)
// ===================================

export type ExerciseType = 'Reading' | 'Writing' | 'Listening' | 'Speaking';
export type TaskType = 'Matching' | 'Filling Blanks' | 'MCQ' | 'QA' | 'Writing';

export interface BaseTask {
  id: string;
  taskType: TaskType;
  title: string;
  description: string;
  allowedTime: number;
}

export interface MatchingTask extends BaseTask {
  taskType: 'Matching';
  group1: { id: string, value: string }[];
  group2: { id: string, value: string }[];
}

export interface FillingBlanksTask extends BaseTask {
  taskType: 'Filling Blanks';
  maxWordsPerBlank: number;
  blanks: { id: string, value: string }[];
}

export interface MCQTask extends BaseTask {
  taskType: 'MCQ';
  allowMultipleSelections: boolean;
  questions: {
    id: string;
    questionText: string;
    options: { id: string, value: string }[];
  }[];
}

export interface QATask extends BaseTask {
  taskType: 'QA';
  maxWordsPerAnswer: number;
  questions: { id: string, value: string }[];
}

export interface WritingTask extends BaseTask {
  taskType: 'Writing';
  minimumWordCount: number;
}

export type Task = MatchingTask | FillingBlanksTask | MCQTask | QATask | WritingTask;

export interface Exercise {
  id: string;
  exerciseType: ExerciseType;
  title: string;
  description: string;
  allowedTime: number;
  passage?: string;
  imageUrl?: string;
  recordingUrl?: string;
  tasks: Task[];
}