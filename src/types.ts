// src/types.ts

// ===================================
// AUTH/ADMIN USER TYPE
// ===================================

export interface User { 
  id: string;
  name: string;
  email: string;
  password: string; 
}

// ===================================
// APPLICATION USER TYPES (For UsersManagement)
// ===================================

export type AppUserRole = 'Admin' | 'Editor' | 'User'; 

export interface AppUser {
  id: string;
  firstName: string; 
  lastName: string;  
  email: string;
  password: string; 
  role: AppUserRole;
  
  referralCode: string;
  referredBy?: string; 
  // --- CHANGED ---
  discountAmount: number | null; // e.g., 10 for 10%, null for no discount
  
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
  // --- CHANGED ---
  blanks: { 
      id: string, 
      textBefore: string, 
      numBlanks: number,   
      textAfter?: string   
  }[];
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